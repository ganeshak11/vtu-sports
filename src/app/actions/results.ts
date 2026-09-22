'use server';

import { supabase } from '@/lib/supabase';
import { revalidatePath } from 'next/cache';
import { requireRole, AuthError } from '@/lib/auth-guard';

export interface ResultPayload {
  athleteId: string;
  result: number | null;
  status?: 'FINISHED' | 'DNS' | 'DNF' | 'DQ';
}

export interface FieldAttemptPayload {
  athleteId: string;
  attempt1: number | null;
  attempt2: number | null;
  attempt3: number | null;
}

/**
 * Standard submit results (used for generic or single-input manual entries)
 */
export async function submitResults(roundId: string, results: ResultPayload[], heatId?: string) {
  try {
    await requireRole('official', 'admin');
  } catch (e) {
    if (e instanceof AuthError) return { error: e.message };
    throw e;
  }

  if (!roundId || !results || results.length === 0) {
    return { error: 'Invalid payload' };
  }

  // 1. Fetch Round and Event info
  const { data: round, error: roundError } = await supabase
    .from('event_rounds')
    .select(`
      id, event_id, round_type,
      events ( id, measurement_metric, qualification_rules ( id, config ) )
    `)
    .eq('id', roundId)
    .single();

  if (roundError || !round) {
    return { error: 'Round not found' };
  }

  const ev = round.events as any;
  const metric = ev?.measurement_metric; // 'time', 'distance', 'points'
  const qualRule = ev?.qualification_rules?.config;

  // Update each athlete's result and status
  for (const r of results) {
    const isFinished = !r.status || r.status === 'FINISHED';
    const status = r.status || (r.result !== null ? 'FINISHED' : 'DNS');
    const updateData: any = {
      final_result: isFinished ? r.result : null,
      status: status,
      is_dns: status === 'DNS',
      is_dq: status === 'DQ'
    };

    let query = supabase
      .from('event_results')
      .update(updateData)
      .eq('round_id', roundId)
      .eq('profile_id', r.athleteId);

    if (heatId) {
      query = query.eq('heat_id', heatId);
    }

    const { error: updErr } = await query;
    if (updErr) {
      console.error('Result update error:', updErr);
    }
  }

  // Calculate ranks & qualifications
  await recalculateRanks(roundId, metric, qualRule);

  revalidatePath('/referee/results');
  revalidatePath('/admin/events');
  revalidatePath('/leaderboard');
  revalidatePath('/live');

  return { success: true };
}


/**
 * 3-Attempt Entry for Field Events (Shot Put, Discus, Javelin, Long Jump, High Jump, etc.)
 */
export async function submitFieldAttempts(roundId: string, attempts: FieldAttemptPayload[]) {
  try {
    await requireRole('official', 'admin');
  } catch (e) {
    if (e instanceof AuthError) return { error: e.message };
    throw e;
  }

  if (!roundId || !attempts || attempts.length === 0) {
    return { error: 'No attempt data provided' };
  }

  // Fetch Round
  const { data: round, error: roundError } = await supabase
    .from('event_rounds')
    .select(`
      id, event_id, round_type,
      events ( id, measurement_metric, qualification_rules ( id, config ) )
    `)
    .eq('id', roundId)
    .single();

  if (roundError || !round) {
    return { error: 'Round not found' };
  }

  const updates = attempts.map(att => {
    // Calculate best mark among non-null attempts
    const validMarks = [att.attempt1, att.attempt2, att.attempt3].filter(
      (m): m is number => typeof m === 'number' && !isNaN(m) && m > 0
    );
    const bestMark = validMarks.length > 0 ? Math.max(...validMarks) : null;

    return {
      event_id: round.event_id,
      round_id: roundId,
      profile_id: att.athleteId,
      attempt_1: att.attempt1,
      attempt_2: att.attempt2,
      attempt_3: att.attempt3,
      best_mark: bestMark,
      final_result: bestMark,
      status: bestMark !== null ? 'FINISHED' : 'DNS'
    };
  });

  const { error: upsertError } = await supabase
    .from('event_results')
    .upsert(updates, { onConflict: 'round_id,profile_id' });

  if (upsertError) {
    console.error('Field upsert error:', upsertError);
    return { error: 'Failed to record field attempts' };
  }

  // For field events, metric is 'distance' or 'height' where higher is better
  const ev = round.events as any;
  const qualRule = ev?.qualification_rules?.config;
  await recalculateRanks(roundId, 'distance', qualRule);

  revalidatePath('/referee/results');
  revalidatePath('/admin/events');
  revalidatePath('/leaderboard');
  revalidatePath('/live');

  return { 
    success: true, 
    message: `Successfully calculated best marks and ranks for ${attempts.length} athletes.` 
  };
}

/**
 * Photo Finish File Import (Track Events)
 * Parses standard photo finish formats (FinishLynx, Omega LIF, CSV)
 * Format lines:
 * Lane, Bib, Time
 * or Place, Lane, Bib, Time
 */
export async function importPhotoFinishResults(roundId: string, fileContent: string, heatId?: string) {
  try {
    await requireRole('official', 'admin');
  } catch (e) {
    if (e instanceof AuthError) return { error: e.message };
    throw e;
  }

  if (!roundId || !fileContent?.trim()) {
    return { error: 'Empty file content or invalid round' };
  }

  // Fetch Round and all seeded athletes in this round
  const { data: round, error: roundError } = await supabase
    .from('event_rounds')
    .select(`
      id, event_id, round_type,
      events ( id, name, category, measurement_metric, qualification_rules ( id, config ) )
    `)
    .eq('id', roundId)
    .single();

  if (roundError || !round) return { error: 'Round not found' };

  // Fetch seeded event_results for this round (filtered to heatId if provided)
  let seededQuery = supabase
    .from('event_results')
    .select('id, profile_id, heat_id, lane_number, profiles ( id, bib_number, chest_number, sslc_name, full_name )')
    .eq('round_id', roundId);

  if (heatId) {
    seededQuery = seededQuery.eq('heat_id', heatId);
  }

  const { data: seededResults } = await seededQuery;
  const seeded = seededResults || [];

  // Parse lines
  const lines = fileContent.trim().split(/\r?\n/);
  const parsedRecords: { bib?: string; lane?: number; time: number; rawLine: string }[] = [];

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#') || line.toLowerCase().startsWith('lane') || line.toLowerCase().startsWith('place')) {
      continue; // skip headers/comments
    }

    // Split by comma or tab or semicolon
    const parts = line.split(/[,;\t]+/).map(p => p.trim());
    if (parts.length < 2) continue;

    let bib: string | undefined;
    let lane: number | undefined;
    let timeStr: string = '';

    if (parts.length === 2) {
      // Bib, Time or Lane, Time
      bib = parts[0];
      timeStr = parts[1];
    } else if (parts.length === 3) {
      // Lane, Bib, Time
      lane = parseInt(parts[0], 10);
      bib = parts[1];
      timeStr = parts[2];
    } else if (parts.length >= 4) {
      // Place, Lane, Bib, Time
      lane = parseInt(parts[1], 10);
      bib = parts[2];
      timeStr = parts[3];
    }

    // Convert time string to numeric seconds float
    // e.g. "10.45" -> 10.45, "1:52.34" -> 112.34
    let parsedTime: number | null = null;
    if (timeStr.includes(':')) {
      const [m, s] = timeStr.split(':');
      parsedTime = parseFloat(m) * 60 + parseFloat(s);
    } else {
      parsedTime = parseFloat(timeStr);
    }

    if (parsedTime !== null && !isNaN(parsedTime) && parsedTime > 0) {
      parsedRecords.push({ bib, lane, time: parsedTime, rawLine });
    }
  }

  if (parsedRecords.length === 0) {
    return { error: 'No valid timing records found in the uploaded photo finish file.' };
  }

  // Match records to seeded athletes
  const matchedUpdates: { id: string; time: number }[] = [];
  const unmatched: string[] = [];

  for (const record of parsedRecords) {
    let matchedAthleteResult = seeded.find(r => {
      const prof = r.profiles as any;
      if (record.bib && (prof?.bib_number === record.bib || prof?.chest_number === record.bib)) {
        return true;
      }
      if (record.lane && r.lane_number === record.lane) {
        return true;
      }
      return false;
    });

    if (matchedAthleteResult) {
      matchedUpdates.push({
        id: matchedAthleteResult.id,
        time: record.time
      });
    } else {
      unmatched.push(`Bib: ${record.bib || 'N/A'}, Lane: ${record.lane || 'N/A'}, Time: ${record.time}s`);
    }
  }

  if (matchedUpdates.length === 0) {
    return { 
      error: 'Could not match any rows in the file to seeded athletes in this round/heat.',
      details: `Parsed ${parsedRecords.length} lines. Ensure Bib numbers match assigned athletes.`
    };
  }

  // Update in DB by exact ID
  for (const update of matchedUpdates) {
    await supabase.from('event_results').update({
      final_result: update.time,
      status: 'FINISHED',
      is_dns: false,
      is_dq: false
    }).eq('id', update.id);
  }

  // Recalculate Ranks
  const ev = round.events as any;
  const qualRule = ev?.qualification_rules?.config;
  await recalculateRanks(roundId, 'time', qualRule);

  revalidatePath('/referee/results');
  revalidatePath('/admin/events');
  revalidatePath('/leaderboard');
  revalidatePath('/live');

  return {
    success: true,
    message: `Photo finish imported: ${matchedUpdates.length} athletes timed & ranked.`,
    unmatchedCount: unmatched.length,
    unmatchedDetails: unmatched.length > 0 ? unmatched : undefined
  };
}

/**
 * Shared rank and qualifier calculator (IAAF / World Athletics compliant)
 */
async function recalculateRanks(roundId: string, metric: string = 'time', qualRule?: any) {
  const { data: allResults } = await supabase
    .from('event_results')
    .select('id, profile_id, heat_id, final_result, status')
    .eq('round_id', roundId);

  if (!allResults || allResults.length === 0) return;

  // 1. Non-finishers (DNS, DNF, DQ) get null rank and qualified = false
  const nonFinishers = allResults.filter(
    r => r.status === 'DNS' || r.status === 'DNF' || r.status === 'DQ' || r.final_result === null || isNaN(Number(r.final_result))
  );
  for (const nf of nonFinishers) {
    await supabase.from('event_results').update({ rank: null, qualified: false }).eq('id', nf.id);
  }

  // 2. Finished athletes with valid results
  const finished = allResults.filter(
    r => r.final_result !== null && !isNaN(Number(r.final_result)) && r.status !== 'DNS' && r.status !== 'DNF' && r.status !== 'DQ'
  );
  if (finished.length === 0) return;

  const sortMultiplier = metric === 'time' ? 1 : -1;
  finished.sort((a, b) => (Number(a.final_result) - Number(b.final_result)) * sortMultiplier);

  // Overall ranks (1, 2, 3...)
  const rankMap = new Map<string, number>();
  let currentRank = 1;
  for (let i = 0; i < finished.length; i++) {
    if (i > 0 && Number(finished[i - 1].final_result) === Number(finished[i].final_result)) {
      // Tie - maintain previous rank
    } else {
      currentRank = i + 1;
    }
    rankMap.set(finished[i].id, currentRank);
  }

  // Qualification logic
  const qualifiedIds = new Set<string>();

  if (qualRule?.type === 'top_per_heat_and_overall') {
    const topPerHeat = qualRule.top_per_heat || 2;
    const nextBestOverall = qualRule.next_best_overall || 2;

    // Group finished athletes by heat_id
    const heatGroups: Record<string, typeof finished> = {};
    for (const res of finished) {
      const hId = res.heat_id || 'unassigned';
      if (!heatGroups[hId]) heatGroups[hId] = [];
      heatGroups[hId].push(res);
    }

    // Top N per heat automatically qualify (Q)
    for (const hId of Object.keys(heatGroups)) {
      const heatAthletes = heatGroups[hId]; // already sorted
      const topAthletes = heatAthletes.slice(0, topPerHeat);
      for (const a of topAthletes) {
        qualifiedIds.add(a.id);
      }
    }

    // Next fastest overall across remaining athletes qualify on time (q)
    let addedNext = 0;
    for (const res of finished) {
      if (!qualifiedIds.has(res.id) && addedNext < nextBestOverall) {
        qualifiedIds.add(res.id);
        addedNext++;
      }
    }
  } else if (qualRule?.type === 'top_overall') {
    const count = qualRule.count || 8;
    for (let i = 0; i < Math.min(count, finished.length); i++) {
      qualifiedIds.add(finished[i].id);
    }
  }

  // Save updated ranks and qualified status back to DB
  for (const res of finished) {
    await supabase.from('event_results').update({
      rank: rankMap.get(res.id) || null,
      qualified: qualifiedIds.has(res.id)
    }).eq('id', res.id);
  }
}


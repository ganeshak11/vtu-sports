'use server';

import { supabase } from '@/lib/supabase';
import { revalidatePath } from 'next/cache';
import { requireRole, AuthError } from '@/lib/auth-guard';

export interface ResultPayload {
  athleteId: string;
  result: number;
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
export async function submitResults(roundId: string, results: ResultPayload[]) {
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

  const resultsToInsert = results.map(r => ({
    event_id: round.event_id,
    profile_id: r.athleteId,
    final_result: r.result,
    round_id: roundId,
    status: 'FINISHED'
  }));

  // Upsert Results
  const { error: upsertError } = await supabase
    .from('event_results')
    .upsert(resultsToInsert, { onConflict: 'round_id,profile_id' });

  if (upsertError) {
    console.error('Upsert error:', upsertError);
    return { error: 'Failed to save results' };
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
export async function importPhotoFinishResults(roundId: string, fileContent: string) {
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

  // Fetch all existing event_results for this round
  const { data: seededResults } = await supabase
    .from('event_results')
    .select('id, profile_id, lane_number, profiles ( id, bib_number, chest_number, sslc_name, full_name )')
    .eq('round_id', roundId);

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
  const matchedUpdates: any[] = [];
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
        event_id: round.event_id,
        round_id: roundId,
        profile_id: matchedAthleteResult.profile_id,
        final_result: record.time,
        status: 'FINISHED'
      });
    } else {
      unmatched.push(`Bib: ${record.bib || 'N/A'}, Lane: ${record.lane || 'N/A'}, Time: ${record.time}s`);
    }
  }

  if (matchedUpdates.length === 0) {
    return { 
      error: 'Could not match any rows in the file to seeded athletes in this round.',
      details: `Parsed ${parsedRecords.length} lines. Ensure Bib numbers match assigned athletes.`
    };
  }

  // Update in DB
  const { error: upsertErr } = await supabase
    .from('event_results')
    .upsert(matchedUpdates);

  if (upsertErr) {
    console.error('Photo finish upsert error:', upsertErr);
    return { error: 'Failed to record photo finish results' };
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
 * Shared rank and qualifier calculator
 */
async function recalculateRanks(roundId: string, metric: string = 'time', qualRule?: any) {
  const { data: allResults } = await supabase
    .from('event_results')
    .select('id, profile_id, final_result, status')
    .eq('round_id', roundId);

  if (!allResults || allResults.length === 0) return;

  // Filter athletes with a valid result
  const finishResults = allResults.filter(r => r.final_result !== null && !isNaN(r.final_result));

  // Sort logic: 'time': lower is better (ascending). 'distance'/'points': higher is better (descending)
  const sortMultiplier = metric === 'time' ? 1 : -1;
  finishResults.sort((a, b) => (Number(a.final_result) - Number(b.final_result)) * sortMultiplier);

  const updates: any[] = [];
  let currentRank = 1;

  for (let i = 0; i < finishResults.length; i++) {
    const res = finishResults[i];

    if (i > 0 && finishResults[i - 1].final_result === res.final_result) {
      // Tie
    } else {
      currentRank = i + 1;
    }

    let isQualified = false;
    if (qualRule?.type === 'top_overall') {
      const count = qualRule.count || 8;
      if (currentRank <= count) isQualified = true;
    } else if (qualRule?.type === 'top_per_heat_and_overall') {
      const count = (qualRule.top_per_heat || 2) + (qualRule.next_best_overall || 2);
      if (currentRank <= count) isQualified = true;
    }

    updates.push({
      id: res.id,
      rank: currentRank,
      qualified: isQualified
    });
  }

  if (updates.length > 0) {
    await supabase.from('event_results').upsert(updates);
  }
}

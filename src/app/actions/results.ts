'use server';

import { supabase } from '@/lib/supabase';
import { revalidatePath } from 'next/cache';
import { requireRole, AuthError } from '@/lib/auth-guard';

export interface ResultPayload {
  athleteId: string;
  result: number;
}

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

  // 1. Fetch Round and Event info to understand the metric and qualification rules
  const { data: round, error: roundError } = await supabase
    .from('event_rounds')
    .select(`
      id, event_id,
      events ( id, measurement_metric, qualification_rules ( id, config ) )
    `)
    .eq('id', roundId)
    .single();

  if (roundError || !round) {
    return { error: 'Round not found' };
  }

  const ev = round.events as any;
  const metric = ev?.measurement_metric; // 'time', 'distance', 'points'
  const qualRule = ev?.qualification_rules?.config; // e.g., { type: 'top_overall', count: 8 }

  const resultsToInsert = results.map(r => ({
    event_id: round.event_id,
    profile_id: r.athleteId,
    final_result: r.result,
    round_id: roundId
  }));

  // 3. Upsert Results
  const { error: upsertError } = await supabase
    .from('event_results')
    .upsert(resultsToInsert, { onConflict: 'round_id,profile_id' });

  if (upsertError) {
    console.error('Upsert error:', upsertError);
    return { error: 'Failed to save results' };
  }

  // 4. Calculate Qualifications
  // Fetch all results for this round to rank them
  const { data: allResults } = await supabase
    .from('event_results')
    .select('id, profile_id, final_result')
    .eq('round_id', roundId);

  if (allResults && allResults.length > 0 && qualRule) {
    // Sort logic depends on metric
    // time: lower is better. distance/height/points: higher is better
    const sortMultiplier = metric === 'time' ? 1 : -1;

    allResults.sort((a, b) => {
      // Handle nulls (e.g., DNS/DNF)
      if (a.final_result === null && b.final_result === null) return 0;
      if (a.final_result === null) return 1;
      if (b.final_result === null) return -1;
      return (a.final_result - b.final_result) * sortMultiplier;
    });

    // Apply ranking and qualification based on config
    const updates = [];
    let currentRank = 1;

    for (let i = 0; i < allResults.length; i++) {
      const res = allResults[i];
      if (res.final_result === null) continue; // Skip DNS/DNF

      // Handle ties in ranking
      if (i > 0 && allResults[i - 1].final_result === res.final_result) {
        // Same rank as previous
      } else {
        currentRank = i + 1;
      }

      let isQualified = false;

      // Basic support for 'top_overall' rule
      if (qualRule.type === 'top_overall') {
        const count = qualRule.count || 8;
        if (currentRank <= count) {
          isQualified = true;
        }
      } else if (qualRule.type === 'top_per_heat_and_overall') {
        // Simplified fallback since we don't have explicit heats in MVP
        const count = (qualRule.top_per_heat || 2) + (qualRule.next_best_overall || 2);
        if (currentRank <= count) {
          isQualified = true;
        }
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

  revalidatePath('/referee/results');
  revalidatePath('/admin/events');

  return { success: true };
}

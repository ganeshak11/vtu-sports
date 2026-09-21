'use server';

import { supabase } from '@/lib/supabase';

export async function getLiveResults() {
  // Fetch results that have a rank assigned, ordered by created_at descending
  const { data: results, error } = await supabase
    .from('event_results')
    .select(`
      id,
      rank,
      final_result,
      best_mark,
      created_at,
      round:round_id (
        id,
        round_type
      ),
      events:event_id (
        id,
        name,
        category,
        gender,
        measurement_metric
      ),
      profiles:profile_id (
        id,
        sslc_name,
        full_name,
        college_name,
        bib_number
      )
    `)
    .not('rank', 'is', null)
    .order('created_at', { ascending: false })
    .limit(200);

  if (error || !results) {
    console.error('Error fetching live results:', error);
    return { error: 'Failed to fetch live results' };
  }

  // Format result value based on category
  const formatResultValue = (r: any, cat: string) => {
    const mark = r.best_mark ?? r.final_result;
    if (mark === null || mark === undefined) return '-';

    if (cat === 'field') {
      return `${parseFloat(mark).toFixed(2)} m`;
    }
    if (cat === 'combined') {
      return `${Math.round(mark)} pts`;
    }
    // Track / Relay
    const secs = parseFloat(mark);
    if (isNaN(secs)) return `${mark}`;
    if (secs >= 3600) {
      const h = Math.floor(secs / 3600);
      const m = Math.floor((secs % 3600) / 60);
      const s = (secs % 60).toFixed(1);
      return `${h}h ${m}m ${s}s`;
    }
    if (secs >= 60) {
      const m = Math.floor(secs / 60);
      const s = (secs % 60).toFixed(2);
      return `${m}:${s.padStart(5, '0')}`;
    }
    return `${secs.toFixed(2)} s`;
  };

  // Group by event & round
  const eventsMap = new Map();

  results.forEach(r => {
    const ev = r.events as any;
    const rd = r.round as any;
    const prof = r.profiles as any;
    if (!ev) return;

    const roundKey = `${ev.id}_${rd?.id || 'default'}`;
    const roundLabel = rd?.round_type ? rd.round_type.toUpperCase() : 'FINAL';
    
    if (!eventsMap.has(roundKey)) {
      eventsMap.set(roundKey, {
        id: roundKey,
        name: `${ev.name} · ${roundLabel}`,
        rawName: ev.name,
        roundType: roundLabel,
        category: ev.category,
        gender: ev.gender,
        updated_at: r.created_at,
        results: []
      });
    }

    const formattedValue = formatResultValue(r, ev.category);
    const athleteLabel = prof ? (prof.sslc_name || prof.full_name) : 'Athlete';
    const bibBadge = prof?.bib_number ? ` (#${prof.bib_number})` : '';

    eventsMap.get(roundKey).results.push({
      id: r.id,
      rank: r.rank,
      result_value: formattedValue,
      athlete_name: `${athleteLabel}${bibBadge}`,
      college_name: prof?.college_name || 'N/A'
    });
  });

  // Convert map to array and sort results inside each event by rank ascending
  const groupedEvents = Array.from(eventsMap.values()).map(ev => {
    ev.results.sort((a: any, b: any) => a.rank - b.rank);
    return ev;
  });

  return { data: groupedEvents };
}


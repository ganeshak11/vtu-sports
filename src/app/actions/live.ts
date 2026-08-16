'use server';

import { supabase } from '@/lib/supabase';

export async function getLiveResults() {
  // Fetch results that have a rank, ordered by updated_at or rank
  // To keep it simple and grouped, let's fetch events that have at least one ranked result
  const { data: results, error } = await supabase
    .from('event_results')
    .select(`
      id,
      rank,
      result_value,
      updated_at,
      events (
        id,
        name,
        category,
        gender
      ),
      profiles (
        first_name,
        last_name,
        college_name
      )
    `)
    .not('rank', 'is', null)
    .order('updated_at', { ascending: false })
    .limit(50);

  if (error || !results) {
    console.error('Error fetching live results:', error);
    return { error: 'Failed to fetch live results' };
  }

  // Group by event
  const eventsMap = new Map();

  results.forEach(r => {
    const ev = r.events as any;
    if (!ev) return;
    
    if (!eventsMap.has(ev.id)) {
      eventsMap.set(ev.id, {
        id: ev.id,
        name: ev.name,
        category: ev.category,
        gender: ev.gender,
        updated_at: r.updated_at, // Use the most recent update time for this event
        results: []
      });
    }

    eventsMap.get(ev.id).results.push({
      id: r.id,
      rank: r.rank,
      result_value: r.result_value,
      athlete_name: `${(r.profiles as any)?.first_name} ${(r.profiles as any)?.last_name}`,
      college_name: (r.profiles as any)?.college_name
    });
  });

  // Convert map to array and sort results inside each event by rank
  const groupedEvents = Array.from(eventsMap.values()).map(ev => {
    ev.results.sort((a: any, b: any) => a.rank - b.rank);
    return ev;
  });

  // Sort events by most recently updated
  groupedEvents.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());

  return { data: groupedEvents };
}

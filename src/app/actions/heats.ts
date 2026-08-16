'use server';

import { supabase } from '@/lib/supabase';
import { requireRole, AuthError } from '@/lib/auth-guard';
import { revalidatePath } from 'next/cache';

// Shuffle array using Fisher-Yates
function shuffleArray<T>(array: T[]): T[] {
  const newArr = [...array];
  for (let i = newArr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
  }
  return newArr;
}

export async function generateHeats(eventId: string) {
  try {
    await requireRole('admin');
  } catch (e) {
    if (e instanceof AuthError) return { error: e.message };
    throw e;
  }

  if (!eventId) {
    return { error: 'Invalid Event ID' };
  }

  // 1. Fetch Event and verify it's a Track event
  const { data: event, error: eventError } = await supabase
    .from('events')
    .select('id, category')
    .eq('id', eventId)
    .single();

  if (eventError || !event) return { error: 'Event not found' };
  if (event.category !== 'track') return { error: 'Heats can only be generated for track events.' };

  // 2. Fetch the First Round of the event
  const { data: rounds, error: roundError } = await supabase
    .from('event_rounds')
    .select('id')
    .eq('event_id', eventId)
    .order('sequence_number', { ascending: true })
    .limit(1);

  if (roundError || !rounds || rounds.length === 0) {
    return { error: 'No rounds found for this event. Schedule the event first.' };
  }
  const roundId = rounds[0].id;

  // 3. Fetch all registered athletes with their colleges
  const { data: registrations, error: regError } = await supabase
    .from('event_registrations')
    .select(`
      athlete_id,
      profiles ( college_name )
    `)
    .eq('event_id', eventId);

  if (regError || !registrations || registrations.length === 0) {
    return { error: 'No athletes registered for this event.' };
  }

  // Group by college
  const collegeMap: Record<string, string[]> = {};
  registrations.forEach(r => {
    const athId = r.athlete_id;
    const colName = (r.profiles as any)?.college_name || 'Unknown';
    if (!collegeMap[colName]) collegeMap[colName] = [];
    collegeMap[colName].push(athId);
  });

  // Sort colleges by number of athletes (descending)
  const sortedColleges = Object.keys(collegeMap).sort((a, b) => collegeMap[b].length - collegeMap[a].length);

  // 4. Calculate total heats (max 8 per heat)
  const totalAthletes = registrations.length;
  const totalHeats = Math.ceil(totalAthletes / 8);

  if (totalHeats === 0) return { error: 'No athletes to generate heats for.' };

  // Initialize heats
  const heats: { id: string; name: string; athletes: string[] }[] = Array.from({ length: totalHeats }, (_, i) => ({
    id: crypto.randomUUID(),
    name: `Heat ${i + 1}`,
    athletes: []
  }));

  // 5. Distribute athletes across heats
  for (const college of sortedColleges) {
    const athList = shuffleArray(collegeMap[college]);
    
    for (const ath of athList) {
      // Find the best heat to put them in.
      // Priority 1: Heat has < 8 people AND does NOT have someone from this college.
      // Priority 2: Heat has < 8 people.
      let bestHeat = -1;
      let fallbackHeat = -1;
      let minAthletesInValidHeat = 999;
      let minAthletesInFallbackHeat = 999;

      for (let i = 0; i < heats.length; i++) {
        const heat = heats[i];
        if (heat.athletes.length >= 8) continue; // Heat is full

        // Check if someone from the same college is already in this heat
        const hasCollegeMate = heat.athletes.some(hAthId => {
          // find their college
          const hAth = registrations.find(r => r.athlete_id === hAthId);
          return (hAth?.profiles as any)?.college_name === college;
        });

        if (!hasCollegeMate) {
          if (heat.athletes.length < minAthletesInValidHeat) {
            bestHeat = i;
            minAthletesInValidHeat = heat.athletes.length;
          }
        }

        if (heat.athletes.length < minAthletesInFallbackHeat) {
          fallbackHeat = i;
          minAthletesInFallbackHeat = heat.athletes.length;
        }
      }

      // Assign to the best valid heat. If none valid, fallback to any non-full heat.
      if (bestHeat !== -1) {
        heats[bestHeat].athletes.push(ath);
      } else if (fallbackHeat !== -1) {
        heats[fallbackHeat].athletes.push(ath);
      } else {
        // Should theoretically never happen unless logic is flawed
        return { error: 'Failed to distribute all athletes due to capacity constraints.' };
      }
    }
  }

  // 6. DB Transaction (Clean up old heats/results, Insert new)
  // Delete old heats (results cascade if FK is set, but we also linked results to round_id so let's delete results for round_id)
  await supabase.from('event_heats').delete().eq('round_id', roundId);
  await supabase.from('event_results').delete().eq('round_id', roundId);

  // Insert new heats
  const heatsToInsert = heats.map(h => ({
    id: h.id,
    round_id: roundId,
    heat_name: h.name
  }));
  const { error: heatInsertError } = await supabase.from('event_heats').insert(heatsToInsert);
  if (heatInsertError) return { error: 'Failed to save generated heats.' };

  // Generate results payload (assign random lanes 1-8)
  const resultsToInsert: any[] = [];
  
  for (const heat of heats) {
    const lanes = shuffleArray([1, 2, 3, 4, 5, 6, 7, 8].slice(0, heat.athletes.length));
    
    heat.athletes.forEach((athId, idx) => {
      resultsToInsert.push({
        round_id: roundId,
        event_id: eventId,
        heat_id: heat.id,
        profile_id: athId,
        lane_number: lanes[idx]
      });
    });
  }

  const { error: resultInsertError } = await supabase.from('event_results').insert(resultsToInsert);
  if (resultInsertError) return { error: 'Failed to bind athletes to heats/lanes.' };

  revalidatePath('/admin/events');
  revalidatePath('/athlete/events');

  return { success: true, message: `Successfully generated ${totalHeats} heats for ${totalAthletes} athletes.` };
}

export async function getHeatsForEvent(eventId: string) {
  if (!eventId) return { error: 'Invalid Event ID' };

  // Get the first round id
  const { data: rounds } = await supabase
    .from('event_rounds')
    .select('id')
    .eq('event_id', eventId)
    .order('sequence_number', { ascending: true })
    .limit(1);

  if (!rounds || rounds.length === 0) return { error: 'No round found' };
  const roundId = rounds[0].id;

  // Get heats for this round
  const { data: heats, error: heatsError } = await supabase
    .from('event_heats')
    .select('id, heat_name')
    .eq('round_id', roundId)
    .order('heat_name');

  if (heatsError || !heats) return { error: 'Could not fetch heats' };

  // Get athletes in these heats via event_results
  const heatIds = heats.map(h => h.id);
  if (heatIds.length === 0) return { heats: [] };

  const { data: results, error: resultsError } = await supabase
    .from('event_results')
    .select(`
      heat_id,
      lane_number,
      profiles ( chest_number, college_name )
    `)
    .in('heat_id', heatIds);

  if (resultsError) return { error: 'Could not fetch heat assignments' };

  const formattedHeats = heats.map(heat => {
    const athletesInHeat = (results || [])
      .filter(r => r.heat_id === heat.id)
      .map(r => ({
        lane_number: r.lane_number,
        chest_number: (r.profiles as any)?.chest_number,
        college_name: (r.profiles as any)?.college_name
      }))
      .sort((a, b) => (a.lane_number || 0) - (b.lane_number || 0));

    return {
      id: heat.id,
      name: heat.heat_name,
      athletes: athletesInHeat
    };
  });

  return { heats: formattedHeats };
}

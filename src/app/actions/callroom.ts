'use server';

import { supabase } from '@/lib/supabase';
import { revalidatePath } from 'next/cache';
import { requireRole, AuthError } from '@/lib/auth-guard';

export async function checkInAthlete(chestNumber: string, roundId: string) {
  try {
    // Both referee and admin can use Call Room
    await requireRole('official', 'admin');
  } catch (e) {
    if (e instanceof AuthError) return { error: e.message };
    throw e;
  }

  if (!chestNumber || !roundId) {
    return { error: 'Missing Chest Number or Round selection' };
  }

  // 1. Fetch Profile
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('id, full_name, college_name, gender')
    .eq('chest_number', chestNumber.trim().toUpperCase())
    .single();

  if (profileError || !profile) {
    return { error: 'Athlete not found!' };
  }

  // 2. Fetch Round & Event info to check registration and gender
  const { data: round, error: roundError } = await supabase
    .from('event_rounds')
    .select(`
      id, 
      event_id,
      events ( name, gender )
    `)
    .eq('id', roundId)
    .single();

  if (roundError || !round) {
    return { error: 'Round not found!' };
  }

  const ev = round.events as any;
  const eventGender = ev?.gender;
  if (eventGender !== 'mixed' && profile.gender !== eventGender) {
    return { error: `Gender mismatch. This event is for ${eventGender}.` };
  }

  // 3. Verify Registration
  const { data: registration } = await supabase
    .from('event_registrations')
    .select('id')
    .eq('athlete_id', profile.id)
    .eq('event_id', round.event_id)
    .single();

  if (!registration) {
    return { 
      error: 'Not Registered!', 
      details: `${profile.full_name} is not registered for ${ev?.name}.` 
    };
  }

  // 4. Upsert Call Room Log (using the unique constraint on athlete_id, round_id)
  const { error: insertError } = await supabase
    .from('call_room_logs')
    .upsert({
      athlete_id: profile.id,
      round_id: roundId,
      status: 'reported'
    }, { onConflict: 'athlete_id,round_id' });

  if (insertError) {
    console.error('Insert Error:', insertError);
    return { error: 'Failed to record check-in' };
  }

  revalidatePath('/referee');

  return { success: true, profile };
}

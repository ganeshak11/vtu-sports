'use server';

import { supabase } from '@/lib/supabase';
import { revalidatePath } from 'next/cache';
import { requireRole, AuthError } from '@/lib/auth-guard';

export async function checkIntoCallRoom(chestNumber: string, eventId: string) {
  try {
    await requireRole('official');
  } catch (e) {
    if (e instanceof AuthError) return { error: e.message };
    throw e;
  }

  if (!chestNumber || !eventId) return { error: 'Invalid input' };

  // 1. Verify Athlete exists
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('id, full_name, college_name')
    .eq('chest_number', chestNumber.trim().toUpperCase())
    .single();

  if (profileError || !profile) {
    return { error: 'Athlete not found!' };
  }

  // 2. Verify Athlete is registered for this event
  const { data: registration } = await supabase
    .from('event_registrations')
    .select('id')
    .eq('athlete_id', profile.id)
    .eq('event_id', eventId)
    .single();

  if (!registration) {
    return { 
      error: 'Not Registered!', 
      details: 'This athlete is NOT registered for this event.',
      profile
    };
  }

  // 3. Check if already checked into call room
  const { data: existingLog } = await supabase
    .from('call_room_logs')
    .select('id, checked_in_at')
    .eq('athlete_id', profile.id)
    .eq('event_id', eventId)
    .single();

  if (existingLog) {
    return { 
      error: 'Already Checked In!', 
      details: `Checked in at ${new Date(existingLog.checked_in_at).toLocaleTimeString()}`,
      profile
    };
  }

  // 4. Register Check-in
  const { error: insertError } = await supabase
    .from('call_room_logs')
    .insert({
      athlete_id: profile.id,
      event_id: eventId
    });

  if (insertError) {
    console.error('Insert Error:', insertError);
    return { error: 'Failed to record check-in' };
  }

  revalidatePath('/athlete/events');
  revalidatePath('/referee');

  return { success: true, profile };
}

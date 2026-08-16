'use server';

import { supabase } from '@/lib/supabase';
import { revalidatePath } from 'next/cache';
import { requireRole, AuthError } from '@/lib/auth-guard';

export async function scanWardenCheckIn(chestNumber: string, accommodationId: string) {
  try {
    const session = await requireRole('warden');
    // Verify the warden is scanning for their OWN hostel
    if (session.accommodationId !== accommodationId) {
      return { error: 'You can only scan check-ins for your assigned hostel.' };
    }
  } catch (e) {
    if (e instanceof AuthError) return { error: e.message };
    throw e;
  }

  if (!chestNumber || !accommodationId) return { error: 'Invalid input' };

  // 1. Verify Athlete exists
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('id, full_name, college_name, accommodation_id, room_number, arrival_status')
    .eq('chest_number', chestNumber.trim().toUpperCase())
    .single();

  if (profileError || !profile) {
    return { error: 'Athlete not found!' };
  }

  // 2. Verify Assignment
  if (profile.accommodation_id !== accommodationId) {
    return { 
      error: 'Wrong Hostel!', 
      details: 'This athlete is NOT assigned to this hostel.',
      profile
    };
  }

  // 3. Verify they aren't already checked in
  if (profile.arrival_status === 'checked_in') {
    return { 
      error: 'Already Checked In!', 
      details: `Room ${profile.room_number}`,
      profile
    };
  }

  // 4. Update Status to checked_in
  const { error: updateError } = await supabase
    .from('profiles')
    .update({ arrival_status: 'checked_in' })
    .eq('id', profile.id);

  if (updateError) {
    console.error('Update Error:', updateError);
    return { error: 'Failed to update check-in status' };
  }

  revalidatePath('/warden');
  revalidatePath('/athlete/accommodation');

  return { success: true, profile };
}

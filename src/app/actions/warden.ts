'use server';

import { supabase } from '@/lib/supabase';
import { revalidatePath } from 'next/cache';
import { requireRole, AuthError } from '@/lib/auth-guard';

export async function scanWardenCheckIn(identifier: string, accommodationId?: string) {
  try {
    await requireRole('warden', 'admin');
  } catch (e) {
    if (e instanceof AuthError) return { error: e.message };
    throw e;
  }

  if (!identifier?.trim()) return { error: 'Please scan a valid QR code or enter Bib / ID' };

  const cleanId = identifier.trim();

  // 1. Fetch Athlete by id, bib_number, or chest_number
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select(`
      id,
      sslc_name,
      full_name,
      college_name,
      gender,
      bib_number,
      chest_number,
      payment_status,
      accreditation_status,
      accommodation_checked_in,
      accommodation_checked_in_at
    `)
    .or(`id.eq.${cleanId.length === 36 ? cleanId : '00000000-0000-0000-0000-000000000000'},bib_number.eq.${cleanId},chest_number.eq.${cleanId}`)
    .maybeSingle();

  if (profileError || !profile) {
    return { error: 'Athlete not found in registry!' };
  }

  // 2. Verify Payment is Confirmed
  if (profile.payment_status !== 'CONFIRMED') {
    return {
      error: 'Unconfirmed Registration',
      details: `${profile.sslc_name || profile.full_name} has pending registration dues.`
    };
  }

  // 3. Check if already checked in (Single-tap accommodation check-in)
  if (profile.accommodation_checked_in) {
    const checkedAt = profile.accommodation_checked_in_at 
      ? new Date(profile.accommodation_checked_in_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      : 'Earlier';
    return { 
      alreadyCheckedIn: true,
      error: 'Already Checked In!', 
      details: `Checked in at ${checkedAt}`,
      profile: {
        id: profile.id,
        name: profile.sslc_name || profile.full_name,
        college: profile.college_name,
        bibNumber: profile.bib_number || profile.chest_number || 'N/A',
        gender: profile.gender
      }
    };
  }

  // 4. Update Status (NO room numbers, NO transit tracking)
  const now = new Date().toISOString();
  const { error: updateError } = await supabase
    .from('profiles')
    .update({ 
      accommodation_checked_in: true,
      accommodation_checked_in_at: now,
      arrival_status: 'checked_in'
    })
    .eq('id', profile.id);

  if (updateError) {
    console.error('Accommodation Check-in Error:', updateError);
    return { error: 'Failed to update check-in status' };
  }

  revalidatePath('/warden');
  revalidatePath('/admin/accommodations');
  revalidatePath('/admin');

  return { 
    success: true, 
    message: 'Accommodation Check-In Confirmed',
    profile: {
      id: profile.id,
      name: profile.sslc_name || profile.full_name,
      college: profile.college_name,
      bibNumber: profile.bib_number || profile.chest_number || 'N/A',
      gender: profile.gender,
      checkedInAt: new Date(now).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  };
}

export async function toggleAccommodationCheckIn(athleteId: string, checkedIn: boolean) {
  try {
    await requireRole('admin', 'warden');
  } catch (e) {
    if (e instanceof AuthError) return { error: e.message };
    throw e;
  }

  const now = checkedIn ? new Date().toISOString() : null;
  const { error } = await supabase
    .from('profiles')
    .update({
      accommodation_checked_in: checkedIn,
      accommodation_checked_in_at: now,
      arrival_status: checkedIn ? 'checked_in' : 'registered'
    })
    .eq('id', athleteId);

  if (error) {
    return { error: 'Failed to update accommodation status' };
  }

  revalidatePath('/admin/accommodations');
  revalidatePath('/warden');
  return { success: true };
}

'use server';

import { supabase } from '@/lib/supabase';
import { requireRole, AuthError } from '@/lib/auth-guard';
import { revalidatePath } from 'next/cache';

export async function accreditAthlete(identifier: string) {
  try {
    await requireRole('admin', 'official');
  } catch (e) {
    if (e instanceof AuthError) return { error: e.message };
    throw e;
  }

  if (!identifier?.trim()) {
    return { error: 'Please scan a valid QR code or enter an Athlete ID / Bib Number.' };
  }

  const cleanId = identifier.trim();

  // Try matching by id, bib_number, or chest_number
  const { data: athlete, error: fetchErr } = await supabase
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
      accredited_at,
      ev1:events!event1_id(name),
      ev2:events!event2_id(name),
      is_relay,
      is_half_marathon
    `)
    .or(`id.eq.${cleanId.length === 36 ? cleanId : '00000000-0000-0000-0000-000000000000'},bib_number.eq.${cleanId},chest_number.eq.${cleanId}`)
    .maybeSingle();

  if (fetchErr || !athlete) {
    return { error: 'Athlete not found in registry.' };
  }

  if (athlete.payment_status !== 'CONFIRMED') {
    return { 
      error: 'Unconfirmed Registration', 
      details: `${athlete.sslc_name || athlete.full_name} has pending payment fees. Cannot accredit.` 
    };
  }

  if (athlete.accreditation_status === 'ACCREDITED') {
    return {
      alreadyAccredited: true,
      message: 'Already Accredited',
      athlete: {
        id: athlete.id,
        name: athlete.sslc_name || athlete.full_name,
        college: athlete.college_name,
        bibNumber: athlete.bib_number || athlete.chest_number || 'TBD',
        accreditedAt: athlete.accredited_at ? new Date(athlete.accredited_at).toLocaleTimeString() : 'Earlier'
      }
    };
  }

  // Update to ACCREDITED
  const now = new Date().toISOString();
  const { error: updateErr } = await supabase
    .from('profiles')
    .update({
      accreditation_status: 'ACCREDITED',
      accredited_at: now
    })
    .eq('id', athlete.id);

  if (updateErr) {
    console.error('Accreditation update error:', updateErr);
    return { error: 'Failed to record accreditation status' };
  }

  revalidatePath('/admin/accreditation');
  revalidatePath('/admin/athletes');
  revalidatePath('/admin');

  return {
    success: true,
    message: 'Accreditation Successful! Issue physical ID card & Bib.',
    athlete: {
      id: athlete.id,
      name: athlete.sslc_name || athlete.full_name,
      college: athlete.college_name,
      bibNumber: athlete.bib_number || athlete.chest_number || 'TBD',
      gender: athlete.gender,
      event1: (athlete.ev1 as any)?.name,
      event2: (athlete.ev2 as any)?.name,
      isRelay: athlete.is_relay,
      isHalfMarathon: athlete.is_half_marathon
    }
  };
}

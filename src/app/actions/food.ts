'use server';

import { supabase } from '@/lib/supabase';
import { revalidatePath } from 'next/cache';
import { requireRole, AuthError } from '@/lib/auth-guard';

export async function redeemFoodPass(identifier: string, mealType: string) {
  try {
    await requireRole('food_volunteer', 'admin', 'official');
  } catch (e) {
    if (e instanceof AuthError) return { error: e.message };
    throw e;
  }

  if (!identifier?.trim() || !mealType) {
    return { error: 'Invalid input. Please provide athlete identifier and meal type.' };
  }

  const cleanId = identifier.trim();

  // 1. Verify Athlete exists by id, bib_number, or chest_number
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('id, full_name, sslc_name, college_name, bib_number, chest_number, payment_status, accreditation_status')
    .or(`id.eq.${cleanId.length === 36 ? cleanId : '00000000-0000-0000-0000-000000000000'},bib_number.eq.${cleanId},chest_number.eq.${cleanId}`)
    .maybeSingle();

  if (profileError || !profile) {
    return { error: 'Athlete not found in registry!' };
  }

  // 2. Verify Payment is Confirmed
  if (profile.payment_status !== 'CONFIRMED') {
    return { 
      error: 'Unconfirmed Registration', 
      details: `${profile.sslc_name || profile.full_name} has pending registration fees.` 
    };
  }

  // 3. Check if already consumed for this specific meal
  const { data: existingLog } = await supabase
    .from('food_logs')
    .select('id, consumed_at')
    .eq('athlete_id', profile.id)
    .eq('meal_type', mealType)
    .maybeSingle();

  if (existingLog) {
    const claimTime = new Date(existingLog.consumed_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return { 
      alreadyClaimed: true,
      error: 'Already Claimed!', 
      details: `Claimed for ${mealType.replace('_', ' ').toUpperCase()} at ${claimTime}`,
      profile: {
        id: profile.id,
        name: profile.sslc_name || profile.full_name,
        college: profile.college_name,
        bibNumber: profile.bib_number || profile.chest_number || 'N/A'
      }
    };
  }

  // 4. Register Consumption
  const now = new Date().toISOString();
  const { error: insertError } = await supabase
    .from('food_logs')
    .insert({
      athlete_id: profile.id,
      meal_type: mealType,
      consumed_at: now
    });

  if (insertError) {
    console.error('Insert Food Log Error:', insertError);
    return { error: 'Failed to record meal redemption' };
  }

  revalidatePath('/volunteer');
  revalidatePath('/admin/food');
  revalidatePath('/athlete');

  return { 
    success: true, 
    message: `Meal Authorized: ${mealType.replace('_', ' ').toUpperCase()}`,
    profile: {
      id: profile.id,
      name: profile.sslc_name || profile.full_name,
      college: profile.college_name,
      bibNumber: profile.bib_number || profile.chest_number || 'N/A',
      consumedAt: new Date(now).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  };
}

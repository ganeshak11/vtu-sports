'use server';

import { supabase } from '@/lib/supabase';
import { revalidatePath } from 'next/cache';
import { requireRole, AuthError } from '@/lib/auth-guard';
import { validateMealTime } from '@/lib/event-constants';

export async function redeemFoodPass(chestNumber: string, mealType: string) {
  try {
    await requireRole('food_volunteer');
  } catch (e) {
    if (e instanceof AuthError) return { error: e.message };
    throw e;
  }

  if (!chestNumber || !mealType) return { error: 'Invalid input' };

  // Enforce strict time window
  const timeCheck = validateMealTime(mealType);
  if (!timeCheck.valid) {
    return { error: 'Time Violation', details: timeCheck.error };
  }

  // 1. Verify Athlete exists
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('id, full_name, college_name')
    .eq('chest_number', chestNumber.trim().toUpperCase())
    .single();

  if (profileError || !profile) {
    return { error: 'Athlete not found!' };
  }

  // 2. Check if already consumed
  const { data: existingLog } = await supabase
    .from('food_logs')
    .select('id, consumed_at')
    .eq('athlete_id', profile.id)
    .eq('meal_type', mealType)
    .single();

  if (existingLog) {
    return { 
      error: 'Meal Already Consumed!', 
      details: `Claimed on ${new Date(existingLog.consumed_at).toLocaleTimeString()}`,
      profile
    };
  }

  // 3. Register Consumption
  const { error: insertError } = await supabase
    .from('food_logs')
    .insert({
      athlete_id: profile.id,
      meal_type: mealType
    });

  if (insertError) {
    console.error('Insert Error:', insertError);
    return { error: 'Failed to record meal' };
  }

  revalidatePath('/athlete');
  revalidatePath('/volunteer');

  return { success: true, profile };
}

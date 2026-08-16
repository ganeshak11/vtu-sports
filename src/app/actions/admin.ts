'use server';

import { supabase } from '@/lib/supabase';
import { revalidatePath } from 'next/cache';
import { requireRole, AuthError } from '@/lib/auth-guard';

export async function assignRoom(athleteId: string, accommodationId: string, roomNumber: string) {
  try {
    await requireRole('admin');
  } catch (e) {
    if (e instanceof AuthError) return { error: e.message };
    throw e;
  }

  if (!athleteId || !accommodationId || !roomNumber) {
    return { error: 'Missing required fields' };
  }

  const { data, error } = await supabase.rpc('assign_accommodation', {
    p_athlete_id: athleteId,
    p_accommodation_id: accommodationId,
    p_room_number: roomNumber.trim()
  });

  if (error) {
    console.error('RPC Error:', error);
    return { error: 'Database update failed' };
  }

  // The RPC returns a JSON object like { success: false, error: "..." }
  if (data && !data.success) {
    return { error: data.error };
  }

  revalidatePath('/admin/accommodations');
  return { success: true };
}

export async function createDynamicEvent(formData: FormData) {
  try {
    await requireRole('admin');
  } catch (e) {
    if (e instanceof AuthError) return { error: e.message };
    throw e;
  }

  const name = formData.get('name') as string;
  const code = formData.get('code') as string;
  const category = formData.get('category') as string;
  const gender = formData.get('gender') as string;
  const measurement_metric = formData.get('measurement_metric') as string;
  const qualification_rule_id = formData.get('qualification_rule_id') as string;
  const lanes_required = formData.get('lanes_required') ? parseInt(formData.get('lanes_required') as string) : null;
  const rounds = formData.getAll('rounds') as string[];

  if (!name || !code) return { error: 'Missing name or code' };

  // 1. Insert Event
  const { data: eventData, error: eventError } = await supabase
    .from('events')
    .insert({
      name,
      code,
      category,
      gender,
      measurement_metric,
      qualification_rule_id,
      lanes_required,
      status: 'upcoming'
    })
    .select('id')
    .single();

  if (eventError || !eventData) {
    console.error(eventError);
    return { error: 'Failed to create event. Code must be unique.' };
  }

  // 2. Insert Rounds Configuration
  if (rounds.length > 0) {
    const roundsToInsert = rounds.map((r, index) => ({
      event_id: eventData.id,
      round_type: r,
      sequence_number: index + 1
    }));
    
    await supabase.from('event_rounds').insert(roundsToInsert);
  }

  revalidatePath('/admin/events');
  return { success: true };
}

export async function scheduleEventRound(roundId: string, scheduledTime: string | null, location: string | null) {
  try {
    await requireRole('admin');
  } catch (e) {
    if (e instanceof AuthError) return { error: e.message };
    throw e;
  }

  if (!roundId) return { error: 'Missing round ID' };

  const { error } = await supabase
    .from('event_rounds')
    .update({
      scheduled_time: scheduledTime || null,
      location: location || null
    })
    .eq('id', roundId);

  if (error) {
    console.error('Error scheduling round:', error);
    return { error: 'Database update failed' };
  }

  revalidatePath('/admin/events');
  revalidatePath('/athlete');
  return { success: true };
}

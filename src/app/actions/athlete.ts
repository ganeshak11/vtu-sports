'use server';

import { supabase } from '@/lib/supabase';
import { revalidatePath } from 'next/cache';
import { requireRole, AuthError } from '@/lib/auth-guard';

export async function updateArrivalStatus(profileId: string, status: 'not_started' | 'on_transit' | 'arrived') {
  try {
    const session = await requireRole('athlete');
    // Verify the athlete is updating their OWN profile
    if (session.profileId !== profileId) {
      return { error: 'You can only update your own arrival status.' };
    }
  } catch (e) {
    if (e instanceof AuthError) return { error: e.message };
    throw e;
  }

  if (!profileId) return { error: 'Invalid profile ID' };

  const validStatuses = ['not_started', 'on_transit', 'arrived'];
  if (!validStatuses.includes(status)) {
    return { error: 'Invalid status value.' };
  }

  const { error } = await supabase
    .from('profiles')
    .update({ arrival_status: status })
    .eq('id', profileId);

  if (error) {
    console.error('Update Status Error:', error);
    return { error: 'Failed to update status' };
  }

  revalidatePath('/athlete/accommodation');
  revalidatePath('/admin/arrivals');
  
  return { success: true };
}

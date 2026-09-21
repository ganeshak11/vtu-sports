'use server';

import { supabase } from '@/lib/supabase';
import { revalidatePath } from 'next/cache';
import { requireRole, AuthError } from '@/lib/auth-guard';

export type CallRoomStatus = 'NOT_REPORTED' | 'REPORTED' | 'DNS' | 'STARTED' | 'FINISHED' | 'DQ';

/**
 * Scan / check-in athlete at the Call Room
 */
export async function checkInAthlete(identifier: string, roundId: string) {
  try {
    await requireRole('official', 'admin');
  } catch (e) {
    if (e instanceof AuthError) return { error: e.message };
    throw e;
  }

  if (!identifier?.trim() || !roundId) {
    return { error: 'Missing Athlete Identifier or Round selection' };
  }

  const cleanId = identifier.trim();

  // 1. Fetch Profile by id, bib_number, or chest_number
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('id, full_name, sslc_name, college_name, college_id, gender, bib_number, chest_number, accreditation_status, payment_status')
    .or(`id.eq.${cleanId.length === 36 ? cleanId : '00000000-0000-0000-0000-000000000000'},bib_number.eq.${cleanId},chest_number.eq.${cleanId}`)
    .maybeSingle();

  if (profileError || !profile) {
    return { error: 'Athlete not found in registry!' };
  }

  // Check Accreditation
  if (profile.accreditation_status !== 'ACCREDITED') {
    return { 
      error: 'Not Accredited', 
      details: `${profile.sslc_name || profile.full_name} has not completed physical accreditation at the Accreditation Desk.` 
    };
  }

  // 2. Fetch Round & Event info
  const { data: round, error: roundError } = await supabase
    .from('event_rounds')
    .select(`
      id, 
      event_id,
      round_type,
      events ( id, name, gender )
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

  // 3. Upsert Call Room Log with REPORTED status
  const now = new Date().toISOString();
  const { error: logError } = await supabase
    .from('call_room_logs')
    .upsert({
      athlete_id: profile.id,
      round_id: roundId,
      status: 'REPORTED',
      reported_at: now
    }, { onConflict: 'athlete_id,round_id' });

  if (logError) {
    console.error('Call room log error:', logError);
    return { error: 'Failed to record call room check-in' };
  }

  // 4. Also sync status in event_results
  await supabase
    .from('event_results')
    .update({ status: 'REPORTED' })
    .eq('round_id', roundId)
    .eq('profile_id', profile.id);

  revalidatePath('/referee');
  revalidatePath('/admin/events');

  return { 
    success: true, 
    message: `Reported to Call Room: ${ev?.name}`,
    profile: {
      id: profile.id,
      name: profile.sslc_name || profile.full_name,
      college: profile.college_name,
      bibNumber: profile.bib_number || profile.chest_number || 'N/A'
    }
  };
}

/**
 * Manually update status for an athlete in a round (NOT_REPORTED, REPORTED, DNS, STARTED, FINISHED, DQ)
 */
export async function updateCallRoomStatus(athleteId: string, roundId: string, status: CallRoomStatus) {
  try {
    await requireRole('official', 'admin');
  } catch (e) {
    if (e instanceof AuthError) return { error: e.message };
    throw e;
  }

  const validStatuses: CallRoomStatus[] = ['NOT_REPORTED', 'REPORTED', 'DNS', 'STARTED', 'FINISHED', 'DQ'];
  if (!validStatuses.includes(status)) {
    return { error: 'Invalid status provided' };
  }

  const now = new Date().toISOString();

  // Upsert into call_room_logs
  await supabase
    .from('call_room_logs')
    .upsert({
      athlete_id: athleteId,
      round_id: roundId,
      status: status,
      reported_at: now
    }, { onConflict: 'athlete_id,round_id' });

  // Update in event_results
  await supabase
    .from('event_results')
    .update({ status: status })
    .eq('round_id', roundId)
    .eq('profile_id', athleteId);

  revalidatePath('/referee');
  revalidatePath('/admin/events');

  return { success: true };
}

/**
 * Substitute a DNS athlete with their college reserve athlete
 */
export async function substituteReserveAthlete(roundId: string, dnsAthleteId: string, reserveAthleteId: string) {
  try {
    await requireRole('official', 'admin');
  } catch (e) {
    if (e instanceof AuthError) return { error: e.message };
    throw e;
  }

  if (!roundId || !dnsAthleteId || !reserveAthleteId) {
    return { error: 'Missing required parameters for reserve substitution' };
  }

  // 1. Fetch DNS Athlete
  const { data: dnsAthlete, error: dnsErr } = await supabase
    .from('profiles')
    .select('id, sslc_name, full_name, college_name, college_id, gender')
    .eq('id', dnsAthleteId)
    .single();

  if (dnsErr || !dnsAthlete) {
    return { error: 'Original athlete not found' };
  }

  // 2. Fetch Reserve Athlete
  const { data: reserveAthlete, error: resErr } = await supabase
    .from('profiles')
    .select('id, sslc_name, full_name, college_name, college_id, gender, accreditation_status, payment_status')
    .eq('id', reserveAthleteId)
    .single();

  if (resErr || !reserveAthlete) {
    return { error: 'Reserve athlete not found' };
  }

  // Verify same college & gender
  if (dnsAthlete.college_id !== reserveAthlete.college_id) {
    return { error: 'Reserve athlete must be from the same college delegation!' };
  }

  if (dnsAthlete.gender !== reserveAthlete.gender) {
    return { error: 'Reserve athlete must be of the same gender category!' };
  }

  if (reserveAthlete.accreditation_status !== 'ACCREDITED') {
    return { error: 'Reserve athlete must be ACCREDITED at the Accreditation Desk to participate.' };
  }

  // 3. Fetch round info
  const { data: round } = await supabase
    .from('event_rounds')
    .select('id, event_id')
    .eq('id', roundId)
    .single();

  if (!round) return { error: 'Round not found' };

  // 4. Mark DNS athlete in call_room_logs
  await supabase
    .from('call_room_logs')
    .upsert({
      athlete_id: dnsAthleteId,
      round_id: roundId,
      status: 'DNS',
      substituted_by_reserve_id: reserveAthleteId
    }, { onConflict: 'athlete_id,round_id' });

  // 5. Register Reserve in call_room_logs as REPORTED
  await supabase
    .from('call_room_logs')
    .upsert({
      athlete_id: reserveAthleteId,
      round_id: roundId,
      status: 'REPORTED',
      reported_at: new Date().toISOString()
    }, { onConflict: 'athlete_id,round_id' });

  // 6. Swap heat and lane assignment in event_results
  // First, find the heat/lane of the DNS athlete
  const { data: existingResult } = await supabase
    .from('event_results')
    .select('id, heat_id, lane_number')
    .eq('round_id', roundId)
    .eq('profile_id', dnsAthleteId)
    .maybeSingle();

  if (existingResult) {
    // Update existing result to the reserve athlete
    await supabase
      .from('event_results')
      .update({
        profile_id: reserveAthleteId,
        status: 'REPORTED'
      })
      .eq('id', existingResult.id);

    // Also record a DNS entry for original athlete if desired
    await supabase
      .from('event_results')
      .insert({
        round_id: roundId,
        event_id: round.event_id,
        heat_id: existingResult.heat_id,
        profile_id: dnsAthleteId,
        status: 'DNS',
        notes: `Substituted by ${reserveAthlete.sslc_name || reserveAthlete.full_name}`
      });
  }

  // 7. Ensure reserve athlete is registered in event_registrations
  await supabase
    .from('event_registrations')
    .upsert({
      athlete_id: reserveAthleteId,
      event_id: round.event_id
    }, { onConflict: 'athlete_id,event_id' });

  revalidatePath('/referee');
  revalidatePath('/admin/events');

  return {
    success: true,
    message: `Successfully substituted ${dnsAthlete.sslc_name || dnsAthlete.full_name} (DNS) with reserve ${reserveAthlete.sslc_name || reserveAthlete.full_name} (${reserveAthlete.college_name})`
  };
}

/**
 * Fetch Call Room Roster for a round, including assigned athletes, current status, and eligible reserves
 */
export async function getCallRoomRoster(roundId: string) {
  if (!roundId) return { error: 'Invalid round ID' };

  // 1. Fetch round & event info
  const { data: round, error: roundError } = await supabase
    .from('event_rounds')
    .select(`
      id,
      round_type,
      event_id,
      events ( id, name, gender, category )
    `)
    .eq('id', roundId)
    .single();

  if (roundError || !round) return { error: 'Round not found' };

  // 2. Fetch all event_results for this round
  const { data: results, error: resError } = await supabase
    .from('event_results')
    .select(`
      id,
      heat_id,
      lane_number,
      status,
      event_heats ( heat_name ),
      profiles:profile_id (
        id,
        sslc_name,
        full_name,
        bib_number,
        chest_number,
        college_name,
        college_id,
        gender,
        accreditation_status
      )
    `)
    .eq('round_id', roundId)
    .order('lane_number', { ascending: true });

  if (resError) {
    console.error('Error fetching results:', resError);
    return { error: 'Could not fetch round roster' };
  }

  // 3. Fetch call_room_logs for this round to get live check-in statuses
  const { data: logs } = await supabase
    .from('call_room_logs')
    .select('athlete_id, status, reported_at, substituted_by_reserve_id')
    .eq('round_id', roundId);

  const logMap = new Map(logs?.map(l => [l.athlete_id, l]) || []);

  // 4. Fetch available reserve athletes for the participating colleges
  const collegeIds = Array.from(new Set(
    results?.map(r => (r.profiles as any)?.college_id).filter(Boolean)
  ));

  let reserves: any[] = [];
  if (collegeIds.length > 0) {
    const ev = round.events as any;
    const { data: reserveProfiles } = await supabase
      .from('profiles')
      .select('id, sslc_name, full_name, bib_number, chest_number, college_id, college_name, gender, accreditation_status')
      .in('college_id', collegeIds)
      .eq('accreditation_status', 'ACCREDITED')
      .eq('gender', ev?.gender)
      .eq('is_reserve', true);

    reserves = reserveProfiles || [];
  }

  return {
    round,
    roster: (results || []).map(r => {
      const prof = r.profiles as any;
      const log = logMap.get(prof?.id);
      return {
        resultId: r.id,
        heatName: (r.event_heats as any)?.heat_name || 'Heat 1',
        laneNumber: r.lane_number,
        status: (log?.status || r.status || 'NOT_REPORTED') as CallRoomStatus,
        athlete: prof ? {
          id: prof.id,
          name: prof.sslc_name || prof.full_name,
          bibNumber: prof.bib_number || prof.chest_number || 'N/A',
          college: prof.college_name,
          collegeId: prof.college_id,
          gender: prof.gender,
          accreditationStatus: prof.accreditation_status
        } : null
      };
    }),
    availableReserves: reserves
  };
}

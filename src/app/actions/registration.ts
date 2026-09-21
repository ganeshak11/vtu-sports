'use server';

import { supabase } from '@/lib/supabase';
import { requireRole, AuthError } from '@/lib/auth-guard';
import { revalidatePath } from 'next/cache';

export interface AthleteRegistrationInput {
  sslcName: string;
  usn: string;
  semester: number;
  bloodGroup: string;
  collegeJoiningDate: string;
  semStartDate: string;
  event1Id: string;
  event2Id?: string;
  reserveEventId?: string;
  isRelay: boolean;
  isHalfMarathon: boolean;
}

export async function createAthleteRegistration(input: AthleteRegistrationInput) {
  let session;
  try {
    session = await requireRole('principal');
  } catch (e) {
    if (e instanceof AuthError) return { error: e.message };
    throw e;
  }

  const gender = session.targetGender || 'men';
  const collegeId = session.collegeId;
  const collegeName = session.collegeName;

  if (!collegeId || !collegeName) {
    return { error: 'College affiliation missing in session. Please log in again.' };
  }

  // 1. Check if Registration Window is Open
  const { data: settings } = await supabase
    .from('meet_settings')
    .select('registration_status')
    .single();

  if (settings && settings.registration_status !== 'OPEN') {
    return { error: 'Registration window has been closed by the administrators.' };
  }

  // 2. Validate Required Fields
  if (!input.sslcName?.trim()) return { error: 'Athlete Name as per SSLC marks card is required.' };
  if (!input.usn?.trim()) return { error: 'USN is required.' };
  if (!input.semester || input.semester < 1 || input.semester > 8) return { error: 'Valid semester (1-8) is required.' };
  if (!input.bloodGroup?.trim()) return { error: 'Blood Group is required.' };
  if (!input.collegeJoiningDate) return { error: 'College Joining Date is required.' };
  if (!input.semStartDate) return { error: 'Current Semester Starting Date is required.' };
  if (!input.event1Id) return { error: 'Event 1 (Compulsory) must be selected.' };

  // 3. Validate Event Uniqueness Rules
  if (input.event2Id && input.event2Id === input.event1Id) {
    return { error: 'Event 2 cannot be the same as Event 1.' };
  }

  if (input.reserveEventId) {
    if (input.reserveEventId === input.event1Id || input.reserveEventId === input.event2Id) {
      return { error: 'Reserve Event must be different from your regular registered events.' };
    }
  }

  // 4. Validate Relay Quota (Max 4 per college per gender)
  if (input.isRelay) {
    const { count: relayCount, error: relayError } = await supabase
      .from('profiles')
      .select('id', { count: 'exact', head: true })
      .eq('college_id', collegeId)
      .eq('gender', gender)
      .eq('is_relay', true)
      .in('payment_status', ['CONFIRMED', 'PAYMENT_PENDING']);

    if (relayError) {
      console.error('Relay check error:', relayError);
    } else if ((relayCount || 0) >= 4) {
      return { 
        error: `Relay squad quota is full (${relayCount}/4). Only maximum 4 relay participants are allowed per college for ${gender === 'men' ? 'Boys' : 'Girls'}.` 
      };
    }
  }

  // 5. Calculate Dynamic Price
  // Event 1 = ₹100, Event 2 = +₹100, Reserve = ₹0, Relay = ₹0, Half Marathon = ₹0
  const eventFee = input.event2Id ? 200 : 100;

  // 6. Insert Athlete Profile in PAYMENT_PENDING status
  const { data: newProfile, error: profileError } = await supabase
    .from('profiles')
    .insert({
      role: 'athlete',
      gender,
      college_id: collegeId,
      college_name: collegeName,
      sslc_name: input.sslcName.trim(),
      full_name: input.sslcName.trim(),
      usn: input.usn.trim().toUpperCase(),
      semester: Number(input.semester),
      blood_group: input.bloodGroup.trim().toUpperCase(),
      college_joining_date: input.collegeJoiningDate,
      sem_start_date: input.semStartDate,
      event1_id: input.event1Id,
      event2_id: input.event2Id || null,
      reserve_event_id: input.reserveEventId || null,
      is_reserve: Boolean(input.reserveEventId),
      is_relay: Boolean(input.isRelay),
      is_half_marathon: Boolean(input.isHalfMarathon),
      payment_status: 'PAYMENT_PENDING',
      amount_paid: eventFee,
      accreditation_status: 'REGISTERED'
    })
    .select('id')
    .single();

  if (profileError || !newProfile) {
    console.error('Profile creation error:', profileError);
    return { error: 'Failed to create athlete record: ' + (profileError?.message || 'Unknown database error') };
  }

  // 7. Associate in event_registrations table
  const regInserts = [
    { athlete_id: newProfile.id, event_id: input.event1Id }
  ];

  if (input.event2Id) {
    regInserts.push({ athlete_id: newProfile.id, event_id: input.event2Id });
  }

  // If Half Marathon checked, find half marathon event id for this gender and link
  if (input.isHalfMarathon) {
    const { data: hmEvent } = await supabase
      .from('events')
      .select('id')
      .ilike('name', '%Half Marathon%')
      .eq('gender', gender)
      .maybeSingle();

    if (hmEvent) {
      regInserts.push({ athlete_id: newProfile.id, event_id: hmEvent.id });
    }
  }

  // If Relay checked, find 4x100 relay event id for this gender and link
  if (input.isRelay) {
    const { data: relayEvent } = await supabase
      .from('events')
      .select('id')
      .ilike('name', '%4x100%')
      .eq('gender', gender)
      .maybeSingle();

    if (relayEvent) {
      regInserts.push({ athlete_id: newProfile.id, event_id: relayEvent.id });
    }
  }

  await supabase.from('event_registrations').insert(regInserts);

  revalidatePath('/principal');
  revalidatePath('/principal/register');

  return { 
    success: true, 
    athleteId: newProfile.id, 
    amount: eventFee,
    athleteName: input.sslcName.trim()
  };
}

export async function getRegistrationEvents(gender: 'men' | 'women') {
  // Fetch regular events for this gender (excluding Relays and Half Marathon since they have separate checkboxes)
  const { data: events, error } = await supabase
    .from('events')
    .select('id, name, category, measurement_metric')
    .eq('gender', gender)
    .neq('category', 'relay')
    .not('name', 'ilike', '%Half Marathon%')
    .order('name');

  if (error) {
    console.error('Error fetching events:', error);
    return [];
  }

  return events || [];
}

export async function getRelayQuotaCount(collegeId: string, gender: 'men' | 'women') {
  const { count, error } = await supabase
    .from('profiles')
    .select('id', { count: 'exact', head: true })
    .eq('college_id', collegeId)
    .eq('gender', gender)
    .eq('is_relay', true)
    .in('payment_status', ['CONFIRMED', 'PAYMENT_PENDING']);

  if (error) return 0;
  return count || 0;
}

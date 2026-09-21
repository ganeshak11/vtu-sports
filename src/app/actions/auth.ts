'use server';

import { redirect } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { getSession, destroySession } from '@/lib/session';

export async function loginWithId(formData: FormData) {
  const userId = formData.get('userId') as string;
  
  if (!userId) {
    return { error: 'Please enter a valid ID.' };
  }

  const cleanId = userId.trim().toUpperCase();

  // Quick Prototype / Dev PIN shortcuts
  if (cleanId === '2345' || cleanId === 'WARDEN') {
    const session = await getSession();
    session.id = cleanId;
    session.role = 'warden';
    session.accommodationName = 'Dr. ACSCE Campus Hostels';
    await session.save();
    redirect('/warden');
  }

  if (cleanId === '1234' || cleanId === 'OFFICIAL') {
    const session = await getSession();
    session.id = cleanId;
    session.role = 'official';
    session.eventName = 'Call Room Marshalling Desk';
    await session.save();
    redirect('/referee');
  }

  if (cleanId === 'ADMIN' || cleanId === 'DIRECTOR' || cleanId === 'MEET_DIRECTOR') {
    const session = await getSession();
    session.id = cleanId;
    session.role = 'admin';
    await session.save();
    redirect('/admin');
  }

  if (cleanId === '3456' || cleanId === 'FOOD') {
    const session = await getSession();
    session.id = cleanId;
    session.role = 'food_volunteer';
    session.counterName = 'Central Canteen Counter';
    await session.save();
    redirect('/volunteer');
  }

  // 1. Check if it's an Event Official PIN
  const { data: eventData } = await supabase
    .from('events')
    .select('id, name')
    .eq('official_pin', cleanId)
    .maybeSingle();

  if (eventData) {
    const session = await getSession();
    session.id = cleanId;
    session.role = 'official';
    session.eventId = eventData.id;
    session.eventName = eventData.name;
    await session.save();
    redirect('/referee');
  }

  // 2. Check if it's a Warden PIN
  const { data: accData } = await supabase
    .from('accommodations')
    .select('id, name')
    .eq('warden_pin', cleanId)
    .maybeSingle();

  if (accData) {
    const session = await getSession();
    session.id = cleanId;
    session.role = 'warden';
    session.accommodationId = accData.id;
    session.accommodationName = accData.name;
    await session.save();
    redirect('/warden');
  }

  // 3. Check if it's a Food Volunteer PIN
  const { data: foodData } = await supabase
    .from('food_counters')
    .select('id, name')
    .eq('volunteer_pin', cleanId)
    .maybeSingle();

  if (foodData) {
    const session = await getSession();
    session.id = cleanId;
    session.role = 'food_volunteer';
    session.counterId = foodData.id;
    session.counterName = foodData.name;
    await session.save();
    redirect('/volunteer');
  }

  // 4. Check if it's a College Principal/PED Boys Login Code (e.g. MITM-M)
  const { data: collegeBoys } = await supabase
    .from('colleges')
    .select('id, name, code, boys_login_code')
    .eq('boys_login_code', cleanId)
    .maybeSingle();

  if (collegeBoys) {
    const session = await getSession();
    session.id = cleanId;
    session.role = 'principal';
    session.collegeId = collegeBoys.id;
    session.collegeName = collegeBoys.name;
    session.collegeCode = collegeBoys.code;
    session.targetGender = 'men';
    await session.save();
    redirect('/principal');
  }

  // 5. Check if it's a College Principal/PED Girls Login Code (e.g. MITM-G)
  const { data: collegeGirls } = await supabase
    .from('colleges')
    .select('id, name, code, girls_login_code')
    .eq('girls_login_code', cleanId)
    .maybeSingle();

  if (collegeGirls) {
    const session = await getSession();
    session.id = cleanId;
    session.role = 'principal';
    session.collegeId = collegeGirls.id;
    session.collegeName = collegeGirls.name;
    session.collegeCode = collegeGirls.code;
    session.targetGender = 'women';
    await session.save();
    redirect('/principal');
  }

  // 6. Check if it's an Athlete profile (by bib number, chest number, or USN)
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('id, role, chest_number, bib_number, usn')
    .or(`chest_number.eq.${cleanId},bib_number.eq.${cleanId},usn.eq.${cleanId}`)
    .maybeSingle();

  if (error || !profile) {
    return { error: 'Invalid ID, College Code, Bib, or PIN.' };
  }

  if (profile.role === 'admin') {
    return { error: 'Admins must log in through the Admin Portal.' };
  }

  const session = await getSession();
  session.id = profile.bib_number || profile.chest_number || profile.usn || cleanId;
  session.role = 'athlete';
  session.profileId = profile.id;
  await session.save();

  redirect('/athlete');
}

export async function adminLogin(formData: FormData) {
  const adminId = formData.get('adminId') as string;
  
  if (!adminId) {
    return { error: 'Please enter a valid Admin ID.' };
  }

  const cleanId = adminId.trim().toUpperCase();

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('id, role, chest_number')
    .eq('chest_number', cleanId)
    .eq('role', 'admin')
    .maybeSingle();

  if (error || !profile) {
    return { error: 'Invalid Admin Credentials.' };
  }

  const session = await getSession();
  session.id = profile.chest_number;
  session.role = 'admin';
  session.profileId = profile.id;
  await session.save();

  redirect('/admin');
}

export async function logout() {
  await destroySession();
  redirect('/login');
}

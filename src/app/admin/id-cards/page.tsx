import React from 'react';
import { supabase } from '@/lib/supabase';
import IdCardsClient from './IdCardsClient';

export default async function IdCardsPage() {
  const { data: athletes, error } = await supabase
    .from('profiles')
    .select(`
      id,
      sslc_name,
      full_name,
      college_name,
      gender,
      bib_number,
      chest_number,
      usn,
      blood_group,
      payment_status,
      is_relay,
      is_half_marathon,
      ev1:events!event1_id(name),
      ev2:events!event2_id(name),
      rev:events!reserve_event_id(name)
    `)
    .eq('role', 'athlete')
    .eq('payment_status', 'CONFIRMED')
    .order('bib_number', { ascending: true });

  if (error) {
    console.error('Error fetching athletes for ID cards:', error);
  }

  const list = (athletes || []).map(a => ({
    id: a.id,
    name: a.sslc_name || a.full_name,
    college: a.college_name || 'Individual',
    gender: a.gender || 'men',
    bibNumber: a.bib_number || a.chest_number || 'TBD',
    usn: a.usn || 'N/A',
    bloodGroup: a.blood_group || 'O+',
    event1: (a.ev1 as any)?.name,
    event2: (a.ev2 as any)?.name,
    reserveEvent: (a.rev as any)?.name,
    isRelay: a.is_relay,
    isHalfMarathon: a.is_half_marathon
  }));

  const collegesSet = new Set<string>();
  list.forEach(a => collegesSet.add(a.college));
  const colleges = Array.from(collegesSet).sort();

  return <IdCardsClient athletes={list} colleges={colleges} />;
}

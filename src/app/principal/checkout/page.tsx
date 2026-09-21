import React from 'react';
import { getSession } from '@/lib/session';
import { redirect } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import CheckoutClient from './CheckoutClient';

export default async function CheckoutPage({
  searchParams,
}: {
  searchParams: Promise<{ athleteId?: string }>;
}) {
  const session = await getSession();

  if (!session.id || (session.role !== 'principal' && session.role !== 'admin')) {
    redirect('/login');
  }

  const { athleteId } = await searchParams;

  if (!athleteId) {
    redirect('/principal');
  }

  const { data: athlete, error } = await supabase
    .from('profiles')
    .select(`
      id,
      sslc_name,
      full_name,
      usn,
      college_name,
      gender,
      amount_paid,
      payment_status,
      order_id,
      payment_id,
      is_relay,
      is_half_marathon,
      ev1:events!event1_id(name),
      ev2:events!event2_id(name),
      rev:events!reserve_event_id(name)
    `)
    .eq('id', athleteId)
    .single();

  if (error || !athlete) {
    redirect('/principal');
  }

  const athleteFormatted = {
    ...athlete,
    amount_paid: Number(athlete.amount_paid) || 100,
    ev1_name: (athlete.ev1 as any)?.name,
    ev2_name: (athlete.ev2 as any)?.name,
    rev_name: (athlete.rev as any)?.name
  };

  return <CheckoutClient athlete={athleteFormatted} />;
}

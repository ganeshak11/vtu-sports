import React from 'react';
import { supabase } from '@/lib/supabase';
import { getSession } from '@/lib/session';
import { redirect } from 'next/navigation';
import AccreditationClient from './AccreditationClient';

export default async function AccreditationPage() {
  const session = await getSession();

  if (!session.id || session.role !== 'admin') {
    redirect('/admin');
  }

  // Count confirmed and accredited athletes
  const { count: totalConfirmed } = await supabase
    .from('profiles')
    .select('id', { count: 'exact', head: true })
    .eq('role', 'athlete')
    .eq('payment_status', 'CONFIRMED');

  const { count: totalAccredited } = await supabase
    .from('profiles')
    .select('id', { count: 'exact', head: true })
    .eq('role', 'athlete')
    .eq('accreditation_status', 'ACCREDITED');

  return (
    <AccreditationClient
      totalConfirmed={totalConfirmed || 0}
      totalAccredited={totalAccredited || 0}
    />
  );
}

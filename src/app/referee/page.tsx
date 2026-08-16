import React from 'react';
import { getSession } from '@/lib/session';
import { redirect } from 'next/navigation';
import { ScannerClient } from './ScannerClient';

import { supabase } from '@/lib/supabase';

export default async function RefereePage() {
  const session = await getSession();

  if (!session.id || !session.eventId) {
    redirect('/login');
  }

  const { data: rounds } = await supabase
    .from('event_rounds')
    .select('id, round_type, scheduled_time')
    .eq('event_id', session.eventId)
    .order('sequence_number');

  return (
    <ScannerClient 
      eventId={session.eventId} 
      eventName={session.eventName || 'Unknown Event'} 
      rounds={rounds || []}
    />
  );
}

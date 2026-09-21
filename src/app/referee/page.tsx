import React from 'react';
import { getSession } from '@/lib/session';
import { redirect } from 'next/navigation';
import { ScannerClient } from './ScannerClient';
import { supabase } from '@/lib/supabase';

export default async function RefereePage() {
  const session = await getSession();

  if (!session.id || (session.role !== 'official' && session.role !== 'admin')) {
    redirect('/login');
  }

  // Fetch all events
  const { data: events } = await supabase
    .from('events')
    .select('id, name, gender, category')
    .order('name');

  // Fetch all rounds
  const { data: rounds } = await supabase
    .from('event_rounds')
    .select('id, event_id, round_type, scheduled_time')
    .order('sequence_number');

  const validEvents = events || [];
  const validRounds = rounds || [];

  return (
    <ScannerClient 
      initialEventId={session.eventId || validEvents[0]?.id} 
      initialEventName={session.eventName || validEvents[0]?.name} 
      events={validEvents}
      rounds={validRounds}
    />
  );
}

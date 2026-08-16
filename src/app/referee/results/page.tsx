import React from 'react';
import { getSession } from '@/lib/session';
import { redirect } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { ResultsEntryClient } from './ResultsEntryClient';

export default async function ResultsPage() {
  const session = await getSession();

  if (!session.id || !session.eventId) {
    redirect('/login');
  }

  // Fetch rounds for the official's event
  const { data: rounds } = await supabase
    .from('event_rounds')
    .select('id, round_type, scheduled_time, events ( measurement_metric )')
    .eq('event_id', session.eventId)
    .order('sequence_number');

  // We also need the athletes who checked in via Call Room for these rounds.
  // The client will fetch them, or we can fetch them here.
  // It's probably better to let the client component fetch them when a round is selected,
  // or we can just pass everything. Given it's a server component, we can fetch all checked-in athletes for the event.

  const { data: callRoomLogs } = await supabase
    .from('call_room_logs')
    .select(`
      round_id,
      athlete_id,
      profiles ( chest_number, full_name, college_name )
    `);
    // Ideally we filter by event_id, but call_room_logs only has round_id.
    // We'll filter in the client.

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <div>
        <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '0.5rem' }}>Results Engine</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Input performance data for checked-in athletes.</p>
      </div>
      
      <ResultsEntryClient 
        eventName={session.eventName || 'Event'} 
        rounds={rounds || []} 
        checkIns={callRoomLogs || []} 
      />
    </div>
  );
}

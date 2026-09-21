import React from 'react';
import { getSession } from '@/lib/session';
import { redirect } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { ResultsEntryClient } from './ResultsEntryClient';

export default async function ResultsPage() {
  const session = await getSession();

  if (!session.id || (session.role !== 'official' && session.role !== 'admin')) {
    redirect('/login');
  }

  // Fetch all events
  const { data: events } = await supabase
    .from('events')
    .select('id, name, gender, category, measurement_metric')
    .order('name');

  // Fetch all rounds
  const { data: rounds } = await supabase
    .from('event_rounds')
    .select('id, event_id, round_type, scheduled_time, sequence_number')
    .order('sequence_number');

  // Fetch all existing results with profiles
  const { data: results } = await supabase
    .from('event_results')
    .select(`
      id,
      round_id,
      event_id,
      profile_id,
      lane_number,
      status,
      attempt_1,
      attempt_2,
      attempt_3,
      best_mark,
      final_result,
      rank,
      qualified,
      profiles:profile_id (
        id,
        sslc_name,
        full_name,
        bib_number,
        chest_number,
        college_name
      )
    `);

  const validEvents = events || [];
  const validRounds = rounds || [];
  const initialEventId = session.eventId || validEvents[0]?.id;

  const normalizedResults = (results || []).map((r: any) => ({
    ...r,
    profiles: Array.isArray(r.profiles) ? r.profiles[0] || null : r.profiles
  }));

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem', maxWidth: '1000px', margin: '0 auto' }}>
      <div>
        <div style={{ display: 'inline-block', padding: '0.2rem 0.6rem', borderRadius: '4px', background: 'rgba(139, 92, 246, 0.1)', color: '#a78bfa', fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.5rem' }}>
          Dr. ACS College of Engineering &bull; Official Timing System
        </div>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.25rem' }}>Official Results Engine</h1>
        <p style={{ color: 'var(--text-secondary)' }}>
          Photo finish file import for track events &bull; 3-attempt best mark entry for field events
        </p>
      </div>
      
      <ResultsEntryClient 
        initialEventId={initialEventId}
        events={validEvents}
        rounds={validRounds} 
        results={normalizedResults} 
      />
    </div>
  );
}

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

  // Fetch all heats
  const { data: heats } = await supabase
    .from('event_heats')
    .select('id, round_id, heat_name, start_time')
    .order('heat_name');

  // Fetch all existing results with profiles and heats
  const { data: results } = await supabase
    .from('event_results')
    .select(`
      id,
      round_id,
      event_id,
      heat_id,
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
      event_heats:heat_id (
        id,
        heat_name
      ),
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
  const validHeats = heats || [];
  const initialEventId = session.eventId || validEvents[0]?.id;

  const normalizedResults = (results || []).map((r: any) => ({
    ...r,
    event_heats: Array.isArray(r.event_heats) ? r.event_heats[0] || null : r.event_heats,
    profiles: Array.isArray(r.profiles) ? r.profiles[0] || null : r.profiles
  }));

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem', maxWidth: '1060px', margin: '0 auto' }}>
      <div>
        <div style={{ 
          display: 'inline-flex', 
          alignItems: 'center', 
          gap: '0.35rem', 
          padding: '0.25rem 0.65rem', 
          borderRadius: '6px', 
          background: '#ede9fe', 
          color: '#6d28d9', 
          border: '1px solid #ddd6fe', 
          fontSize: '0.75rem', 
          fontWeight: 700, 
          letterSpacing: '0.04em', 
          textTransform: 'uppercase', 
          marginBottom: '0.6rem' 
        }}>
          ⏱️ Dr. ACS College of Engineering &bull; Official Timing System
        </div>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.35rem', letterSpacing: '-0.02em' }}>Official Results Engine</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
          Photo finish file import for track events &bull; 3-attempt best mark entry for field events
        </p>
      </div>
      
      <ResultsEntryClient 
        initialEventId={initialEventId}
        events={validEvents}
        rounds={validRounds} 
        heats={validHeats}
        results={normalizedResults} 
      />
    </div>
  );
}


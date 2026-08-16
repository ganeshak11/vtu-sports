import React from 'react';
import { supabase } from '@/lib/supabase';
import { GenerateHeatsClient } from './GenerateHeatsClient';

export default async function HeatsPage() {
  // Fetch only track events that have registrations
  // For simplicity we just fetch track events
  const { data: trackEvents, error } = await supabase
    .from('events')
    .select('id, name, gender, category')
    .eq('category', 'track')
    .order('name');
  
  if (error) {
    console.error('Error fetching track events:', error);
  }

  // Also fetch registration counts to display to admin
  const { data: regCounts } = await supabase
    .from('event_registrations')
    .select('event_id');

  const counts: Record<string, number> = {};
  regCounts?.forEach(r => {
    counts[r.event_id] = (counts[r.event_id] || 0) + 1;
  });

  const eventsWithCounts = (trackEvents || []).map(e => ({
    ...e,
    registeredAthletes: counts[e.id] || 0
  }));

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div>
        <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '0.5rem' }}>Heat Generation</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Automatically distribute registered athletes into heats based on college collision rules.</p>
      </div>

      <GenerateHeatsClient events={eventsWithCounts} />
    </div>
  );
}

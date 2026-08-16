import React from 'react';
import { supabase } from '@/lib/supabase';
import { AthleteImport } from '@/components/admin/AthleteImport';
import { AthleteTableClient } from './AthleteTableClient';

export default async function AthletesDashboard() {
  // Fetch profiles with their registered events
  const { data: profiles, error } = await supabase
    .from('profiles')
    .select(`
      *,
      event_registrations(
        events(id, name, gender)
      )
    `)
    .eq('role', 'athlete')
    .order('college_name');
  
  if (error) {
    console.error('Error fetching athletes:', error);
  }

  // Fetch unique events for the filter
  const { data: eventsData } = await supabase
    .from('events')
    .select('id, name, gender')
    .order('name');

  const athletes = profiles || [];
  const events = eventsData || [];
  
  // Extract unique colleges for the filter
  const collegesSet = new Set<string>();
  athletes.forEach(a => {
    if (a.college_name) collegesSet.add(a.college_name);
  });
  const colleges = Array.from(collegesSet).sort();

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div>
        <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '0.5rem' }}>Athletes Management</h1>
        <p style={{ color: 'var(--text-secondary)' }}>View and manage all registered athletes.</p>
      </div>

      <AthleteImport />

      <AthleteTableClient athletes={athletes} colleges={colleges} events={events} />
    </div>
  );
}

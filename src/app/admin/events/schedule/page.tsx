import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { supabase } from '@/lib/supabase';
import ScheduleClient from './ScheduleClient';

export default async function EventSchedulePage() {
  const { data: events, error } = await supabase
    .from('events')
    .select(`
      id, name, gender, category, status,
      event_rounds ( id, round_type, sequence_number, scheduled_time, location, status )
    `)
    .order('name');

  if (error) {
    console.error('Error fetching events:', error);
  }

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div>
        <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '0.5rem' }}>Event Scheduler</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Assign dates, times, and locations to event rounds.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Schedule Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <ScheduleClient events={events || []} />
        </CardContent>
      </Card>
    </div>
  );
}

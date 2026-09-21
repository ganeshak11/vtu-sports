import React from 'react';
import { supabase } from '@/lib/supabase';
import { getSession } from '@/lib/session';
import ScheduleClient, { ScheduleEvent } from './ScheduleClient';

export const revalidate = 0;

export default async function AthleteSchedulePage() {
  const session = await getSession();

  // 1. Fetch all events and their rounds
  const { data: eventsData } = await supabase
    .from('events')
    .select(`
      id,
      name,
      gender,
      category,
      venue,
      event_rounds (
        id,
        round_type,
        scheduled_time,
        sequence_number
      )
    `)
    .order('name');

  // 2. Fetch athlete's registered event IDs
  let myEventIds: string[] = [];
  if (session?.profileId) {
    const { data: regs } = await supabase
      .from('event_registrations')
      .select('event_id')
      .eq('athlete_id', session.profileId);

    myEventIds = regs?.map(r => r.event_id) || [];
  }

  // 3. Transform to ScheduleEvent items
  const scheduleEvents: ScheduleEvent[] = [];

  (eventsData || []).forEach((ev, evIdx) => {
    const rounds = (ev.event_rounds as any[]) || [];

    if (rounds.length === 0) {
      // Create a default scheduled entry
      const day = (evIdx % 4) + 1;
      const hour = 8 + (evIdx % 8);
      scheduleEvents.push({
        id: ev.id,
        name: ev.name,
        gender: ev.gender,
        category: ev.category,
        roundType: 'Final',
        time: `${hour.toString().padStart(2, '0')}:30 AM`,
        day,
        venue: ev.venue || (ev.category === 'track' ? 'Track Lane 1-8' : 'Field Sector A'),
        status: 'Upcoming',
        isUserRegistered: myEventIds.includes(ev.id)
      });
    } else {
      rounds.forEach((rnd, rIdx) => {
        let day = 1;
        let timeStr = '09:00 AM';
        let status: 'Upcoming' | 'Live' | 'Finished' = 'Upcoming';

        if (rnd.scheduled_time) {
          const dt = new Date(rnd.scheduled_time);
          timeStr = dt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          // Day calculation
          day = (rIdx % 4) + 1;
        } else {
          day = ((evIdx + rIdx) % 4) + 1;
          const hr = 8 + ((evIdx * 2 + rIdx) % 9);
          timeStr = `${hr.toString().padStart(2, '0')}:00 ${hr >= 12 ? 'PM' : 'AM'}`;
        }

        scheduleEvents.push({
          id: ev.id,
          name: ev.name,
          gender: ev.gender,
          category: ev.category,
          roundType: rnd.round_type?.toUpperCase() || 'FINAL',
          time: timeStr,
          day,
          venue: ev.venue || (ev.category === 'track' ? 'Main Track' : 'Infield Sector'),
          status,
          isUserRegistered: myEventIds.includes(ev.id)
        });
      });
    }
  });

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div>
        <div style={{ display: 'inline-block', padding: '0.2rem 0.6rem', borderRadius: '4px', background: 'rgba(59, 130, 246, 0.1)', color: 'var(--accent-primary)', fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.5rem' }}>
          Screen 3 of 4 &bull; Meet Timetable
        </div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.25rem' }}>Championship Schedule</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          Official 4-day competition timetable at Dr. ACS College of Engineering
        </p>
      </div>

      <ScheduleClient events={scheduleEvents} myEventIds={myEventIds} />
    </div>
  );
}

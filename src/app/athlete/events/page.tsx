import React from 'react';
import { cookies } from 'next/headers';
import { supabase } from '@/lib/supabase';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { CountdownTimer } from '@/components/ui/CountdownTimer';
import { Badge } from '@/components/ui/Badge';

import { getSession } from '@/lib/session';

export default async function AthleteEventsPage() {
  const session = await getSession();

  if (!session?.profileId) {
    return <div>Profile not found. Please log in.</div>;
  }

  // Fetch the athlete's registered events and check if they have checked into the call room
  const { data: registrations } = await supabase
    .from('event_registrations')
    .select(`
      event_id,
      events (
        id,
        name,
        category,
        gender,
        measurement_metric,
        start_date,
        event_time,
        call_room_time,
        venue
      )
    `)
    .eq('athlete_id', session.profileId);

  // Fetch call room logs to see if they already reported
  const { data: callRoomLogs } = await supabase
    .from('call_room_logs')
    .select('event_id, checked_in_at')
    .eq('athlete_id', session.profileId);

  // Fetch event results to see assigned heat and lane
  const { data: heatAssignments } = await supabase
    .from('event_results')
    .select(`
      event_id,
      lane_number,
      event_heats ( heat_name )
    `)
    .eq('profile_id', session.profileId);

  const events = registrations?.map(r => {
    const ev = r.events as any;
    const assignment = heatAssignments?.find(h => h.event_id === ev.id);
    if (assignment) {
      ev.heat_name = (assignment.event_heats as any)?.heat_name;
      ev.lane_number = assignment.lane_number;
    }
    return ev;
  }) || [];
  
  const hasCheckedIn = (eventId: string) => {
    return callRoomLogs?.some(log => log.event_id === eventId);
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      <div style={{ textAlign: 'center' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>My Events</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Track your schedule and reporting times</p>
      </div>

      {events.length === 0 ? (
        <Card>
          <CardContent style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
            You are not registered for any upcoming events.
          </CardContent>
        </Card>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {events.map((event: any, idx) => {
            const checkedIn = hasCheckedIn(event.id);
            const callRoomTime = event.call_room_time ? new Date(event.call_room_time) : null;
            const eventTime = event.event_time ? new Date(event.event_time) : null;

            return (
              <Card key={idx}>
                <CardContent style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>{event.name}</h2>
                      <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.25rem' }}>
                        <span style={{ fontSize: '0.75rem', padding: '0.125rem 0.5rem', background: 'rgba(255,255,255,0.1)', borderRadius: '1rem', textTransform: 'capitalize' }}>
                          {event.category}
                        </span>
                        <span style={{ fontSize: '0.75rem', padding: '0.125rem 0.5rem', background: 'rgba(255,255,255,0.1)', borderRadius: '1rem', textTransform: 'capitalize' }}>
                          {event.gender}
                        </span>
                      </div>
                      <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
                        {event.venue || 'Main Stadium'}
                      </p>
                    </div>
                    {checkedIn ? (
                      <Badge variant="success">Checked In</Badge>
                    ) : (
                      <Badge variant="warning">Action Required</Badge>
                    )}
                  </div>

                  <div style={{ background: 'var(--bg-tertiary)', padding: '1rem', borderRadius: 'var(--radius-sm)', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '1rem' }}>
                    
                    <div>
                      <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
                        Event Starts
                      </span>
                      <span style={{ fontWeight: 600 }}>
                        {eventTime ? eventTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'TBD'}
                      </span>
                    </div>

                    <div>
                      <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
                        Call Room
                      </span>
                      <span style={{ fontWeight: 600 }}>
                        {callRoomTime ? callRoomTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'TBD'}
                      </span>
                    </div>

                    {event.heat_name && (
                      <div>
                        <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
                          Heat
                        </span>
                        <span style={{ fontWeight: 600, color: 'var(--accent-primary)' }}>
                          {event.heat_name}
                        </span>
                      </div>
                    )}

                    {event.lane_number && (
                      <div>
                        <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
                          Lane
                        </span>
                        <span style={{ fontWeight: 600, color: 'var(--accent-primary)' }}>
                          {event.lane_number}
                        </span>
                      </div>
                    )}

                  </div>

                  {!checkedIn && callRoomTime && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem' }}>
                      <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>Time to Report:</span>
                      <CountdownTimer targetDate={callRoomTime} />
                    </div>
                  )}

                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

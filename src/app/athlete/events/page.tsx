import React from 'react';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { CountdownTimer } from '@/components/ui/CountdownTimer';
import { Badge } from '@/components/ui/Badge';
import { getSession } from '@/lib/session';

export const revalidate = 0;

const STATUS_BADGES: Record<string, { variant: 'default' | 'success' | 'warning' | 'danger' | 'info'; label: string }> = {
  NOT_REPORTED: { variant: 'warning', label: 'Report to Call Room' },
  REPORTED: { variant: 'success', label: 'Reported ✓' },
  DNS: { variant: 'danger', label: 'DNS (Did Not Start)' },
  STARTED: { variant: 'info', label: 'In Progress' },
  FINISHED: { variant: 'default', label: 'Finished' },
  DQ: { variant: 'danger', label: 'Disqualified' }
};

export default async function AthleteEventsPage() {
  const session = await getSession();

  if (!session?.profileId) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
        Profile not found. Please log in with your credentials.
      </div>
    );
  }

  // 1. Fetch Profile to get registered event IDs
  const { data: profile } = await supabase
    .from('profiles')
    .select(`
      id,
      sslc_name,
      full_name,
      bib_number,
      chest_number,
      is_relay,
      is_half_marathon,
      event1_id,
      event2_id,
      reserve_event_id
    `)
    .eq('id', session.profileId)
    .single();

  // 2. Fetch event registrations
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
        venue,
        event_rounds (
          id,
          round_type,
          scheduled_time,
          sequence_number
        )
      )
    `)
    .eq('athlete_id', session.profileId);

  // 3. Fetch heat & lane assignments and performance marks from event_results
  const { data: resultsData } = await supabase
    .from('event_results')
    .select(`
      id,
      event_id,
      round_id,
      heat_id,
      lane_number,
      status,
      attempt_1,
      attempt_2,
      attempt_3,
      best_mark,
      final_result,
      rank,
      event_heats ( heat_name )
    `)
    .eq('profile_id', session.profileId);

  // 4. Fetch Call Room Logs
  const { data: callRoomLogs } = await supabase
    .from('call_room_logs')
    .select('round_id, status, reported_at')
    .eq('athlete_id', session.profileId);

  const logsMap = new Map(callRoomLogs?.map(l => [l.round_id, l]) || []);
  const resultsMap = new Map(resultsData?.map(r => [r.event_id, r]) || []);

  const registeredEvents = registrations?.map(r => r.events as any).filter(Boolean) || [];

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      <div>
        <div style={{ display: 'inline-block', padding: '0.2rem 0.6rem', borderRadius: '4px', background: 'rgba(59, 130, 246, 0.1)', color: 'var(--accent-primary)', fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.5rem' }}>
          Screen 2 of 4 &bull; Event Tracking
        </div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.25rem' }}>My Registered Events</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          Heat assignments, lane numbers, Call Room reporting summons, and live marks
        </p>
      </div>

      {registeredEvents.length === 0 ? (
        <Card>
          <CardContent style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
            No registered events found for your athlete profile.
          </CardContent>
        </Card>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {registeredEvents.map((event: any, idx) => {
            const res = resultsMap.get(event.id);
            const firstRound = event.event_rounds?.[0];
            const log = firstRound ? logsMap.get(firstRound.id) : null;
            const currentStatus = (log?.status || res?.status || 'NOT_REPORTED').toUpperCase();
            const badgeInfo = STATUS_BADGES[currentStatus] || STATUS_BADGES.NOT_REPORTED;

            const isEvent1 = profile?.event1_id === event.id;
            const isEvent2 = profile?.event2_id === event.id;
            const isReserve = profile?.reserve_event_id === event.id;

            const heatName = (res?.event_heats as any)?.heat_name;
            const laneNum = res?.lane_number;
            const scheduledTime = firstRound?.scheduled_time ? new Date(firstRound.scheduled_time) : null;

            return (
              <Card key={event.id || idx}>
                <CardContent style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  
                  {/* Event Title & Role Tag */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                        <span style={{ 
                          fontSize: '0.7rem', 
                          padding: '0.15rem 0.5rem', 
                          borderRadius: '4px', 
                          background: isEvent1 ? 'rgba(59, 130, 246, 0.15)' : isEvent2 ? 'rgba(59, 130, 246, 0.15)' : isReserve ? 'rgba(168, 85, 247, 0.15)' : 'var(--bg-tertiary)',
                          color: isReserve ? '#c084fc' : 'var(--accent-primary)',
                          fontWeight: 700
                        }}>
                          {isEvent1 ? 'COMPULSORY EVENT 1' : isEvent2 ? 'EVENT 2' : isReserve ? 'RESERVE EVENT' : 'SPECIAL ENTRY'}
                        </span>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', textTransform: 'capitalize' }}>
                          {event.category} &bull; {event.gender}
                        </span>
                      </div>

                      <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                        {event.name}
                      </h2>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                        Venue: {event.venue || 'ACSCE Athletics Arena'}
                      </span>
                    </div>

                    <Badge variant={badgeInfo.variant}>
                      {badgeInfo.label}
                    </Badge>
                  </div>

                  {/* Seeded Lane & Reporting Specs */}
                  <div style={{ 
                    background: 'var(--bg-tertiary)', 
                    padding: '0.85rem 1rem', 
                    borderRadius: 'var(--radius-sm)', 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))', 
                    gap: '0.75rem',
                    border: '1px solid var(--border-color)'
                  }}>
                    <div>
                      <span style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
                        Heat Assignment
                      </span>
                      <strong style={{ fontSize: '0.95rem', color: heatName ? 'var(--accent-primary)' : 'var(--text-secondary)' }}>
                        {heatName || 'Pending Seed'}
                      </strong>
                    </div>

                    <div>
                      <span style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
                        Lane Number
                      </span>
                      <strong style={{ fontSize: '0.95rem', color: laneNum ? 'var(--accent-primary)' : 'var(--text-secondary)' }}>
                        {laneNum ? `Lane ${laneNum}` : 'TBD'}
                      </strong>
                    </div>

                    <div>
                      <span style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
                        Scheduled Time
                      </span>
                      <strong style={{ fontSize: '0.95rem' }}>
                        {scheduledTime ? scheduledTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '09:00 AM'}
                      </strong>
                    </div>

                    <div>
                      <span style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
                        Performance / Rank
                      </span>
                      <strong style={{ fontSize: '0.95rem', color: res?.rank ? '#FCD34D' : 'var(--text-primary)' }}>
                        {res?.rank ? (
                          res.rank === 1 ? '🥇 1st Place' : res.rank === 2 ? '🥈 2nd Place' : res.rank === 3 ? '🥉 3rd Place' : `${res.rank}th Place`
                        ) : res?.final_result ? (
                          `${res.final_result} ${event.category === 'track' ? 's' : 'm'}`
                        ) : (
                          'Awaiting Event'
                        )}
                      </strong>
                    </div>
                  </div>

                  {/* Call Room reporting summons warning */}
                  {currentStatus === 'NOT_REPORTED' && (
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.65rem 0.85rem',
                      borderRadius: 'var(--radius-sm)',
                      background: 'rgba(245, 158, 11, 0.08)',
                      border: '1px solid rgba(245, 158, 11, 0.25)',
                      fontSize: '0.8rem'
                    }}>
                      <span style={{ color: 'var(--warning)', fontWeight: 600 }}>
                        📢 Report to Call Room 45 mins prior with Bib #{profile?.bib_number || profile?.chest_number}
                      </span>
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

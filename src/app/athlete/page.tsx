import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { getSession } from '@/lib/session';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { FoodPassClient } from '@/components/athlete/FoodPassClient';

export default async function AthleteDashboard() {
  const session = await getSession();

  let profile = null;
  let accommodation = null;
  let foodLogs: any[] = [];

  if (session?.profileId) {
    // Fetch real profile data
    const { data: profileData } = await supabase
      .from('profiles')
      .select('*, accommodations(*)')
      .eq('id', session.profileId)
      .single();
    
    if (profileData) {
      profile = profileData;
      accommodation = profileData.accommodations;
    }

    // Fetch food logs
    const { data: logsData } = await supabase
      .from('food_logs')
      .select('meal_type')
      .eq('athlete_id', session.profileId);
      
      if (logsData) {
      foodLogs = logsData;
    }
  }

  // Fetch the next upcoming event
  let nextEvent: any = null;
  if (session?.profileId) {
    const { data: regs } = await supabase
      .from('event_registrations')
      .select(`
        event_id,
        events (
          name, gender, category,
          event_rounds ( round_type, scheduled_time, location )
        )
      `)
      .eq('athlete_id', session.profileId);
    
    if (regs && regs.length > 0) {
      // Find the earliest scheduled round in the future
      const now = new Date().getTime();
      let earliestRound = null;
      let earliestTime = Infinity;
      
      for (const reg of regs) {
        const ev = reg.events as any;
        if (!ev || !ev.event_rounds) continue;
        for (const round of ev.event_rounds) {
          if (round.scheduled_time) {
            const time = new Date(round.scheduled_time).getTime();
            if (time > now && time < earliestTime) {
              earliestTime = time;
              earliestRound = {
                ...round,
                eventName: ev.name,
                gender: ev.gender
              };
            }
          }
        }
      }
      if (earliestRound) {
        nextEvent = earliestRound;
      }
    }
  }

  // Check if specific meal was consumed
  const hasConsumed = (mealType: string) => foodLogs.some(log => log.meal_type === mealType);

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      
      {/* Welcome Card */}
      <Card>
        <CardContent style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Welcome, {profile?.full_name || session?.id || 'Athlete'}</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            VTU Athletics Meet 2026 - {profile?.college_name || 'Your College'}
          </p>
          <div style={{ marginTop: '0.5rem' }}>
            <Badge variant="success">Registered</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Accommodation Assignment */}
      <Card>
        <CardHeader>
          <CardTitle style={{ fontSize: '1.125rem' }}>Accommodation</CardTitle>
        </CardHeader>
        <CardContent style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <p style={{ fontWeight: 600 }}>{accommodation?.name || 'Pending Assignment'}</p>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                Room {profile?.room_number || 'TBD'}
              </p>
            </div>
            {accommodation ? <Badge variant="info">Assigned</Badge> : <Badge variant="warning">Unassigned</Badge>}
          </div>
          <Link href="/athlete/accommodation" style={{ 
            display: 'block', 
            textAlign: 'center', 
            padding: '0.5rem', 
            background: 'var(--bg-tertiary)', 
            borderRadius: 'var(--radius-sm)',
            fontSize: '0.875rem',
            color: 'var(--accent-primary)',
            fontWeight: 500
          }}>
            View Details & Update Status →
          </Link>
        </CardContent>
      </Card>

      {/* Next Event Schedule */}
      <Card>
        <CardHeader>
          <CardTitle style={{ fontSize: '1.125rem' }}>Next Event</CardTitle>
        </CardHeader>
        <CardContent>
          {nextEvent ? (
            <div style={{ background: 'var(--bg-tertiary)', padding: '1rem', borderRadius: 'var(--radius-sm)', borderLeft: '3px solid var(--accent-secondary)' }}>
              <h4 style={{ fontWeight: 700, marginBottom: '0.25rem' }}>{nextEvent.eventName} ({nextEvent.gender})</h4>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                <span>{new Date(nextEvent.scheduled_time).toLocaleString(undefined, { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                <span>{nextEvent.location || 'TBA'}</span>
              </div>
              <div style={{ marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border-color)', fontSize: '0.75rem', display: 'flex', justifyContent: 'space-between' }}>
                <div><span style={{ color: 'var(--warning)', fontWeight: 600 }}>Call Room:</span> 45 mins prior</div>
                <div><span style={{ fontWeight: 600, color: 'var(--accent-secondary)' }}>{nextEvent.round_type}</span></div>
              </div>
            </div>
          ) : (
            <div style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--text-secondary)', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-sm)' }}>
              No upcoming events scheduled.
            </div>
          )}
        </CardContent>
      </Card>

      <FoodPassClient foodLogs={foodLogs} />
    </div>
  );
}

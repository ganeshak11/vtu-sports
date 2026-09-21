import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { getSession } from '@/lib/session';
import { supabase } from '@/lib/supabase';
import { FoodPassClient } from '@/components/athlete/FoodPassClient';
import QRCode from 'react-qr-code';
import Link from 'next/link';

export const revalidate = 0;

export default async function AthleteDashboard() {
  const session = await getSession();

  let profile: any = null;
  let foodLogs: any[] = [];
  let registeredEvents: any[] = [];

  if (session?.profileId) {
    // 1. Fetch comprehensive profile data
    const { data: profileData } = await supabase
      .from('profiles')
      .select(`
        id,
        sslc_name,
        full_name,
        usn,
        semester,
        blood_group,
        college_name,
        gender,
        bib_number,
        chest_number,
        payment_status,
        amount_paid,
        accreditation_status,
        accredited_at,
        accommodation_checked_in,
        accommodation_checked_in_at,
        is_relay,
        is_half_marathon,
        ev1:events!event1_id(name, category),
        ev2:events!event2_id(name, category),
        resEv:events!reserve_event_id(name)
      `)
      .eq('id', session.profileId)
      .maybeSingle();

    if (profileData) {
      profile = profileData;
    }

    // 2. Fetch food logs
    const { data: logsData } = await supabase
      .from('food_logs')
      .select('meal_type, consumed_at')
      .eq('athlete_id', session.profileId);

    if (logsData) {
      foodLogs = logsData;
    }

    // 3. Fetch registered events for schedule preview
    const { data: regs } = await supabase
      .from('event_registrations')
      .select(`
        event_id,
        events (
          id, name, gender, category,
          event_rounds ( round_type, scheduled_time )
        )
      `)
      .eq('athlete_id', session.profileId);

    registeredEvents = regs || [];
  }

  const athleteName = profile?.sslc_name || profile?.full_name || 'Student Athlete';
  const bibDisplay = profile?.bib_number ? `#${profile.bib_number}` : profile?.chest_number ? `#${profile.chest_number}` : 'TBD';
  const isAccredited = profile?.accreditation_status === 'ACCREDITED';
  const isCheckedInHostel = Boolean(profile?.accommodation_checked_in);
  const isPaymentConfirmed = profile?.payment_status === 'CONFIRMED';

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      
      {/* 1. Official Digital Athlete Accreditation Badge Card */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.95), rgba(15, 23, 42, 0.98))',
        border: '1px solid rgba(59, 130, 246, 0.3)',
        borderRadius: 'var(--radius-md)',
        padding: '1.25rem',
        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.35)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.25rem' }}>
              <span style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--accent-primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                VTU Athletics 2026 &bull; Dr. ACSCE
              </span>
            </div>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#fff', margin: 0 }}>
              {athleteName}
            </h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '0.15rem 0 0' }}>
              {profile?.college_name || 'College Delegation'}
            </p>
          </div>

          <div style={{
            background: 'rgba(59, 130, 246, 0.15)',
            border: '2px solid var(--accent-primary)',
            borderRadius: 'var(--radius-sm)',
            padding: '0.35rem 0.65rem',
            textAlign: 'center'
          }}>
            <span style={{ display: 'block', fontSize: '0.65rem', textTransform: 'uppercase', color: 'var(--text-secondary)', fontWeight: 700 }}>
              BIB
            </span>
            <span style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--accent-primary)' }}>
              {bibDisplay}
            </span>
          </div>
        </div>

        {/* QR & Details Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '100px 1fr', gap: '1rem', alignItems: 'center', background: 'rgba(0,0,0,0.2)', padding: '0.85rem', borderRadius: 'var(--radius-sm)' }}>
          {/* QR Code */}
          <div style={{ background: '#fff', padding: '0.4rem', borderRadius: '4px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <QRCode
              value={profile?.id || 'sample-athlete-id'}
              size={84}
              style={{ height: 'auto', maxWidth: '100%', width: '100%' }}
              viewBox={`0 0 84 84`}
            />
          </div>

          {/* Metadata */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontSize: '0.75rem' }}>
            <div>
              <span style={{ color: 'var(--text-secondary)', display: 'block' }}>USN</span>
              <strong style={{ color: 'var(--text-primary)' }}>{profile?.usn || 'N/A'}</strong>
            </div>
            <div>
              <span style={{ color: 'var(--text-secondary)', display: 'block' }}>Semester</span>
              <strong style={{ color: 'var(--text-primary)' }}>Sem {profile?.semester || '-'}</strong>
            </div>
            <div>
              <span style={{ color: 'var(--text-secondary)', display: 'block' }}>Blood Group</span>
              <strong style={{ color: '#ef4444' }}>{profile?.blood_group || 'N/A'}</strong>
            </div>
            <div>
              <span style={{ color: 'var(--text-secondary)', display: 'block' }}>Gender</span>
              <strong style={{ color: 'var(--text-primary)', textTransform: 'capitalize' }}>{profile?.gender || '-'}</strong>
            </div>
          </div>
        </div>

        {/* Registered Events Pills */}
        <div style={{ marginTop: '0.85rem', display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
          {profile?.ev1 && (
            <span style={{ padding: '0.2rem 0.5rem', borderRadius: '4px', background: 'rgba(59, 130, 246, 0.15)', color: '#60a5fa', fontSize: '0.7rem', fontWeight: 600 }}>
              1️⃣ {(profile.ev1 as any).name}
            </span>
          )}
          {profile?.ev2 && (
            <span style={{ padding: '0.2rem 0.5rem', borderRadius: '4px', background: 'rgba(59, 130, 246, 0.15)', color: '#60a5fa', fontSize: '0.7rem', fontWeight: 600 }}>
              2️⃣ {(profile.ev2 as any).name}
            </span>
          )}
          {profile?.is_relay && (
            <span style={{ padding: '0.2rem 0.5rem', borderRadius: '4px', background: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24', fontSize: '0.7rem', fontWeight: 600 }}>
              🏃 Relay Squad
            </span>
          )}
          {profile?.is_half_marathon && (
            <span style={{ padding: '0.2rem 0.5rem', borderRadius: '4px', background: 'rgba(16, 185, 129, 0.15)', color: '#34d399', fontSize: '0.7rem', fontWeight: 600 }}>
              🏃 Half Marathon
            </span>
          )}
          {profile?.resEv && (
            <span style={{ padding: '0.2rem 0.5rem', borderRadius: '4px', background: 'rgba(168, 85, 247, 0.15)', color: '#c084fc', fontSize: '0.7rem', fontWeight: 600 }}>
              🛡️ Reserve: {(profile.resEv as any).name}
            </span>
          )}
        </div>
      </div>

      {/* 2. Simplified Logistics Status Summary (Single-Tap Verification) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
        
        {/* Registration Payment */}
        <div style={{ padding: '0.85rem 0.65rem', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', textAlign: 'center' }}>
          <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', display: 'block', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
            Fee Payment
          </span>
          <span style={{ 
            fontSize: '0.75rem', 
            fontWeight: 800, 
            color: isPaymentConfirmed ? 'var(--success)' : 'var(--warning)',
            display: 'block'
          }}>
            {isPaymentConfirmed ? '✓ CONFIRMED' : '⏳ PENDING'}
          </span>
        </div>

        {/* Physical Accreditation */}
        <div style={{ padding: '0.85rem 0.65rem', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', textAlign: 'center' }}>
          <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', display: 'block', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
            Accreditation
          </span>
          <span style={{ 
            fontSize: '0.75rem', 
            fontWeight: 800, 
            color: isAccredited ? 'var(--success)' : 'var(--accent-primary)',
            display: 'block'
          }}>
            {isAccredited ? '✓ ACCREDITED' : '🎟️ SCAN ON DAY'}
          </span>
        </div>

        {/* Single-Tap Hostel */}
        <div style={{ padding: '0.85rem 0.65rem', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', textAlign: 'center' }}>
          <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', display: 'block', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
            Campus Hostel
          </span>
          <span style={{ 
            fontSize: '0.75rem', 
            fontWeight: 800, 
            color: isCheckedInHostel ? 'var(--success)' : 'var(--text-secondary)',
            display: 'block'
          }}>
            {isCheckedInHostel ? '✓ CHECKED IN' : '🏠 NOT ARRIVED'}
          </span>
        </div>

      </div>

      {/* 3. Single-Tap Food Pass Counter */}
      <FoodPassClient foodLogs={foodLogs} />

      {/* 4. Quick Action to Events & Schedule */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
        <Link href="/athlete/events" style={{ textDecoration: 'none' }}>
          <div style={{ padding: '1rem', background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            <span style={{ fontSize: '1.25rem' }}>🏃</span>
            <strong style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>My Events & Heats</strong>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Check lane numbers & reporting &rarr;</span>
          </div>
        </Link>
        <Link href="/athlete/schedule" style={{ textDecoration: 'none' }}>
          <div style={{ padding: '1rem', background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            <span style={{ fontSize: '1.25rem' }}>📅</span>
            <strong style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>Meet Timetable</strong>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>View 4-day competition schedule &rarr;</span>
          </div>
        </Link>
      </div>

    </div>
  );
}

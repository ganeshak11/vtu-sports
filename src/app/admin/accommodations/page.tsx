import React from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { StatBox } from '@/components/ui/StatBox';
import { supabase } from '@/lib/supabase';
import AccommodationAssignmentClient from './AccommodationAssignmentClient';

export default async function AdminAccommodationPage() {
  // Fetch athletes
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, full_name, sslc_name, bib_number, chest_number, college_name, gender, accommodation_checked_in, accommodation_checked_in_at, payment_status')
    .eq('role', 'athlete')
    .order('full_name');

  const athletes = profiles || [];
  const totalAthletes = athletes.length;
  const checkedInCount = athletes.filter(a => a.accommodation_checked_in).length;
  const pendingCount = totalAthletes - checkedInCount;
  const menCheckedIn = athletes.filter(a => a.accommodation_checked_in && (a.gender === 'male' || a.gender === 'men')).length;
  const womenCheckedIn = athletes.filter(a => a.accommodation_checked_in && (a.gender === 'female' || a.gender === 'women')).length;

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ display: 'inline-block', padding: '0.2rem 0.6rem', borderRadius: '4px', background: 'rgba(59, 130, 246, 0.1)', color: 'var(--accent-primary)', fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.5rem' }}>
            Dr. ACS College of Engineering Campus
          </div>
          <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '0.25rem' }}>Campus Accommodation</h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            Single-tap hostel arrival check-in and athlete campus housing overview
          </p>
        </div>
        <div>
          <Link href="/warden">
            <Button variant="primary">📷 Open Warden Scanner Desk</Button>
          </Link>
        </div>
      </div>

      {/* Stats Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
        <StatBox
          title="Total Registered Athletes"
          value={totalAthletes.toString()}
          accent="blue"
        />
        <StatBox
          title="Campus Checked-In"
          value={checkedInCount.toString()}
          accent="emerald"
        />
        <StatBox
          title="Pending Check-In"
          value={pendingCount.toString()}
          accent="amber"
        />
        <StatBox
          title="Hostel Distribution"
          value={`${menCheckedIn}M / ${womenCheckedIn}W`}
          accent="violet"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Athlete Housing Roster</CardTitle>
        </CardHeader>
        <CardContent>
          <AccommodationAssignmentClient athletes={athletes} />
        </CardContent>
      </Card>
    </div>
  );
}

import React from 'react';
import Link from 'next/link';
import { StatBox } from '@/components/ui/StatBox';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { supabase } from '@/lib/supabase';
import { Badge } from '@/components/ui/Badge';
import RegistrationControlWidget from '@/components/admin/RegistrationControlWidget';

export default async function AdminDashboard() {
  // 0. Meet Settings
  const { data: settings } = await supabase
    .from('meet_settings')
    .select('registration_status, registration_closed_at, host_college_name')
    .maybeSingle();

  // 1. Total Athletes
  const { count: totalAthletes } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .eq('role', 'athlete');

  // 2. Total Colleges
  const { data: collegesData } = await supabase
    .from('profiles')
    .select('college_name')
    .eq('role', 'athlete');
  const uniqueColleges = new Set(collegesData?.map(p => p.college_name).filter(Boolean));
  const totalColleges = uniqueColleges.size;

  // 3. Room Occupancy
  const { data: accommodations } = await supabase
    .from('accommodations')
    .select('capacity, current_occupancy');
  
  let totalCapacity = 0;
  let totalOccupied = 0;
  accommodations?.forEach(acc => {
    totalCapacity += acc.capacity || 0;
    totalOccupied += acc.current_occupancy || 0;
  });
  const occupancyRate = totalCapacity > 0 ? Math.round((totalOccupied / totalCapacity) * 100) : 0;

  // 4. Meals Served
  const { count: mealsServed } = await supabase
    .from('food_logs')
    .select('*', { count: 'exact', head: true });

  // 5. Recent Registrations
  const { data: recentRegistrations } = await supabase
    .from('profiles')
    .select('id, full_name, sslc_name, chest_number, bib_number, college_name, accreditation_status')
    .eq('role', 'athlete')
    .order('created_at', { ascending: false })
    .limit(5);

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '0.25rem' }}>Event Control Center</h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            Dr. ACS College of Engineering &bull; VTU Athletics Meet 2026 Operations
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <a href="/api/admin/export-athletes" download="VTU_Athletics_2026_All_Athletes.xlsx" style={{ textDecoration: 'none' }}>
            <Button 
              variant="primary" 
              style={{ background: '#059669', borderColor: '#059669', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700 }}
            >
              <span>📊 Export Athletes (.xlsx)</span>
            </Button>
          </a>
          <Link href="/admin/accreditation">
            <Button variant="secondary">🎟️ Accreditation Desk</Button>
          </Link>
          <Link href="/admin/events">
            <Button variant="secondary">Manage Events</Button>
          </Link>
        </div>
      </div>

      {/* Registration & Bib Control Widget */}
      <RegistrationControlWidget
        initialStatus={settings?.registration_status || 'OPEN'}
        closedAt={settings?.registration_closed_at || null}
        hostCollege={settings?.host_college_name || 'Dr. ACS College of Engineering'}
      />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        <StatBox 
          title="Total Athletes" 
          value={totalAthletes?.toString() || "0"} 
          accent="blue"
        />
        <StatBox 
          title="Total Colleges" 
          value={totalColleges.toString()} 
          accent="violet"
        />
        <StatBox 
          title="Rooms Occupied" 
          value={`${occupancyRate}%`} 
          accent="emerald"
        />
        <StatBox 
          title="Meals Served" 
          value={mealsServed?.toString() || "0"} 
          accent="amber"
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
        <Card className="hover-lift">
          <CardHeader>
            <CardTitle>Recent Registrations</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Real-time DB Data */}
            <div style={{ background: 'var(--bg-tertiary)', padding: '1rem', borderRadius: 'var(--radius-sm)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.5rem', borderBottom: '1px solid var(--border-color)', marginBottom: '0.5rem', fontWeight: 600 }}>
                <span>Athlete</span>
                <span>College</span>
                <span>Status</span>
              </div>
              
              {!recentRegistrations || recentRegistrations.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '1rem', color: 'var(--text-secondary)' }}>
                  No athletes registered yet.
                </div>
              ) : (
                recentRegistrations.map(athlete => (
                  <div key={athlete.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem 0', borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                    <span>{athlete.full_name || athlete.sslc_name || 'Athlete'} {athlete.bib_number ? `(#${athlete.bib_number})` : ''}</span>
                    <span style={{ color: 'var(--text-secondary)' }}>{athlete.college_name || 'N/A'}</span>
                    <span>
                      {athlete.accreditation_status === 'ACCREDITED' ? (
                         <Badge variant="success">Accredited</Badge>
                      ) : (
                         <Badge variant="default">Registered</Badge>
                      )}
                    </span>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="hover-lift">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            <a href="/api/admin/export-athletes" download="VTU_Athletics_2026_All_Athletes.xlsx" style={{ width: '100%', textDecoration: 'none' }}>
              <Button variant="primary" style={{ width: '100%', justifyContent: 'flex-start', background: '#059669', borderColor: '#059669', fontWeight: 700 }}>
                📊 Export All Details (.xlsx)
              </Button>
            </a>
            <Link href="/admin/athletes" style={{ width: '100%' }}>
              <Button variant="secondary" style={{ width: '100%', justifyContent: 'flex-start' }}>
                👥 View All Athletes ({totalAthletes || 0})
              </Button>
            </Link>
            <Link href="/admin/id-cards" style={{ width: '100%' }}>
              <Button variant="secondary" style={{ width: '100%', justifyContent: 'flex-start' }}>
                🪪 Print Athlete ID Badges
              </Button>
            </Link>
            <Link href="/admin/accommodations" style={{ width: '100%' }}>
              <Button variant="secondary" style={{ width: '100%', justifyContent: 'flex-start' }}>
                🏢 Assign Accommodation
              </Button>
            </Link>
            <Link href="/admin/events" style={{ width: '100%' }}>
              <Button variant="secondary" style={{ width: '100%', justifyContent: 'flex-start' }}>
                ⏱️ Manage Schedule & Heats
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

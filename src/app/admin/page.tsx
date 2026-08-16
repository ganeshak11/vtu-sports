import React from 'react';
import { StatBox } from '@/components/ui/StatBox';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { supabase } from '@/lib/supabase';
import { Badge } from '@/components/ui/Badge';
import Link from 'next/link';

export default async function AdminDashboard() {
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
    .select('id, full_name, chest_number, college_name, arrival_status')
    .eq('role', 'athlete')
    .order('created_at', { ascending: false })
    .limit(5);

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '0.5rem' }}>Event Control Center</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Overview of VTU Athletics Meet Operations</p>
        </div>
        <Link href="/admin/events">
          <Button variant="primary">Manage Events</Button>
        </Link>
      </div>

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
                    <span>{athlete.full_name} ({athlete.chest_number})</span>
                    <span style={{ color: 'var(--text-secondary)' }}>{athlete.college_name || 'N/A'}</span>
                    <span>
                      {athlete.arrival_status === 'arrived' ? (
                         <Badge variant="success">Arrived</Badge>
                      ) : athlete.arrival_status === 'on_transit' ? (
                         <Badge variant="warning">In Transit</Badge>
                      ) : (
                         <Badge variant="default">Not Started</Badge>
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
          <CardContent style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <Link href="/admin/athletes" style={{ width: '100%' }}>
              <Button variant="secondary" style={{ width: '100%', justifyContent: 'flex-start' }}>
                View All Athletes
              </Button>
            </Link>
            <Link href="/admin/accommodations" style={{ width: '100%' }}>
              <Button variant="secondary" style={{ width: '100%', justifyContent: 'flex-start' }}>
                Assign Accommodation
              </Button>
            </Link>
            <Link href="/admin/events" style={{ width: '100%' }}>
              <Button variant="secondary" style={{ width: '100%', justifyContent: 'flex-start' }}>
                Manage Schedule
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

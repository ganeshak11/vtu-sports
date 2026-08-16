import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { StatBox } from '@/components/ui/StatBox';
import { supabase } from '@/lib/supabase';

// Helper to group profiles by college
function aggregateArrivals(profiles: any[]) {
  const collegeMap = new Map<string, { total: number, arrived: number, transit: number, notStarted: number }>();

  profiles.forEach(p => {
    // Only count athletes
    if (p.role !== 'athlete' || !p.college_name) return;

    if (!collegeMap.has(p.college_name)) {
      collegeMap.set(p.college_name, { total: 0, arrived: 0, transit: 0, notStarted: 0 });
    }

    const stats = collegeMap.get(p.college_name)!;
    stats.total += 1;
    
    if (p.arrival_status === 'arrived') stats.arrived += 1;
    else if (p.arrival_status === 'on_transit') stats.transit += 1;
    else stats.notStarted += 1;
  });

  return Array.from(collegeMap.entries()).map(([college, stats]) => ({
    college,
    ...stats
  })).sort((a, b) => b.total - a.total); // Sort by largest contingent
}

export default async function ArrivalsDashboard() {
  const { data: profiles, error } = await supabase.from('profiles').select('*');
  
  if (error) {
    console.error('Error fetching profiles:', error);
  }

  const arrivalData = profiles ? aggregateArrivals(profiles) : [];

  const totalAthletes = arrivalData.reduce((acc, curr) => acc + curr.total, 0);
  const totalArrived = arrivalData.reduce((acc, curr) => acc + curr.arrived, 0);
  const totalTransit = arrivalData.reduce((acc, curr) => acc + curr.transit, 0);
  const trendValue = totalAthletes > 0 ? Math.round((totalArrived / totalAthletes) * 100) : 0;

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div>
        <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '0.5rem' }}>Arrival Tracking</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Monitor college-wise athlete arrivals in real-time.</p>
      </div>

      {/* High-level stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
        <StatBox title="Expected Athletes" value={totalAthletes} />
        <StatBox title="Arrived" value={totalArrived} trend={totalAthletes > 0 ? { value: trendValue, isPositive: true } : undefined} />
        <StatBox title="In Transit" value={totalTransit} />
      </div>

      {/* Data Table */}
      <Card>
        <CardHeader>
          <CardTitle>College-wise Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>
                  <th style={{ padding: '1rem', fontWeight: 500 }}>College</th>
                  <th style={{ padding: '1rem', fontWeight: 500 }}>Total Athletes</th>
                  <th style={{ padding: '1rem', fontWeight: 500 }}>Arrived</th>
                  <th style={{ padding: '1rem', fontWeight: 500 }}>In Transit</th>
                  <th style={{ padding: '1rem', fontWeight: 500 }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {arrivalData.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                      No athlete data found in Supabase. Please add profiles!
                    </td>
                  </tr>
                ) : (
                  arrivalData.map((data, index) => (
                    <tr key={index} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                      <td style={{ padding: '1rem', fontWeight: 500 }}>{data.college}</td>
                      <td style={{ padding: '1rem' }}>{data.total}</td>
                      <td style={{ padding: '1rem', color: 'var(--success)' }}>{data.arrived}</td>
                      <td style={{ padding: '1rem', color: 'var(--warning)' }}>{data.transit}</td>
                      <td style={{ padding: '1rem' }}>
                        {data.arrived === data.total ? (
                          <Badge variant="success">Complete</Badge>
                        ) : data.transit > 0 || data.arrived > 0 ? (
                          <Badge variant="warning">In Progress</Badge>
                        ) : (
                          <Badge variant="default">Not Started</Badge>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

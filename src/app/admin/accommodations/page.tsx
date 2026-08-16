import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { supabase } from '@/lib/supabase';
import AccommodationAssignmentClient from './AccommodationAssignmentClient';

export default async function AdminAccommodationPage() {
  // Fetch accommodations
  const { data: accommodations } = await supabase
    .from('accommodations')
    .select('*')
    .order('name');

  // Fetch athletes
  const { data: profiles } = await supabase
    .from('profiles')
    .select('*, accommodations(name)')
    .eq('role', 'athlete')
    .order('full_name');

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div>
        <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '0.5rem' }}>Room Assignment</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Allocate athletes to hostels and assign room numbers.</p>
      </div>

      {/* Stats Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
        {accommodations?.map((acc) => (
          <Card key={acc.id}>
            <CardContent style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--text-secondary)' }}>{acc.name}</h3>
                <span style={{ 
                  fontSize: '0.75rem', 
                  padding: '0.25rem 0.5rem', 
                  borderRadius: '1rem', 
                  background: acc.gender_allowed === 'men' ? 'rgba(59, 130, 246, 0.1)' : acc.gender_allowed === 'women' ? 'rgba(236, 72, 153, 0.1)' : 'var(--bg-tertiary)',
                  color: acc.gender_allowed === 'men' ? '#3b82f6' : acc.gender_allowed === 'women' ? '#ec4899' : 'var(--text-secondary)',
                  textTransform: 'capitalize',
                  fontWeight: 600
                }}>
                  {acc.gender_allowed} Only
                </span>
              </div>
              <div style={{ fontSize: '2rem', fontWeight: 800, marginTop: '0.5rem', color: acc.current_occupancy >= acc.capacity ? 'var(--danger)' : 'var(--text-primary)' }}>
                {acc.current_occupancy} <span style={{ fontSize: '1rem', color: 'var(--text-secondary)' }}>/ {acc.capacity}</span>
              </div>
              <div style={{ marginTop: '0.75rem', background: 'var(--bg-tertiary)', height: '6px', borderRadius: '3px', overflow: 'hidden' }}>
                <div style={{ 
                  height: '100%', 
                  width: `${Math.min(100, (acc.current_occupancy / acc.capacity) * 100)}%`, 
                  background: acc.current_occupancy >= acc.capacity ? 'var(--danger)' : 'var(--accent-primary)' 
                }} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Athlete Roster</CardTitle>
        </CardHeader>
        <CardContent>
          <AccommodationAssignmentClient 
            athletes={profiles || []} 
            accommodations={accommodations || []} 
          />
        </CardContent>
      </Card>
    </div>
  );
}

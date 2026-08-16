import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { supabase } from '@/lib/supabase';
import { EventBuilderClient } from './EventBuilderClient';

export default async function DynamicEventsDashboard() {
  // Fetch existing events
  const { data: events } = await supabase
    .from('events')
    .select('*, qualification_rules(name)')
    .order('start_date');

  // Fetch qualification rules to populate dropdowns
  const { data: rules } = await supabase
    .from('qualification_rules')
    .select('id, name');

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div>
        <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '0.5rem' }}>Dynamic Event Engine</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Create and configure generic events with dynamic JSONB rules.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2rem' }}>
        <EventBuilderClient qualificationRules={rules || []} />

        <Card>
          <CardHeader>
            <CardTitle>Existing Events</CardTitle>
          </CardHeader>
          <CardContent>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>
                    <th style={{ padding: '1rem', fontWeight: 500 }}>Event Code</th>
                    <th style={{ padding: '1rem', fontWeight: 500 }}>Name</th>
                    <th style={{ padding: '1rem', fontWeight: 500 }}>Category</th>
                    <th style={{ padding: '1rem', fontWeight: 500 }}>Gender</th>
                    <th style={{ padding: '1rem', fontWeight: 500 }}>Qual. Rule</th>
                  </tr>
                </thead>
                <tbody>
                  {events?.map((ev) => (
                    <tr key={ev.id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                      <td style={{ padding: '1rem', fontWeight: 700, color: 'var(--accent-primary)' }}>{ev.code || ev.official_pin}</td>
                      <td style={{ padding: '1rem', fontWeight: 500 }}>{ev.name}</td>
                      <td style={{ padding: '1rem', textTransform: 'capitalize' }}>{ev.category}</td>
                      <td style={{ padding: '1rem', textTransform: 'capitalize' }}>{ev.gender}</td>
                      <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>
                        {ev.qualification_rules?.name || 'Default'}
                      </td>
                    </tr>
                  ))}
                  {(!events || events.length === 0) && (
                    <tr>
                      <td colSpan={5} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                        No events found. Create one above!
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

'use client';

import React, { useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export function AthleteTableClient({ athletes, colleges, events }: { athletes: any[], colleges: string[], events: any[] }) {
  const [genderFilter, setGenderFilter] = useState<string>('all');
  const [collegeFilter, setCollegeFilter] = useState<string>('all');
  const [eventFilter, setEventFilter] = useState<string>('all');

  const filteredAthletes = useMemo(() => {
    return athletes.filter(athlete => {
      // Gender check
      if (genderFilter !== 'all' && athlete.gender !== genderFilter) return false;
      
      // College check
      if (collegeFilter !== 'all' && athlete.college_name !== collegeFilter) return false;
      
      // Event check
      if (eventFilter !== 'all') {
        const athleteEvents = athlete.event_registrations?.map((reg: any) => reg.events?.id) || [];
        if (!athleteEvents.includes(eventFilter)) return false;
      }
      
      return true;
    });
  }, [athletes, genderFilter, collegeFilter, eventFilter]);

  const handleExportCSV = () => {
    // Generate CSV data
    const headers = ['Chest Number', 'Name', 'College', 'Gender', 'Events', 'Arrival Status'];
    const rows = filteredAthletes.map(a => {
      const eventsStr = a.event_registrations?.map((r: any) => r.events?.name).join(', ') || '';
      return [
        a.chest_number,
        `"${a.full_name}"`, // Quote to handle commas in name
        `"${a.college_name || 'N/A'}"`,
        a.gender || 'N/A',
        `"${eventsStr}"`,
        a.arrival_status?.replace('_', ' ') || 'N/A'
      ].join(',');
    });

    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', 'filtered_athletes.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Card>
      <CardHeader>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <CardTitle>Registered Athletes ({filteredAthletes.length})</CardTitle>
          <Button onClick={handleExportCSV} variant="primary" className="text-sm">
            Export as CSV
          </Button>
        </div>
        <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem', flexWrap: 'wrap' }}>
          {/* Gender Filter */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Gender</label>
            <select 
              value={genderFilter} 
              onChange={(e) => setGenderFilter(e.target.value)}
              style={{ padding: '0.5rem', borderRadius: 'var(--radius-sm)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', border: '1px solid var(--border-color)' }}
            >
              <option value="all">All Genders</option>
              <option value="men">Men</option>
              <option value="women">Women</option>
            </select>
          </div>
          
          {/* College Filter */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>College</label>
            <select 
              value={collegeFilter} 
              onChange={(e) => setCollegeFilter(e.target.value)}
              style={{ padding: '0.5rem', borderRadius: 'var(--radius-sm)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', border: '1px solid var(--border-color)', maxWidth: '250px' }}
            >
              <option value="all">All Colleges</option>
              {colleges.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          
          {/* Event Filter */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Event</label>
            <select 
              value={eventFilter} 
              onChange={(e) => setEventFilter(e.target.value)}
              style={{ padding: '0.5rem', borderRadius: 'var(--radius-sm)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', border: '1px solid var(--border-color)', maxWidth: '300px' }}
            >
              <option value="all">All Events</option>
              {events.map(ev => <option key={ev.id} value={ev.id}>{ev.name} ({ev.gender})</option>)}
            </select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>
                <th style={{ padding: '1rem', fontWeight: 500 }}>Chest Number</th>
                <th style={{ padding: '1rem', fontWeight: 500 }}>Name</th>
                <th style={{ padding: '1rem', fontWeight: 500 }}>College</th>
                <th style={{ padding: '1rem', fontWeight: 500 }}>Gender</th>
                <th style={{ padding: '1rem', fontWeight: 500 }}>Events</th>
                <th style={{ padding: '1rem', fontWeight: 500 }}>Arrival Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredAthletes.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                    No athletes found matching the filters.
                  </td>
                </tr>
              ) : (
                filteredAthletes.map((athlete, index) => (
                  <tr key={index} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                    <td style={{ padding: '1rem', fontWeight: 700 }}>{athlete.chest_number}</td>
                    <td style={{ padding: '1rem' }}>{athlete.full_name}</td>
                    <td style={{ padding: '1rem' }}>{athlete.college_name || 'N/A'}</td>
                    <td style={{ padding: '1rem', textTransform: 'capitalize' }}>{athlete.gender || 'N/A'}</td>
                    <td style={{ padding: '1rem' }}>
                      {athlete.event_registrations?.map((reg: any, i: number) => (
                        <div key={i} style={{ fontSize: '0.875rem' }}>{reg.events?.name}</div>
                      ))}
                    </td>
                    <td style={{ padding: '1rem', textTransform: 'capitalize' }}>{athlete.arrival_status?.replace('_', ' ')}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

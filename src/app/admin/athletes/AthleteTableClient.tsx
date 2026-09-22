'use client';

import React, { useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

import * as XLSX from 'xlsx';

export function AthleteTableClient({ athletes, colleges, events }: { athletes: any[], colleges: string[], events: any[] }) {
  const [genderFilter, setGenderFilter] = useState<string>('all');
  const [collegeFilter, setCollegeFilter] = useState<string>('all');
  const [eventFilter, setEventFilter] = useState<string>('all');

  const eventMap = useMemo(() => {
    const map = new Map<string, string>();
    events.forEach(e => map.set(e.id, e.name));
    return map;
  }, [events]);

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

  const handleExportXLSX = (exportAll = false) => {
    const targetList = exportAll ? athletes : filteredAthletes;
    const rows = targetList.map((a, idx) => ({
      'Sl. No.': idx + 1,
      'Bib Number': a.bib_number || 'Unassigned',
      'Chest Number': a.chest_number || '-',
      'Athlete Name (as per SSLC)': a.sslc_name || a.full_name || 'N/A',
      'USN': a.usn || 'N/A',
      'College / Institution': a.college_name || 'N/A',
      'Gender': a.gender ? a.gender.toUpperCase() : 'N/A',
      'Semester': a.semester ? `Semester ${a.semester}` : 'N/A',
      'Semester Start Date': a.sem_start_date || 'N/A',
      'College Joining / Start Date': a.college_joining_date || 'N/A',
      'Blood Group': a.blood_group || 'N/A',
      'Event 1 (Regular)': (a.event1_id && eventMap.get(a.event1_id)) || (a.event_registrations?.[0]?.events?.name) || 'N/A',
      'Event 2 (Regular)': (a.event2_id && eventMap.get(a.event2_id)) || (a.event_registrations?.[1]?.events?.name) || 'None',
      'Reserve Event': (a.reserve_event_id && eventMap.get(a.reserve_event_id)) || 'None',
      '4x100m Relay Squad': a.is_relay ? 'YES' : 'NO',
      '21km Half Marathon': a.is_half_marathon ? 'YES' : 'NO',
      'Accreditation Status': a.accreditation_status || 'REGISTERED',
      'Accredited At': a.accredited_at ? new Date(a.accredited_at).toLocaleString('en-IN') : '-',
      'Fee Payment Status': a.payment_status || 'PENDING',
      'Fee Amount Paid': a.amount_paid ? `₹${a.amount_paid}` : '₹0',
      'Razorpay Payment ID': a.payment_id || '-',
      'Hostel Room #': a.room_number || 'Not Assigned',
      'Hostel Checked-in': a.accommodation_checked_in ? 'YES' : 'NO',
      'Campus Arrival Status': a.arrival_status ? a.arrival_status.replace('_', ' ') : 'Pending',
      'Registration Date': a.created_at ? new Date(a.created_at).toLocaleString('en-IN') : '-'
    }));

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(rows);

    ws['!cols'] = [
      { wch: 8 },  // Sl. No.
      { wch: 12 }, // Bib
      { wch: 14 }, // Chest
      { wch: 28 }, // Name
      { wch: 16 }, // USN
      { wch: 32 }, // College
      { wch: 10 }, // Gender
      { wch: 14 }, // Semester
      { wch: 20 }, // Sem Start Date
      { wch: 26 }, // College Joining Date
      { wch: 12 }, // Blood Group
      { wch: 24 }, // Event 1
      { wch: 24 }, // Event 2
      { wch: 24 }, // Reserve Event
      { wch: 18 }, // Relay
      { wch: 20 }, // Half Marathon
      { wch: 22 }, // Accreditation Status
      { wch: 24 }, // Accredited At
      { wch: 18 }, // Payment Status
      { wch: 16 }, // Fee Amount Paid
      { wch: 24 }, // Payment ID
      { wch: 16 }, // Hostel Room #
      { wch: 18 }, // Hostel Checked-in
      { wch: 22 }, // Arrival Status
      { wch: 24 }  // Registration Date
    ];

    XLSX.utils.book_append_sheet(wb, ws, 'VTU Athletes Roster');

    const suffix = exportAll 
      ? 'All_Athletes' 
      : collegeFilter !== 'all' ? collegeFilter.replace(/[^a-zA-Z0-9]/g, '_') : 'Filtered';

    XLSX.writeFile(wb, `VTU_Athletics_2026_${suffix}.xlsx`);
  };

  const handleExportCSV = () => {
    // Generate CSV data with all columns
    const headers = [
      'Sl. No.',
      'Bib Number',
      'Chest Number',
      'Athlete Name',
      'USN',
      'College',
      'Gender',
      'Semester',
      'Semester Start Date',
      'College Joining Date',
      'Blood Group',
      'Event 1',
      'Event 2',
      'Reserve Event',
      'Relay Squad',
      'Half Marathon',
      'Accreditation Status',
      'Payment Status',
      'Amount Paid'
    ];
    const rows = filteredAthletes.map((a, idx) => {
      const ev1 = (a.event1_id && eventMap.get(a.event1_id)) || (a.event_registrations?.[0]?.events?.name) || 'N/A';
      const ev2 = (a.event2_id && eventMap.get(a.event2_id)) || (a.event_registrations?.[1]?.events?.name) || 'None';
      const rev = (a.reserve_event_id && eventMap.get(a.reserve_event_id)) || 'None';
      return [
        idx + 1,
        a.bib_number || '',
        a.chest_number || '',
        `"${a.sslc_name || a.full_name || 'N/A'}"`,
        `"${a.usn || 'N/A'}"`,
        `"${a.college_name || 'N/A'}"`,
        a.gender || 'N/A',
        a.semester || '',
        a.sem_start_date || '',
        a.college_joining_date || '',
        a.blood_group || '',
        `"${ev1}"`,
        `"${ev2}"`,
        `"${rev}"`,
        a.is_relay ? 'YES' : 'NO',
        a.is_half_marathon ? 'YES' : 'NO',
        a.accreditation_status || 'REGISTERED',
        a.payment_status || 'PENDING',
        a.amount_paid || 0
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
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <Button 
              onClick={() => handleExportXLSX(false)} 
              variant="primary" 
              className="text-sm"
              style={{ background: '#059669', borderColor: '#059669', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
            >
              <span>📊 Export to Excel (.xlsx)</span>
            </Button>
            <Button 
              onClick={() => handleExportXLSX(true)} 
              variant="secondary" 
              className="text-sm"
              style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
            >
              <span>📥 Export All 500+ (.xlsx)</span>
            </Button>
            <Button 
              onClick={handleExportCSV} 
              variant="ghost" 
              className="text-sm"
              style={{ border: '1px solid var(--border-color)' }}
            >
              CSV
            </Button>
          </div>
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

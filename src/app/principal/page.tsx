import React from 'react';
import { getSession } from '@/lib/session';
import { supabase } from '@/lib/supabase';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { StatBox } from '@/components/ui/StatBox';
import Link from 'next/link';

export default async function PrincipalDashboard() {
  const session = await getSession();
  const gender = session.targetGender || 'men';
  const collegeId = session.collegeId;
  const collegeName = session.collegeName;

  // 1. Fetch all athletes registered under this college & gender
  let query = supabase
    .from('profiles')
    .select(`
      id,
      sslc_name,
      full_name,
      usn,
      semester,
      blood_group,
      chest_number,
      bib_number,
      payment_status,
      amount_paid,
      accreditation_status,
      is_reserve,
      is_relay,
      is_half_marathon,
      event1_id,
      event2_id,
      reserve_event_id,
      ev1:events!event1_id(name),
      ev2:events!event2_id(name),
      rev:events!reserve_event_id(name)
    `)
    .eq('role', 'athlete')
    .eq('gender', gender);

  if (collegeId) {
    query = query.eq('college_id', collegeId);
  } else if (collegeName) {
    query = query.eq('college_name', collegeName);
  }

  const { data: athletes, error } = await query.order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching contingent:', error);
  }

  const list = athletes || [];
  const confirmed = list.filter(a => a.payment_status === 'CONFIRMED');
  const pending = list.filter(a => a.payment_status !== 'CONFIRMED');
  const relayAthletes = list.filter(a => a.is_relay && a.payment_status === 'CONFIRMED');
  const halfMarathonAthletes = list.filter(a => a.is_half_marathon);

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Title & Actions Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
            {gender === 'men' ? "Men's Athletics Contingent" : "Women's Athletics Contingent"}
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1rem' }}>
            Official registration portal for {collegeName} &bull; Dr. ACS College of Engineering Meet
          </p>
        </div>

        <Link href="/principal/register">
          <button style={{
            background: 'var(--accent-primary)',
            color: '#fff',
            border: 'none',
            padding: '0.75rem 1.5rem',
            borderRadius: 'var(--radius-sm)',
            fontSize: '1rem',
            fontWeight: 700,
            cursor: 'pointer',
            boxShadow: '0 4px 14px var(--accent-glow)'
          }}>
            + Register New Athlete
          </button>
        </Link>
      </div>

      {/* Metrics Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
        <StatBox 
          title="Total Registered" 
          value={list.length.toString()} 
          accent="blue" 
        />
        <StatBox 
          title="Confirmed & Paid" 
          value={confirmed.length.toString()} 
          accent="emerald" 
        />
        <StatBox 
          title="Payment Pending" 
          value={pending.length.toString()} 
          accent="amber" 
        />
        <div style={{
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-md)',
          padding: '1.25rem',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }}>
          <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
            Relay Squad Quota
          </span>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: relayAthletes.length === 4 ? 'var(--success)' : 'var(--accent-primary)' }}>
            {relayAthletes.length} <span style={{ fontSize: '1.125rem', color: 'var(--text-secondary)' }}>/ 4 Max</span>
          </div>
          <span style={{ fontSize: '0.75rem', color: relayAthletes.length === 4 ? 'var(--success)' : 'var(--text-secondary)' }}>
            {relayAthletes.length === 4 ? 'Quota Complete' : `${4 - relayAthletes.length} slots remaining`}
          </span>
        </div>
      </div>

      {/* Athletes Roster Card */}
      <Card>
        <CardHeader>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <CardTitle>Registered Athletes Roster</CardTitle>
            <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
              Showing {list.length} athletes
            </span>
          </div>
        </CardHeader>
        <CardContent style={{ padding: 0 }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)', background: 'var(--bg-tertiary)', color: 'var(--text-secondary)' }}>
                  <th style={{ padding: '1rem', fontWeight: 600 }}>Bib / Status</th>
                  <th style={{ padding: '1rem', fontWeight: 600 }}>Athlete Name (SSLC)</th>
                  <th style={{ padding: '1rem', fontWeight: 600 }}>USN & Sem</th>
                  <th style={{ padding: '1rem', fontWeight: 600 }}>Blood</th>
                  <th style={{ padding: '1rem', fontWeight: 600 }}>Events Registered</th>
                  <th style={{ padding: '1rem', fontWeight: 600, textAlign: 'right' }}>Payment</th>
                </tr>
              </thead>
              <tbody>
                {list.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                      <p style={{ fontSize: '1.125rem', marginBottom: '1rem' }}>No athletes registered yet for this contingent.</p>
                      <Link href="/principal/register">
                        <button style={{
                          background: 'var(--accent-primary)',
                          color: '#fff',
                          border: 'none',
                          padding: '0.5rem 1rem',
                          borderRadius: 'var(--radius-sm)',
                          fontWeight: 600,
                          cursor: 'pointer'
                        }}>
                          Register First Athlete
                        </button>
                      </Link>
                    </td>
                  </tr>
                ) : (
                  list.map(athlete => {
                    const ev1Name = (athlete.ev1 as any)?.name;
                    const ev2Name = (athlete.ev2 as any)?.name;
                    const revName = (athlete.rev as any)?.name;
                    const isConfirmed = athlete.payment_status === 'CONFIRMED';

                    return (
                      <tr key={athlete.id} style={{ borderBottom: '1px solid var(--border-color)', transition: 'background 0.15s' }}>
                        
                        {/* Bib Number */}
                        <td style={{ padding: '1rem' }}>
                          {athlete.bib_number ? (
                            <span style={{ 
                              fontWeight: 800, 
                              fontSize: '1rem', 
                              color: 'var(--accent-primary)',
                              background: 'rgba(37, 99, 235, 0.08)',
                              padding: '0.25rem 0.5rem',
                              borderRadius: 'var(--radius-sm)'
                            }}>
                              #{athlete.bib_number}
                            </span>
                          ) : (
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                              Assigned on Close
                            </span>
                          )}
                        </td>

                        {/* Name */}
                        <td style={{ padding: '1rem' }}>
                          <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                            {athlete.sslc_name || athlete.full_name}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                            Accreditation: {athlete.accreditation_status}
                          </div>
                        </td>

                        {/* USN & Semester */}
                        <td style={{ padding: '1rem' }}>
                          <div style={{ fontWeight: 600, fontFamily: 'monospace' }}>{athlete.usn || 'N/A'}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                            Sem {athlete.semester || 1}
                          </div>
                        </td>

                        {/* Blood Group */}
                        <td style={{ padding: '1rem' }}>
                          <span style={{ fontWeight: 600, color: 'var(--danger)' }}>
                            {athlete.blood_group || 'O+'}
                          </span>
                        </td>

                        {/* Events */}
                        <td style={{ padding: '1rem' }}>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                            {ev1Name && (
                              <div style={{ fontSize: '0.875rem', fontWeight: 600 }}>
                                &bull; {ev1Name}
                              </div>
                            )}
                            {ev2Name && (
                              <div style={{ fontSize: '0.875rem', fontWeight: 600 }}>
                                &bull; {ev2Name}
                              </div>
                            )}
                            {revName && (
                              <div style={{ fontSize: '0.75rem', color: 'var(--warning)', fontWeight: 500 }}>
                                Reserve: {revName}
                              </div>
                            )}
                            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.25rem' }}>
                              {athlete.is_relay && (
                                <span style={{ fontSize: '0.65rem', padding: '0.1rem 0.4rem', background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)', borderRadius: '4px', fontWeight: 700 }}>
                                  RELAY
                                </span>
                              )}
                              {athlete.is_half_marathon && (
                                <span style={{ fontSize: '0.65rem', padding: '0.1rem 0.4rem', background: 'rgba(139, 92, 246, 0.1)', color: '#8b5cf6', borderRadius: '4px', fontWeight: 700 }}>
                                  HALF MARATHON
                                </span>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Payment Status */}
                        <td style={{ padding: '1rem', textAlign: 'right' }}>
                          {isConfirmed ? (
                            <Badge variant="success">CONFIRMED</Badge>
                          ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.25rem' }}>
                              <Badge variant="warning">PAYMENT PENDING</Badge>
                              <Link href={`/principal/checkout?athleteId=${athlete.id}`}>
                                <span style={{ fontSize: '0.75rem', color: 'var(--accent-primary)', fontWeight: 600, textDecoration: 'underline' }}>
                                  Pay ₹{athlete.amount_paid || 100} &rarr;
                                </span>
                              </Link>
                            </div>
                          )}
                        </td>

                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

    </div>
  );
}

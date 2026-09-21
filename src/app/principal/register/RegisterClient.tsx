'use client';

import React, { useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { createAthleteRegistration } from '@/app/actions/registration';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface EventItem {
  id: string;
  name: string;
  category: string;
}

interface Props {
  events: EventItem[];
  collegeName: string;
  gender: 'men' | 'women';
  currentRelayCount: number;
}

export default function RegisterClient({ events, collegeName, gender, currentRelayCount }: Props) {
  const router = useRouter();

  // Form State
  const [sslcName, setSslcName] = useState('');
  const [usn, setUsn] = useState('');
  const [semester, setSemester] = useState('1');
  const [bloodGroup, setBloodGroup] = useState('O+');
  const [joiningDate, setJoiningDate] = useState('2023-08-01');
  const [semStartDate, setSemStartDate] = useState('2026-02-01');

  // Event Selection State
  const [event1Id, setEvent1Id] = useState('');
  const [event2Id, setEvent2Id] = useState('');
  const [reserveEventId, setReserveEventId] = useState('');
  const [isRelay, setIsRelay] = useState(false);
  const [isHalfMarathon, setIsHalfMarathon] = useState(false);

  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Dynamic Pricing Calculation
  // Event 1 = ₹100, Event 2 = ₹100, Reserve = ₹0, Relay = ₹0, Half Marathon = ₹0
  const totalPrice = useMemo(() => {
    let fee = 0;
    if (event1Id) fee += 100;
    if (event2Id) fee += 100;
    return fee;
  }, [event1Id, event2Id]);

  const relayQuotaFull = currentRelayCount >= 4;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!event1Id) {
      setErrorMsg('Please select Event 1 (Compulsory).');
      return;
    }

    setIsLoading(true);

    const res = await createAthleteRegistration({
      sslcName,
      usn,
      semester: parseInt(semester, 10),
      bloodGroup,
      collegeJoiningDate: joiningDate,
      semStartDate,
      event1Id,
      event2Id: event2Id || undefined,
      reserveEventId: reserveEventId || undefined,
      isRelay,
      isHalfMarathon
    });

    if (res.error) {
      setErrorMsg(res.error);
      setIsLoading(false);
    } else if (res.success && res.athleteId) {
      // Proceed to Razorpay checkout
      router.push(`/principal/checkout?athleteId=${res.athleteId}&amount=${res.amount}`);
    }
  };

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Header breadcrumb & info */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <Link href="/principal" style={{ fontSize: '0.875rem', color: 'var(--accent-primary)', fontWeight: 600 }}>
            &larr; Back to Contingent Roster
          </Link>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, marginTop: '0.5rem' }}>
            Register Athlete ({gender === 'men' ? "Boys" : "Girls"})
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            {collegeName} &bull; Official Registration Form for Dr. ACS College of Engineering Meet
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
          
          {/* Main Form Fields */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            
            {/* 1. Academic & Personal Details */}
            <Card>
              <CardHeader>
                <CardTitle style={{ fontSize: '1.125rem' }}>1. Student Identity (as per SSLC)</CardTitle>
              </CardHeader>
              <CardContent style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                
                <div>
                  <label style={labelStyle}>Full Name (as per SSLC Marks Card) *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. RAJESH KUMAR S"
                    value={sslcName}
                    onChange={(e) => setSslcName(e.target.value)}
                    style={inputStyle}
                  />
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    Exact name will be printed on the official Bib number and Certificates.
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={labelStyle}>USN (University Seat No) *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 1ME21CS045"
                      value={usn}
                      onChange={(e) => setUsn(e.target.value)}
                      style={{ ...inputStyle, textTransform: 'uppercase' }}
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>Current Semester *</label>
                    <select
                      value={semester}
                      onChange={(e) => setSemester(e.target.value)}
                      style={inputStyle}
                    >
                      {[1, 2, 3, 4, 5, 6, 7, 8].map(s => (
                        <option key={s} value={s}>Semester {s}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={labelStyle}>Blood Group *</label>
                    <select
                      value={bloodGroup}
                      onChange={(e) => setBloodGroup(e.target.value)}
                      style={inputStyle}
                    >
                      {['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map(bg => (
                        <option key={bg} value={bg}>{bg}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label style={labelStyle}>College Joining Date *</label>
                    <input
                      type="date"
                      required
                      value={joiningDate}
                      onChange={(e) => setJoiningDate(e.target.value)}
                      style={inputStyle}
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>Sem Start Date *</label>
                    <input
                      type="date"
                      required
                      value={semStartDate}
                      onChange={(e) => setSemStartDate(e.target.value)}
                      style={inputStyle}
                    />
                  </div>
                </div>

              </CardContent>
            </Card>

            {/* 2. Event Selection Rules */}
            <Card>
              <CardHeader>
                <CardTitle style={{ fontSize: '1.125rem' }}>2. Event Selection & Disciplines</CardTitle>
              </CardHeader>
              <CardContent style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                
                {/* Event 1 */}
                <div style={{ background: 'var(--bg-tertiary)', padding: '1rem', borderRadius: 'var(--radius-sm)', borderLeft: '4px solid var(--accent-primary)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <label style={{ ...labelStyle, marginBottom: 0, fontWeight: 700 }}>Event 1 (Compulsory) *</label>
                    <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--accent-primary)' }}>₹100</span>
                  </div>
                  <select
                    required
                    value={event1Id}
                    onChange={(e) => {
                      setEvent1Id(e.target.value);
                      if (e.target.value === event2Id) setEvent2Id('');
                      if (e.target.value === reserveEventId) setReserveEventId('');
                    }}
                    style={inputStyle}
                  >
                    <option value="">-- Choose Individual Event 1 --</option>
                    {events.map(ev => (
                      <option key={ev.id} value={ev.id}>
                        {ev.name} ({ev.category.toUpperCase()})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Event 2 */}
                <div style={{ background: 'var(--bg-tertiary)', padding: '1rem', borderRadius: 'var(--radius-sm)', borderLeft: '4px solid var(--accent-secondary)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <label style={{ ...labelStyle, marginBottom: 0, fontWeight: 700 }}>Event 2 (Optional)</label>
                    <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--accent-secondary)' }}>+₹100</span>
                  </div>
                  <select
                    value={event2Id}
                    onChange={(e) => {
                      setEvent2Id(e.target.value);
                      if (e.target.value === reserveEventId) setReserveEventId('');
                    }}
                    style={inputStyle}
                  >
                    <option value="">-- None (Single Event Only) --</option>
                    {events.filter(ev => ev.id !== event1Id).map(ev => (
                      <option key={ev.id} value={ev.id}>
                        {ev.name} ({ev.category.toUpperCase()})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Reserve Event */}
                <div style={{ background: 'var(--bg-tertiary)', padding: '1rem', borderRadius: 'var(--radius-sm)', borderLeft: '4px solid var(--warning)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <label style={{ ...labelStyle, marginBottom: 0, fontWeight: 700 }}>Reserve Event (Optional)</label>
                    <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--success)' }}>FREE</span>
                  </div>
                  <select
                    value={reserveEventId}
                    onChange={(e) => setReserveEventId(e.target.value)}
                    style={inputStyle}
                  >
                    <option value="">-- None (No Reserve Discipline) --</option>
                    {events.filter(ev => ev.id !== event1Id && ev.id !== event2Id).map(ev => (
                      <option key={ev.id} value={ev.id}>
                        {ev.name} ({ev.category.toUpperCase()})
                      </option>
                    ))}
                  </select>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginTop: '0.25rem' }}>
                    If the athlete is unable to compete in Event 1 or 2, they can be substituted into their reserve event during call room.
                  </span>
                </div>

                {/* Relay & Half Marathon Checkboxes */}
                <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  
                  {/* Relay Checkbox */}
                  <label style={{ 
                    display: 'flex', 
                    alignItems: 'flex-start', 
                    gap: '0.75rem', 
                    cursor: relayQuotaFull ? 'not-allowed' : 'pointer',
                    opacity: relayQuotaFull ? 0.6 : 1,
                    background: 'var(--bg-tertiary)',
                    padding: '0.75rem 1rem',
                    borderRadius: 'var(--radius-sm)'
                  }}>
                    <input
                      type="checkbox"
                      checked={isRelay}
                      disabled={relayQuotaFull}
                      onChange={(e) => setIsRelay(e.target.checked)}
                      style={{ marginTop: '0.25rem', transform: 'scale(1.2)' }}
                    />
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>
                        Include in 4x100m Relay Squad (FREE)
                      </div>
                      <div style={{ fontSize: '0.75rem', color: relayQuotaFull ? 'var(--danger)' : 'var(--text-secondary)' }}>
                        {relayQuotaFull 
                          ? 'Quota Full: Maximum 4 relay runners have already been registered for this college & gender.' 
                          : `College quota: ${currentRelayCount}/4 runners registered so far.`}
                      </div>
                    </div>
                  </label>

                  {/* Half Marathon Checkbox */}
                  <label style={{ 
                    display: 'flex', 
                    alignItems: 'flex-start', 
                    gap: '0.75rem', 
                    cursor: 'pointer',
                    background: 'var(--bg-tertiary)',
                    padding: '0.75rem 1rem',
                    borderRadius: 'var(--radius-sm)'
                  }}>
                    <input
                      type="checkbox"
                      checked={isHalfMarathon}
                      onChange={(e) => setIsHalfMarathon(e.target.checked)}
                      style={{ marginTop: '0.25rem', transform: 'scale(1.2)' }}
                    />
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>
                        21 km Half Marathon Participant (FREE)
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                        Open to all university participants with zero event limit restrictions.
                      </div>
                    </div>
                  </label>

                </div>

              </CardContent>
            </Card>

          </div>

          {/* Fee Breakdown & Checkout Sticky Sidebar */}
          <div>
            <div style={{ position: 'sticky', top: '5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              
              <Card style={{ border: '2px solid var(--accent-primary)', boxShadow: '0 4px 20px var(--accent-glow)' }}>
                <CardHeader>
                  <CardTitle style={{ fontSize: '1.125rem', color: 'var(--accent-primary)' }}>
                    Registration Fee Summary
                  </CardTitle>
                </CardHeader>
                <CardContent style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                    <span>Event 1 (Regular):</span>
                    <span style={{ fontWeight: 600 }}>{event1Id ? '₹100' : '₹0'}</span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                    <span>Event 2 (Regular):</span>
                    <span style={{ fontWeight: 600 }}>{event2Id ? '₹100' : '₹0'}</span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                    <span>Reserve Event:</span>
                    <span>{reserveEventId ? 'FREE' : '-'}</span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                    <span>Relay Participant:</span>
                    <span>{isRelay ? 'FREE' : '-'}</span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                    <span>Half Marathon:</span>
                    <span>{isHalfMarathon ? 'FREE' : '-'}</span>
                  </div>

                  <div style={{ borderTop: '2px dashed var(--border-color)', margin: '0.25rem 0' }} />

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '1.125rem', fontWeight: 800 }}>Total Payable:</span>
                    <span style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--accent-primary)' }}>
                      ₹{totalPrice}
                    </span>
                  </div>

                  {errorMsg && (
                    <div style={{ 
                      padding: '0.75rem', 
                      borderRadius: 'var(--radius-sm)', 
                      background: 'rgba(239, 68, 68, 0.1)', 
                      color: 'var(--danger)', 
                      fontSize: '0.8rem',
                      border: '1px solid rgba(239, 68, 68, 0.2)'
                    }}>
                      {errorMsg}
                    </div>
                  )}

                  <Button 
                    type="submit" 
                    variant="primary" 
                    size="lg" 
                    isLoading={isLoading}
                    disabled={!event1Id || totalPrice === 0}
                    style={{ width: '100%', marginTop: '0.5rem', fontWeight: 800 }}
                  >
                    {isLoading ? 'Processing...' : `Proceed to Pay ₹${totalPrice}`}
                  </Button>

                  <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textAlign: 'center', lineHeight: 1.4 }}>
                    Official Razorpay gateway with instant webhook reconciliation. Registration confirms once payment succeeds.
                  </p>

                </CardContent>
              </Card>

            </div>
          </div>

        </div>
      </form>

    </div>
  );
}

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: '0.875rem',
  fontWeight: 600,
  color: 'var(--text-primary)',
  marginBottom: '0.35rem'
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '0.75rem 1rem',
  background: 'var(--bg-secondary)',
  color: 'var(--text-primary)',
  border: '1px solid var(--border-color)',
  borderRadius: 'var(--radius-sm)',
  fontSize: '0.95rem',
  outline: 'none'
};

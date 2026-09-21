'use client';

import React, { useState, useMemo } from 'react';
import QRCode from 'react-qr-code';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';

interface AthleteCardData {
  id: string;
  name: string;
  college: string;
  gender: string;
  bibNumber: string;
  usn: string;
  bloodGroup: string;
  event1?: string;
  event2?: string;
  reserveEvent?: string;
  isRelay: boolean;
  isHalfMarathon: boolean;
}

interface Props {
  athletes: AthleteCardData[];
  colleges: string[];
}

export default function IdCardsClient({ athletes, colleges }: Props) {
  const [selectedCollege, setSelectedCollege] = useState('all');
  const [selectedGender, setSelectedGender] = useState('all');

  const filtered = useMemo(() => {
    return athletes.filter(a => {
      if (selectedCollege !== 'all' && a.college !== selectedCollege) return false;
      if (selectedGender !== 'all' && a.gender !== selectedGender) return false;
      return true;
    });
  }, [athletes, selectedCollege, selectedGender]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div>
      {/* Controls - Hidden during print */}
      <div className="no-print" style={{ marginBottom: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <Link href="/admin" style={{ fontSize: '0.875rem', color: 'var(--accent-primary)', fontWeight: 600 }}>
              &larr; Back to Admin Hub
            </Link>
            <h1 style={{ fontSize: '2rem', fontWeight: 800, marginTop: '0.25rem' }}>
              Printable Athlete ID & Bib Cards
            </h1>
            <p style={{ color: 'var(--text-secondary)' }}>
              Dr. ACS College of Engineering &bull; Official Meet Badges ({filtered.length} cards)
            </p>
          </div>

          <Button variant="primary" size="lg" onClick={handlePrint} style={{ fontWeight: 700, padding: '0.75rem 2rem' }}>
            🖨️ Print Badge Sheets
          </Button>
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', background: 'var(--bg-secondary)', padding: '1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
              Filter by College
            </label>
            <select
              value={selectedCollege}
              onChange={e => setSelectedCollege(e.target.value)}
              style={{ padding: '0.5rem 1rem', borderRadius: 'var(--radius-sm)', background: 'var(--bg-primary)', color: 'var(--text-primary)', border: '1px solid var(--border-color)' }}
            >
              <option value="all">All Participating Colleges</option>
              {colleges.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
              Filter by Gender
            </label>
            <select
              value={selectedGender}
              onChange={e => setSelectedGender(e.target.value)}
              style={{ padding: '0.5rem 1rem', borderRadius: 'var(--radius-sm)', background: 'var(--bg-primary)', color: 'var(--text-primary)', border: '1px solid var(--border-color)' }}
            >
              <option value="all">All Genders</option>
              <option value="men">Boys Only (100+ series)</option>
              <option value="women">Girls Only (2001+ series)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Printable Grid of ID Cards */}
      <div className="id-cards-grid" style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', 
        gap: '1.5rem' 
      }}>
        {filtered.map(athlete => (
          <div 
            key={athlete.id}
            className="athlete-id-card"
            style={{
              background: '#ffffff',
              color: '#0f172a',
              border: '2px solid #cbd5e1',
              borderRadius: '12px',
              padding: '1.25rem',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
              position: 'relative',
              pageBreakInside: 'avoid',
              breakInside: 'avoid'
            }}
          >
            {/* Header */}
            <div style={{ borderBottom: '2px solid #e2e8f0', paddingBottom: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '0.65rem', fontWeight: 800, color: '#2563eb', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Dr. ACS College of Engineering
                </div>
                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#334155' }}>
                  VTU Athletics Meet 2026
                </div>
              </div>
              <span style={{ 
                fontSize: '0.7rem', 
                fontWeight: 800, 
                padding: '0.15rem 0.5rem', 
                borderRadius: '4px',
                background: athlete.gender === 'men' ? '#eff6ff' : '#fdf2f8',
                color: athlete.gender === 'men' ? '#1d4ed8' : '#be185d',
                border: `1px solid ${athlete.gender === 'men' ? '#bfdbfe' : '#fbcfe8'}`
              }}>
                {athlete.gender === 'men' ? 'BOYS' : 'GIRLS'}
              </span>
            </div>

            {/* Body: Bib + QR */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '1rem 0' }}>
              <div>
                <span style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>
                  OFFICIAL BIB NUMBER
                </span>
                <div style={{ fontSize: '2.75rem', fontWeight: 900, color: '#0f172a', lineHeight: 1, letterSpacing: '-1px' }}>
                  #{athlete.bibNumber || 'TBD'}
                </div>
                <div style={{ fontSize: '1rem', fontWeight: 800, color: '#1e293b', marginTop: '0.5rem' }}>
                  {athlete.name}
                </div>
                <div style={{ fontSize: '0.8rem', color: '#475569', fontWeight: 600 }}>
                  {athlete.college}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.2rem' }}>
                  USN: {athlete.usn} &bull; Blood: <b style={{ color: '#dc2626' }}>{athlete.bloodGroup}</b>
                </div>
              </div>

              {/* QR Code (Contains ONLY Athlete ID as requested) */}
              <div style={{ 
                background: '#fff', 
                padding: '0.5rem', 
                borderRadius: '8px', 
                border: '1px solid #e2e8f0',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '0.25rem'
              }}>
                <QRCode value={athlete.id} size={90} level="M" />
                <span style={{ fontSize: '0.6rem', color: '#94a3b8', fontFamily: 'monospace' }}>
                  ID CODE
                </span>
              </div>
            </div>

            {/* Events Footer */}
            <div style={{ borderTop: '1px dashed #cbd5e1', paddingTop: '0.5rem', fontSize: '0.75rem' }}>
              <span style={{ color: '#64748b', fontWeight: 700, textTransform: 'uppercase', fontSize: '0.65rem' }}>
                Disciplines Registered:
              </span>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginTop: '0.25rem' }}>
                {athlete.event1 && (
                  <span style={{ background: '#f1f5f9', padding: '0.15rem 0.4rem', borderRadius: '4px', fontWeight: 600, color: '#1e293b' }}>
                    1. {athlete.event1}
                  </span>
                )}
                {athlete.event2 && (
                  <span style={{ background: '#f1f5f9', padding: '0.15rem 0.4rem', borderRadius: '4px', fontWeight: 600, color: '#1e293b' }}>
                    2. {athlete.event2}
                  </span>
                )}
                {athlete.reserveEvent && (
                  <span style={{ background: '#fffbeb', border: '1px solid #fef3c7', padding: '0.15rem 0.4rem', borderRadius: '4px', fontWeight: 600, color: '#b45309' }}>
                    Reserve: {athlete.reserveEvent}
                  </span>
                )}
                {athlete.isRelay && (
                  <span style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', padding: '0.15rem 0.4rem', borderRadius: '4px', fontWeight: 700, color: '#047857' }}>
                    4x100m Relay
                  </span>
                )}
                {athlete.isHalfMarathon && (
                  <span style={{ background: '#f5f3ff', border: '1px solid #ddd6fe', padding: '0.15rem 0.4rem', borderRadius: '4px', fontWeight: 700, color: '#6d28d9' }}>
                    21km Marathon
                  </span>
                )}
              </div>
            </div>

          </div>
        ))}
      </div>

      {/* Print-specific CSS */}
      <style jsx global>{`
        @media print {
          body {
            background: #ffffff !important;
            color: #000000 !important;
          }
          .no-print, header, nav, footer, .sidebar, .navbar {
            display: none !important;
          }
          .id-cards-grid {
            display: grid !important;
            grid-template-columns: 1fr 1fr !important;
            gap: 1.5cm !important;
            padding: 0 !important;
          }
          .athlete-id-card {
            border: 1px solid #000 !important;
            box-shadow: none !important;
            page-break-inside: avoid !important;
            break-inside: avoid !important;
            margin-bottom: 1cm !important;
          }
        }
      `}</style>

    </div>
  );
}

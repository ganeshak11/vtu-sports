'use client';

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { closeRegistrationAndGenerateBibs, reopenRegistration } from '@/app/actions/bib-generator';
import Link from 'next/link';

interface Props {
  initialStatus: string;
  closedAt: string | null;
  hostCollege: string;
}

export default function RegistrationControlWidget({ initialStatus, closedAt, hostCollege }: Props) {
  const [status, setStatus] = useState(initialStatus);
  const [isLoading, setIsLoading] = useState(false);
  const [resultSummary, setResultSummary] = useState<any | null>(null);

  const isClosed = status === 'CLOSED';

  const handleClose = async () => {
    if (!confirm('Are you sure you want to CLOSE registration? This will sort all confirmed athletes by college alphabetically and generate sequential Bib numbers (Boys 100+, Girls 2001+).')) {
      return;
    }

    setIsLoading(true);
    const res = await closeRegistrationAndGenerateBibs();

    if (res.error) {
      alert(res.error);
    } else if (res.success) {
      setStatus('CLOSED');
      setResultSummary(res);
    }
    setIsLoading(false);
  };

  const handleReopen = async () => {
    if (!confirm('Are you sure you want to RE-OPEN registrations? Principals will be able to add more athletes.')) {
      return;
    }

    setIsLoading(true);
    const res = await reopenRegistration();

    if (res.error) {
      alert(res.error);
    } else if (res.success) {
      setStatus('OPEN');
      setResultSummary(null);
    }
    setIsLoading(false);
  };

  return (
    <Card style={{ border: '2px solid var(--accent-primary)' }}>
      <CardHeader>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--accent-primary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Host: {hostCollege}
            </div>
            <CardTitle style={{ fontSize: '1.25rem', marginTop: '0.25rem' }}>
              Registration & Bib Number Control Center
            </CardTitle>
          </div>
          <Badge variant={isClosed ? 'danger' : 'success'} style={{ fontSize: '0.85rem', padding: '0.25rem 0.75rem' }}>
            {isClosed ? 'REGISTRATION CLOSED' : 'REGISTRATION OPEN'}
          </Badge>
        </div>
      </CardHeader>

      <CardContent style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.5 }}>
          {isClosed 
            ? `Registration was closed on ${closedAt ? new Date(closedAt).toLocaleString() : 'recently'}. Block-allocated Bib numbers and QR tokens have been generated.`
            : 'Registration is currently active for all college principals and PEDs. When the registration window closes, click below to automatically assign sorted block Bib numbers by college.'}
        </p>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          {!isClosed ? (
            <Button
              variant="primary"
              size="lg"
              isLoading={isLoading}
              onClick={handleClose}
              style={{ fontWeight: 800, background: '#dc2626' }}
            >
              🔒 Close Registration & Generate Bib Numbers
            </Button>
          ) : (
            <Button
              variant="secondary"
              isLoading={isLoading}
              onClick={handleReopen}
            >
              🔓 Re-open Registration Window
            </Button>
          )}

          <Link href="/admin/id-cards">
            <Button variant="secondary" size="lg" style={{ fontWeight: 700 }}>
              🖨️ Print Athlete ID Cards
            </Button>
          </Link>

          <Link href="/admin/accreditation">
            <Button variant="secondary" size="lg" style={{ fontWeight: 700 }}>
              🎟️ Meet Day Accreditation Desk
            </Button>
          </Link>
        </div>

        {/* Generated Summary if closed */}
        {resultSummary && (
          <div style={{ background: 'var(--bg-tertiary)', padding: '1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
            <h4 style={{ fontWeight: 700, color: 'var(--success)', marginBottom: '0.5rem' }}>
              ✓ Generated Bib Numbers ({resultSummary.totalBoys} Boys &bull; {resultSummary.totalGirls} Girls)
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '0.5rem', fontSize: '0.8rem' }}>
              {resultSummary.collegeBlocks?.map((b: any, idx: number) => (
                <div key={idx} style={{ background: 'var(--bg-secondary)', padding: '0.5rem 0.75rem', borderRadius: '4px' }}>
                  <b>{b.college}</b> ({b.gender}): <span style={{ color: 'var(--accent-primary)', fontWeight: 800 }}>#{b.startBib} - #{b.endBib}</span> ({b.count} athletes)
                </div>
              ))}
            </div>
          </div>
        )}

      </CardContent>
    </Card>
  );
}

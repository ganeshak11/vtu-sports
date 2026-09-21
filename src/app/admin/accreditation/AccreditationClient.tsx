'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { accreditAthlete } from '@/app/actions/accreditation';
import { Scanner } from '@yudiel/react-qr-scanner';
import Link from 'next/link';

interface Props {
  totalConfirmed: number;
  totalAccredited: number;
}

export default function AccreditationClient({ totalConfirmed, totalAccredited: initialAccredited }: Props) {
  const [accreditedCount, setAccreditedCount] = useState(initialAccredited);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<{
    type: 'success' | 'warning' | 'error';
    msg: string;
    details?: string;
    athlete?: any;
  } | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isCameraActive && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isCameraActive, scanResult]);

  const handleProcessCode = async (code: string) => {
    if (!code?.trim() || isScanning) return;
    setIsScanning(true);

    const res = await accreditAthlete(code.trim());

    if (res.error) {
      setScanResult({
        type: 'error',
        msg: res.error,
        details: res.details
      });
    } else if (res.alreadyAccredited) {
      setScanResult({
        type: 'warning',
        msg: 'Already Accredited',
        details: `Accredited at ${res.athlete.accreditedAt}. Card was previously issued.`,
        athlete: res.athlete
      });
    } else if (res.success) {
      setScanResult({
        type: 'success',
        msg: `Accreditation Complete &bull; Issue Bib #${res.athlete.bibNumber}`,
        athlete: res.athlete
      });
      setAccreditedCount(prev => prev + 1);
    }

    if (inputRef.current) inputRef.current.value = '';

    setTimeout(() => {
      setIsScanning(false);
    }, 2500);
  };

  const handleManualSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const code = formData.get('code') as string;
    handleProcessCode(code);
  };

  const progressPct = totalConfirmed > 0 ? Math.round((accreditedCount / totalConfirmed) * 100) : 0;

  return (
    <div style={{ maxWidth: '750px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Header */}
      <div>
        <Link href="/admin" style={{ fontSize: '0.875rem', color: 'var(--accent-primary)', fontWeight: 600 }}>
          &larr; Back to Admin Hub
        </Link>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, marginTop: '0.5rem' }}>
          Meet Day Accreditation Desk
        </h1>
        <p style={{ color: 'var(--text-secondary)' }}>
          Scan athlete QR code upon arrival to mark them present and issue their official Bib badge.
        </p>
      </div>

      {/* Progress & Live Stat Box */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
        <div style={{ background: 'var(--bg-secondary)', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
          <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Total Confirmed</span>
          <div style={{ fontSize: '2rem', fontWeight: 800 }}>{totalConfirmed}</div>
        </div>
        <div style={{ background: 'var(--bg-secondary)', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
          <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Accredited (Present)</span>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--success)' }}>{accreditedCount}</div>
        </div>
        <div style={{ background: 'var(--bg-secondary)', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
          <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Attendance Rate</span>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--accent-primary)' }}>{progressPct}%</div>
        </div>
      </div>

      {/* Scanner Card */}
      <Card>
        <CardHeader>
          <CardTitle>Scan Athlete QR or Enter Bib Number</CardTitle>
        </CardHeader>
        <CardContent style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {!isCameraActive ? (
            <form onSubmit={handleManualSubmit} style={{ display: 'flex', gap: '0.75rem' }}>
              <input
                ref={inputRef}
                name="code"
                placeholder="Scan QR or type Athlete ID / Bib #..."
                autoComplete="off"
                style={{
                  flex: 1,
                  padding: '1rem',
                  fontSize: '1.125rem',
                  borderRadius: 'var(--radius-sm)',
                  border: '2px solid var(--accent-primary)',
                  background: 'var(--bg-primary)',
                  color: 'var(--text-primary)',
                  outline: 'none'
                }}
              />
              <Button type="submit" variant="primary" style={{ padding: '0 2rem', fontWeight: 700 }}>
                Accredit
              </Button>
            </form>
          ) : (
            <div style={{ width: '100%', borderRadius: 'var(--radius-sm)', overflow: 'hidden', border: '2px solid var(--accent-primary)' }}>
              {isScanning ? (
                <div style={{ padding: '3rem', textAlign: 'center', background: 'var(--bg-tertiary)' }}>
                  Processing Code...
                </div>
              ) : (
                <Scanner
                  onScan={(result) => handleProcessCode(result[0].rawValue)}
                  onError={(error) => setScanResult({ type: 'error', msg: 'Camera Error', details: error instanceof Error ? error.message : String(error) })}
                  styles={{ container: { width: '100%' } }}
                />
              )}
            </div>
          )}

          <Button
            type="button"
            variant="ghost"
            onClick={() => setIsCameraActive(!isCameraActive)}
            style={{ alignSelf: 'center' }}
          >
            {isCameraActive ? 'Switch to Physical USB Scanner' : '📷 Use Device Camera Scanner'}
          </Button>

        </CardContent>
      </Card>

      {/* Result Display Banner */}
      {scanResult && (
        <Card style={{
          border: `2px solid ${scanResult.type === 'success' ? 'var(--success)' : scanResult.type === 'warning' ? 'var(--warning)' : 'var(--danger)'}`,
          background: scanResult.type === 'success' ? 'rgba(16, 185, 129, 0.08)' : scanResult.type === 'warning' ? 'rgba(245, 158, 11, 0.08)' : 'rgba(239, 68, 68, 0.08)'
        }}>
          <CardContent style={{ padding: '2rem', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ fontSize: '3rem' }}>
              {scanResult.type === 'success' ? '🎟️' : scanResult.type === 'warning' ? '⚠️' : '❌'}
            </div>

            <h2 style={{ 
              fontSize: '1.5rem', 
              fontWeight: 800, 
              color: scanResult.type === 'success' ? 'var(--success)' : scanResult.type === 'warning' ? 'var(--warning)' : 'var(--danger)' 
            }}>
              {scanResult.msg}
            </h2>

            {scanResult.details && (
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>{scanResult.details}</p>
            )}

            {scanResult.athlete && (
              <div style={{ 
                marginTop: '1rem', 
                background: 'var(--bg-secondary)', 
                padding: '1.25rem', 
                borderRadius: 'var(--radius-sm)',
                textAlign: 'left',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                border: '1px solid var(--border-color)'
              }}>
                <div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800 }}>{scanResult.athlete.name}</div>
                  <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{scanResult.athlete.college}</div>
                  <div style={{ fontSize: '0.8rem', marginTop: '0.25rem', color: 'var(--text-secondary)' }}>
                    {scanResult.athlete.event1 && <span>&bull; {scanResult.athlete.event1} </span>}
                    {scanResult.athlete.event2 && <span>&bull; {scanResult.athlete.event2} </span>}
                    {scanResult.athlete.isRelay && <span style={{ color: 'var(--success)', fontWeight: 600 }}>&bull; Relay </span>}
                    {scanResult.athlete.isHalfMarathon && <span style={{ color: '#8b5cf6', fontWeight: 600 }}>&bull; Marathon</span>}
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>
                    Assigned Bib
                  </span>
                  <div style={{ fontSize: '2.5rem', fontWeight: 900, color: 'var(--accent-primary)', lineHeight: 1 }}>
                    #{scanResult.athlete.bibNumber}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

    </div>
  );
}

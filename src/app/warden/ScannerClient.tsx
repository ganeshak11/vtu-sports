'use client';
import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { scanWardenCheckIn } from '@/app/actions/warden';
import { Scanner } from '@yudiel/react-qr-scanner';

interface ScannerClientProps {
  accommodationId?: string;
  accommodationName: string;
}

export const WardenScannerClient: React.FC<ScannerClientProps> = ({ accommodationId, accommodationName }) => {
  const [scanResult, setScanResult] = useState<{ 
    type: 'success' | 'warning' | 'error'; 
    msg: string; 
    name?: string; 
    college?: string;
    bib?: string;
    details?: string;
  } | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [recentCheckIns, setRecentCheckIns] = useState<Array<{ name: string; college: string; bib: string; time: string }>>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isCameraActive && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isCameraActive, scanResult]);

  const handleScan = async (identifier: string) => {
    if (!identifier.trim() || isScanning) return;
    
    setIsScanning(true);
    const result = await scanWardenCheckIn(identifier, accommodationId);
    
    if (result.success && result.profile) {
      setScanResult({
        type: 'success',
        msg: 'Accommodation Checked In',
        name: result.profile.name,
        college: result.profile.college,
        bib: result.profile.bibNumber,
        details: `Checked In at ${result.profile.checkedInAt}`
      });
      setRecentCheckIns(prev => [
        { 
          name: result.profile.name, 
          college: result.profile.college, 
          bib: result.profile.bibNumber, 
          time: result.profile.checkedInAt 
        },
        ...prev.slice(0, 9)
      ]);
    } else if (result.alreadyCheckedIn) {
      setScanResult({
        type: 'warning',
        msg: result.error || 'Already Checked In',
        name: result.profile?.name,
        college: result.profile?.college,
        bib: result.profile?.bibNumber,
        details: result.details
      });
    } else {
      setScanResult({
        type: 'error',
        msg: result.error || 'Scan Failed',
        details: result.details || 'Athlete not found or not eligible.'
      });
    }

    if (inputRef.current) inputRef.current.value = '';
    
    setTimeout(() => {
      setScanResult(null);
      setIsScanning(false);
    }, 4000);
  };

  const handleManualSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const id = formData.get('identifier') as string;
    handleScan(id);
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem', maxWidth: '640px', margin: '0 auto' }}>
      
      <div style={{ textAlign: 'center' }}>
        <div style={{ display: 'inline-block', padding: '0.25rem 0.75rem', borderRadius: '999px', background: 'rgba(59, 130, 246, 0.1)', color: 'var(--accent-primary)', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem' }}>
          Dr. ACS College of Engineering &bull; Logistics
        </div>
        <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '0.25rem' }}>Single-Tap Accommodation Check-In</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
          Scan athlete ID badge QR or enter Bib Number to record campus arrival
        </p>
      </div>

      <Card>
        <CardContent style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            padding: '0.875rem 1.25rem', 
            background: 'var(--bg-tertiary)', 
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--border-color)'
          }}>
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Station</span>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>{accommodationName}</h2>
            </div>
            <span style={{ 
              padding: '0.25rem 0.6rem', 
              borderRadius: '4px', 
              fontSize: '0.75rem', 
              fontWeight: 700, 
              background: 'rgba(16, 185, 129, 0.15)', 
              color: 'var(--success)' 
            }}>
              LIVE DESK
            </span>
          </div>

          {!isCameraActive ? (
            <form onSubmit={handleManualSubmit} style={{ display: 'flex', gap: '0.5rem' }}>
              <input
                ref={inputRef}
                name="identifier"
                placeholder="Scan QR or enter Bib / Athlete ID..."
                autoComplete="off"
                disabled={isScanning}
                style={{
                  flex: 1,
                  padding: '1rem 1.25rem',
                  fontSize: '1.1rem',
                  borderRadius: 'var(--radius-sm)',
                  border: '2px solid var(--accent-primary)',
                  background: 'var(--bg-primary)',
                  color: 'var(--text-primary)',
                  outline: 'none'
                }}
              />
              <Button type="submit" variant="primary" disabled={isScanning} style={{ padding: '0 1.5rem' }}>
                {isScanning ? 'Checking...' : 'Check In'}
              </Button>
            </form>
          ) : (
            <div style={{ width: '100%', borderRadius: 'var(--radius-sm)', overflow: 'hidden', border: '2px solid var(--accent-primary)' }}>
              {isScanning ? (
                <div style={{ padding: '3rem', textAlign: 'center', background: 'var(--bg-tertiary)' }}>
                  Processing Check-in...
                </div>
              ) : (
                <Scanner 
                  onScan={(result) => handleScan(result[0].rawValue)} 
                  onError={(error) => setScanResult({ type: 'error', msg: 'Camera Error', details: error instanceof Error ? error.message : String(error) })}
                  styles={{ container: { width: '100%' } }}
                />
              )}
            </div>
          )}

          <Button 
            variant="ghost" 
            onClick={() => setIsCameraActive(!isCameraActive)}
            style={{ margin: '0 auto', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            {isCameraActive ? '⌨️ Switch to Barcode / Keyboard Input' : '📷 Use Device Camera Scanner'}
          </Button>

        </CardContent>
      </Card>

      {/* Result Display */}
      {scanResult && (
        <Card style={{ 
          border: `2px solid ${
            scanResult.type === 'success' 
              ? 'var(--success)' 
              : scanResult.type === 'warning' 
                ? 'var(--warning)' 
                : 'var(--danger)'
          }`,
          background: scanResult.type === 'success' 
            ? 'rgba(16, 185, 129, 0.08)' 
            : scanResult.type === 'warning'
              ? 'rgba(245, 158, 11, 0.08)'
              : 'rgba(239, 68, 68, 0.08)'
        }}>
          <CardContent style={{ padding: '2rem', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <div style={{ fontSize: '3rem', marginBottom: '0.25rem' }}>
              {scanResult.type === 'success' ? '🏠' : scanResult.type === 'warning' ? '⚠️' : '❌'}
            </div>
            <h2 style={{ 
              fontSize: '1.4rem', 
              fontWeight: 800, 
              color: scanResult.type === 'success' 
                ? 'var(--success)' 
                : scanResult.type === 'warning' 
                  ? 'var(--warning)' 
                  : 'var(--danger)' 
            }}>
              {scanResult.msg}
            </h2>
            {scanResult.name && (
              <p style={{ fontSize: '1.25rem', fontWeight: 700, margin: '0.25rem 0' }}>
                {scanResult.name} {scanResult.bib && <span style={{ color: 'var(--accent-primary)' }}>(Bib #{scanResult.bib})</span>}
              </p>
            )}
            {scanResult.college && (
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>{scanResult.college}</p>
            )}
            {scanResult.details && (
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                {scanResult.details}
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Recent Live Check-ins */}
      {recentCheckIns.length > 0 && (
        <Card>
          <CardContent style={{ padding: '1.25rem' }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
              Recent Check-Ins (This Session)
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {recentCheckIns.map((item, idx) => (
                <div key={idx} style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center', 
                  padding: '0.5rem 0.75rem', 
                  background: 'var(--bg-tertiary)', 
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.9rem'
                }}>
                  <div>
                    <span style={{ fontWeight: 600 }}>{item.name}</span>
                    <span style={{ color: 'var(--accent-primary)', marginLeft: '0.5rem' }}>#{item.bib}</span>
                    <span style={{ color: 'var(--text-secondary)', marginLeft: '0.5rem', fontSize: '0.8rem' }}>({item.college})</span>
                  </div>
                  <span style={{ color: 'var(--success)', fontSize: '0.8rem', fontWeight: 600 }}>{item.time}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

    </div>
  );
};

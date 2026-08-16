'use client';
import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { checkInAthlete } from '@/app/actions/callroom';
import { Scanner } from '@yudiel/react-qr-scanner';

interface ScannerClientProps {
  eventId: string;
  eventName: string;
  rounds: { id: string; round_type: string; scheduled_time: string | null }[];
}

export const ScannerClient: React.FC<ScannerClientProps> = ({ eventId, eventName, rounds }) => {
  const [scanResult, setScanResult] = useState<{ type: 'success'|'error', msg: string, name?: string, college?: string } | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [selectedRoundId, setSelectedRoundId] = useState<string>(rounds[0]?.id || '');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isCameraActive && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isCameraActive, scanResult]);

  const handleScan = async (chestNumber: string) => {
    if (!chestNumber.trim() || isScanning) return;
    if (!selectedRoundId) {
      alert("Please select an active round first.");
      return;
    }
    
    setIsScanning(true);
    const result = await checkInAthlete(chestNumber, selectedRoundId);
    
    if (result.success) {
      setScanResult({
        type: 'success',
        msg: `Checked In: ${eventName}`,
        name: result.profile.full_name,
        college: result.profile.college_name
      });
    } else {
      setScanResult({
        type: 'error',
        msg: result.error || 'Unknown error',
        name: chestNumber,
        college: result.details || undefined
      });
    }

    if (inputRef.current) inputRef.current.value = '';
    
    setTimeout(() => {
      setScanResult(null);
      setIsScanning(false);
    }, 3500);
  };

  const handleManualSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const chestId = formData.get('chestId') as string;
    handleScan(chestId);
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem', maxWidth: '600px', margin: '0 auto' }}>
      
      <div style={{ textAlign: 'center' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '0.5rem' }}>Call Room Check-in</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Scan QR or type Chest Number to log athlete attendance</p>
      </div>

      <Card>
        <CardContent style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          <div style={{ textAlign: 'center', padding: '1rem', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-sm)' }}>
            <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Event</span>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--accent-primary)', marginBottom: '0.75rem' }}>{eventName}</h2>
            
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.875rem', fontWeight: 600 }}>Active Round:</label>
              <select 
                value={selectedRoundId} 
                onChange={(e) => setSelectedRoundId(e.target.value)}
                style={{ 
                  padding: '0.5rem', 
                  background: 'var(--bg-secondary)', 
                  color: 'var(--text-primary)', 
                  border: '1px solid var(--border-color)', 
                  borderRadius: 'var(--radius-sm)',
                  width: '100%',
                  maxWidth: '300px'
                }}
              >
                <option value="" disabled>Select Round</option>
                {rounds.map(r => (
                  <option key={r.id} value={r.id}>
                    {r.round_type.toUpperCase()} - {r.scheduled_time ? new Date(r.scheduled_time).toLocaleString(undefined, { weekday: 'short', hour: '2-digit', minute: '2-digit' }) : 'Unscheduled'}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ borderTop: '1px solid var(--border-color)', margin: '0.5rem 0' }} />

          {!isCameraActive ? (
            <form onSubmit={handleManualSubmit} style={{ display: 'flex', gap: '0.5rem' }}>
              <input
                ref={inputRef}
                name="chestId"
                placeholder="Scan or type Chest Number..."
                autoComplete="off"
                style={{
                  flex: 1,
                  padding: '1rem',
                  fontSize: '1.25rem',
                  borderRadius: 'var(--radius-sm)',
                  border: '2px solid var(--accent-primary)',
                  background: 'var(--bg-primary)',
                  color: 'var(--text-primary)',
                  outline: 'none'
                }}
              />
              <Button type="submit" variant="primary">Verify</Button>
            </form>
          ) : (
            <div style={{ width: '100%', borderRadius: 'var(--radius-sm)', overflow: 'hidden', border: '2px solid var(--accent-primary)' }}>
              {isScanning ? (
                <div style={{ padding: '3rem', textAlign: 'center', background: 'var(--bg-tertiary)' }}>
                  Processing Scan...
                </div>
              ) : (
                <Scanner 
                  onScan={(result) => handleScan(result[0].rawValue)} 
                  onError={(error) => setScanResult({ type: 'error', msg: 'Camera Error', name: error instanceof Error ? error.message : String(error) })}
                  styles={{ container: { width: '100%' } }}
                />
              )}
            </div>
          )}

          <Button 
            variant="ghost" 
            onClick={() => setIsCameraActive(!isCameraActive)}
            style={{ margin: '0 auto', display: 'block' }}
          >
            {isCameraActive ? 'Switch to Physical Scanner' : '📷 Use Mobile Camera Scanner'}
          </Button>

        </CardContent>
      </Card>

      {/* Result Display */}
      {scanResult && (
        <Card style={{ 
          border: `2px solid ${scanResult.type === 'success' ? 'var(--success)' : 'var(--danger)'}`,
          background: scanResult.type === 'success' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)'
        }}>
          <CardContent style={{ padding: '2rem', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>
              {scanResult.type === 'success' ? '✅' : '❌'}
            </div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: scanResult.type === 'success' ? 'var(--success)' : 'var(--danger)' }}>
              {scanResult.msg}
            </h2>
            {scanResult.name && <p style={{ fontSize: '1.25rem', fontWeight: 600 }}>{scanResult.name}</p>}
            {scanResult.college && <p style={{ color: 'var(--text-secondary)' }}>{scanResult.college}</p>}
          </CardContent>
        </Card>
      )}

    </div>
  );
}

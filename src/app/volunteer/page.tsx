'use client';
import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { redeemFoodPass } from '@/app/actions/food';
import { Scanner } from '@yudiel/react-qr-scanner';

export default function FoodScannerPage() {
  const [mealType, setMealType] = useState('day1_breakfast');
  const [scanResult, setScanResult] = useState<{ type: 'success'|'error', msg: string, name?: string, college?: string } | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isScanning, setIsScanning] = useState(false); // Used to pause processing
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-focus input for physical scanners
  useEffect(() => {
    if (!isCameraActive && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isCameraActive, scanResult]);

  const handleScan = async (chestNumber: string) => {
    if (!chestNumber.trim() || isScanning) return;
    
    setIsScanning(true);
    const result = await redeemFoodPass(chestNumber, mealType);
    
    if (result.success) {
      setScanResult({
        type: 'success',
        msg: `Meal Authorized: ${mealType.replace('_', ' ').toUpperCase()}`,
        name: result.profile.full_name,
        college: result.profile.college_name
      });
    } else {
      setScanResult({
        type: 'error',
        msg: result.error || 'Unknown error',
        name: result.profile?.full_name || chestNumber,
        college: result.details || undefined
      });
    }

    // Clear physical input if used
    if (inputRef.current) inputRef.current.value = '';
    
    // Auto clear result and resume scanning after 3.5s
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
        <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '0.5rem' }}>Food Operations</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Verify athlete meals via QR scan or Chest Number</p>
      </div>

      <Card>
        <CardContent style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Active Meal Type</label>
            <select 
              value={mealType}
              onChange={(e) => setMealType(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem',
                borderRadius: 'var(--radius-sm)',
                background: 'var(--bg-tertiary)',
                color: 'var(--text-primary)',
                border: '1px solid var(--border-color)',
                outline: 'none',
                fontSize: '1rem'
              }}
            >
              <option value="day1_breakfast">Day 1: Breakfast</option>
              <option value="day1_lunch">Day 1: Lunch</option>
              <option value="day1_dinner">Day 1: Dinner</option>
              <option value="day2_breakfast">Day 2: Breakfast</option>
              <option value="day2_lunch">Day 2: Lunch</option>
            </select>
          </div>

          <div style={{ borderTop: '1px solid var(--border-color)', margin: '0.5rem 0' }} />

          {/* Scanner Area */}
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

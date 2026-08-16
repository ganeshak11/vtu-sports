'use client';
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { updateArrivalStatus } from '@/app/actions/athlete';

interface Props {
  initialStatus: 'not_started' | 'on_transit' | 'arrived';
  profileId: string;
  roomNumber?: string;
  accommodationName?: string;
}

export default function AccommodationClient({ initialStatus, profileId, roomNumber, accommodationName }: Props) {
  const [status, setStatus] = useState(initialStatus);
  const [isLoading, setIsLoading] = useState(false);

  const handleUpdateStatus = async (newStatus: 'not_started' | 'on_transit' | 'arrived') => {
    setIsLoading(true);
    
    const result = await updateArrivalStatus(profileId, newStatus);
    
    if (result.success) {
      setStatus(newStatus);
    } else {
      alert(result.error);
    }
    
    setIsLoading(false);
  };

  const getProgress = () => {
    if (status === 'not_started') return 5;
    if (status === 'on_transit') return 50;
    if (status === 'arrived') return 100;
    return 0;
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.25rem' }}>Stay Details</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Manage your accommodation & arrival</p>
      </div>

      {/* Status Tracker */}
      <Card className="hover-lift">
        <CardContent style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>Arrival Status</span>
              <Badge variant={status === 'arrived' ? 'success' : status === 'on_transit' ? 'warning' : 'default'}>
                {status.replace('_', ' ').toUpperCase()}
              </Badge>
            </div>
            <ProgressBar progress={getProgress()} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <Button 
              variant={status === 'not_started' ? 'primary' : 'secondary'} 
              size="sm"
              disabled={status !== 'not_started'}
              isLoading={isLoading && status === 'not_started'}
              onClick={() => handleUpdateStatus('on_transit')}
            >
              Start Journey
            </Button>
            <Button 
              variant={status === 'on_transit' ? 'primary' : 'secondary'} 
              size="sm"
              disabled={status !== 'on_transit'}
              isLoading={isLoading && status === 'on_transit'}
              onClick={() => handleUpdateStatus('arrived')}
            >
              I've Arrived
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Room Info */}
      <Card>
        <CardHeader>
          <CardTitle style={{ fontSize: '1.125rem' }}>Assigned Room</CardTitle>
        </CardHeader>
        <CardContent style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ background: 'var(--bg-tertiary)', padding: '1rem', borderRadius: 'var(--radius-sm)' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--accent-primary)', marginBottom: '0.5rem' }}>
              Room {roomNumber || 'TBD'}
            </h3>
            <p style={{ fontWeight: 500, marginBottom: '0.25rem' }}>{accommodationName || 'Pending Assignment'}</p>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Shared Occupancy</p>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Contact Person:</span>
              <span style={{ fontWeight: 500 }}>Warden Ramesh (+91 9876543210)</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Check-in via QR:</span>
              <span style={{ fontWeight: 500, color: 'var(--success)' }}>Active</span>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Maps Placeholder */}
      <Card>
        <CardContent style={{ padding: '0' }}>
          <div style={{ 
            height: '200px', 
            background: 'var(--bg-tertiary)', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            flexDirection: 'column',
            gap: '0.5rem'
          }}>
            <span style={{ fontSize: '2rem' }}>🗺️</span>
            <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Google Maps Location</span>
          </div>
        </CardContent>
      </Card>

    </div>
  );
}

import React from 'react';
import { getSession } from '@/lib/session';
import { supabase } from '@/lib/supabase';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import QRCode from 'react-qr-code';

export default async function DigitalIdPage() {
  const session = await getSession();

  let profile = null;

  if (session?.profileId) {
    const { data: profileData } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', session.profileId)
      .single();
    
    if (profileData) {
      profile = profileData;
    }
  }

  if (!profile) {
    return <div>Profile not found. Please log in again.</div>;
  }

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', alignItems: 'center' }}>
      
      <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.25rem' }}>Digital ID Card</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Use this QR for all access</p>
      </div>

      <Card style={{ 
        width: '100%', 
        maxWidth: '350px', 
        background: 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.01) 100%)',
        border: '1px solid var(--accent-primary)',
        boxShadow: '0 0 20px var(--accent-glow)'
      }}>
        <CardContent style={{ padding: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem' }}>
          
          {/* Avatar Placeholder */}
          <div style={{ 
            width: '100px', 
            height: '100px', 
            borderRadius: '50%', 
            background: 'var(--bg-tertiary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '2px solid var(--accent-secondary)'
          }}>
            <span style={{ fontSize: '2.5rem' }}>👤</span>
          </div>

          <div style={{ textAlign: 'center' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>{profile.full_name}</h2>
            <p style={{ color: 'var(--accent-secondary)', fontWeight: 500 }}>{profile.college_name}</p>
          </div>

          <div style={{ width: '100%', borderTop: '1px solid var(--border-color)' }} />

          {/* QR Code Container */}
          <div style={{ background: '#fff', padding: '1rem', borderRadius: 'var(--radius-sm)' }}>
            <QRCode 
              value={profile.chest_number} 
              size={180} 
              level="H" 
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>CHEST NUMBER</span>
            <span style={{ fontSize: '1.5rem', fontWeight: 800, letterSpacing: '2px', color: 'var(--text-primary)' }}>
              {profile.chest_number}
            </span>
          </div>

          <Badge variant="success" className="mt-2">Active Athlete</Badge>
          
        </CardContent>
      </Card>
      
      <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textAlign: 'center', maxWidth: '300px' }}>
        Please show this QR code at food counters, call rooms, and check-in desks.
      </p>

    </div>
  );
}

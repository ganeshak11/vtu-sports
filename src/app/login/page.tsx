'use client';

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { loginWithId } from '../actions/auth';

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'participant' | 'official'>('participant');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    
    const formData = new FormData(e.currentTarget);
    const result = await loginWithId(formData);
    
    if (result && result.error) {
      setError(result.error);
      setIsLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: 'var(--bg-primary)' }}>
      <Card className="animate-slide-up" style={{ width: '100%', maxWidth: '450px', border: '1px solid var(--accent-primary)', boxShadow: '0 0 30px var(--accent-glow)' }}>
        <CardHeader style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1.5rem', marginBottom: '1rem' }}>
            <img src="/vtu.png" alt="VTU Logo" style={{ height: '60px', width: 'auto', objectFit: 'contain' }} />
            <img src="/mit.png" alt="MIT Logo" style={{ height: '60px', width: 'auto', objectFit: 'contain' }} />
          </div>
          <CardTitle style={{ fontSize: '1rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
            Sign in to access your portal
          </CardTitle>
        </CardHeader>
        
        <CardContent>
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', background: 'var(--bg-tertiary)', padding: '0.25rem', borderRadius: 'var(--radius-sm)' }}>
            <button 
              onClick={() => { setActiveTab('participant'); setError(null); }}
              style={{ 
                flex: 1, padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: 'none', 
                background: activeTab === 'participant' ? 'var(--bg-primary)' : 'transparent',
                color: activeTab === 'participant' ? 'var(--text-primary)' : 'var(--text-secondary)',
                fontWeight: activeTab === 'participant' ? 700 : 500,
                cursor: 'pointer', transition: 'all 0.2s', boxShadow: activeTab === 'participant' ? '0 1px 3px rgba(0,0,0,0.2)' : 'none'
              }}>
              Participant
            </button>
            <button 
              onClick={() => { setActiveTab('official'); setError(null); }}
              style={{ 
                flex: 1, padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: 'none', 
                background: activeTab === 'official' ? 'var(--bg-primary)' : 'transparent',
                color: activeTab === 'official' ? 'var(--text-primary)' : 'var(--text-secondary)',
                fontWeight: activeTab === 'official' ? 700 : 500,
                cursor: 'pointer', transition: 'all 0.2s', boxShadow: activeTab === 'official' ? '0 1px 3px rgba(0,0,0,0.2)' : 'none'
              }}>
              Official
            </button>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label htmlFor="userId" style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-primary)' }}>
                {activeTab === 'participant' ? 'Chest Number' : 'Official PIN'}
              </label>
              <input
                id="userId"
                name="userId"
                type="text"
                placeholder={activeTab === 'participant' ? "e.g. M1042" : "e.g. OFFICIAL-100M"}
                required
                style={{
                  padding: '0.75rem 1rem',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-color)',
                  background: 'var(--bg-secondary)',
                  color: 'var(--text-primary)',
                  fontFamily: 'inherit',
                  outline: 'none',
                  transition: 'border-color 0.2s',
                  fontSize: '1rem'
                }}
              />
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                {activeTab === 'participant' 
                  ? 'Athletes: Use your assigned Chest Number (e.g. M1042).'
                  : 'Referees & Wardens: Use your Event/Hostel PIN.'}
              </p>
            </div>

            {error && (
              <div style={{ color: 'var(--danger)', fontSize: '0.875rem', padding: '0.75rem', background: 'rgba(239, 68, 68, 0.1)', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                {error}
              </div>
            )}

            <Button type="submit" variant="primary" size="lg" isLoading={isLoading} style={{ width: '100%', marginTop: '0.5rem' }}>
              Sign In
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

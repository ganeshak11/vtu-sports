'use client';

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { loginWithId } from '../actions/auth';

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'participant' | 'official'>('participant');
  const [inputValue, setInputValue] = useState('');

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

  const handleChipClick = (code: string) => {
    setInputValue(code);
    setError(null);
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: 'var(--bg-primary)', padding: '1rem' }}>
      <Card className="animate-slide-up" style={{ width: '100%', maxWidth: '480px', border: '1px solid var(--accent-primary)', boxShadow: '0 0 30px var(--accent-glow)' }}>
        <CardHeader style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1.5rem', marginBottom: '1rem' }}>
            <img src="/vtu.png" alt="VTU Logo" style={{ height: '54px', width: 'auto', objectFit: 'contain' }} />
            <img src="/mit.png" alt="ACSCE Logo" style={{ height: '54px', width: 'auto', objectFit: 'contain' }} />
          </div>
          <CardTitle style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', textAlign: 'center' }}>
            Dr. ACS College of Engineering &bull; VTU Meet 2026
          </CardTitle>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '0.25rem 0 0' }}>
            Official Delegation & Operations Portal
          </p>
        </CardHeader>
        
        <CardContent>
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', background: 'var(--bg-tertiary)', padding: '0.25rem', borderRadius: 'var(--radius-sm)' }}>
            <button 
              type="button"
              onClick={() => { setActiveTab('participant'); setError(null); }}
              style={{ 
                flex: 1, padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: 'none', 
                background: activeTab === 'participant' ? 'var(--bg-primary)' : 'transparent',
                color: activeTab === 'participant' ? 'var(--text-primary)' : 'var(--text-secondary)',
                fontWeight: activeTab === 'participant' ? 700 : 500,
                cursor: 'pointer', transition: 'all 0.2s', boxShadow: activeTab === 'participant' ? '0 1px 3px rgba(0,0,0,0.2)' : 'none'
              }}>
              Athlete Login
            </button>
            <button 
              type="button"
              onClick={() => { setActiveTab('official'); setError(null); }}
              style={{ 
                flex: 1, padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: 'none', 
                background: activeTab === 'official' ? 'var(--bg-primary)' : 'transparent',
                color: activeTab === 'official' ? 'var(--text-primary)' : 'var(--text-secondary)',
                fontWeight: activeTab === 'official' ? 700 : 500,
                cursor: 'pointer', transition: 'all 0.2s', boxShadow: activeTab === 'official' ? '0 1px 3px rgba(0,0,0,0.2)' : 'none'
              }}>
              Institutional / Staff
            </button>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label htmlFor="userId" style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                {activeTab === 'participant' ? 'Bib Number or Chest Number' : 'College Delegation Code or Staff PIN'}
              </label>
              <input
                id="userId"
                name="userId"
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder={activeTab === 'participant' ? "e.g. 100, 101, 2001" : "e.g. 2345, WARDEN, MITM-M, 1234"}
                required
                style={{
                  padding: '0.75rem 1rem',
                  borderRadius: 'var(--radius-sm)',
                  border: '1.5px solid var(--accent-primary)',
                  background: 'var(--bg-secondary)',
                  color: 'var(--text-primary)',
                  fontFamily: 'inherit',
                  outline: 'none',
                  transition: 'border-color 0.2s',
                  fontSize: '1rem',
                  fontWeight: 600
                }}
              />

              {/* Quick Preset Credentials Chips */}
              <div style={{ marginTop: '0.25rem' }}>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: 600, display: 'block', marginBottom: '0.35rem' }}>
                  {activeTab === 'participant' ? 'Test Athletes:' : 'Quick Sign-In Credentials (Click to fill):'}
                </span>
                
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                  {activeTab === 'participant' ? (
                    <>
                      <button type="button" onClick={() => handleChipClick('100')} style={chipStyle}>#100 (Boys)</button>
                      <button type="button" onClick={() => handleChipClick('101')} style={chipStyle}>#101 (Boys)</button>
                      <button type="button" onClick={() => handleChipClick('2001')} style={chipStyle}>#2001 (Girls)</button>
                    </>
                  ) : (
                    <>
                      <button type="button" onClick={() => handleChipClick('2345')} style={{ ...chipStyle, color: '#34d399', borderColor: '#059669' }}>
                        🏨 Warden (2345)
                      </button>
                      <button type="button" onClick={() => handleChipClick('1234')} style={{ ...chipStyle, color: '#60a5fa', borderColor: '#2563eb' }}>
                        ⏱️ Referee (1234)
                      </button>
                      <button type="button" onClick={() => handleChipClick('3456')} style={{ ...chipStyle, color: '#fbbf24', borderColor: '#d97706' }}>
                        🍽️ Canteen (3456)
                      </button>
                      <button type="button" onClick={() => handleChipClick('MITM-M')} style={chipStyle}>
                        MITM Boys (MITM-M)
                      </button>
                      <button type="button" onClick={() => handleChipClick('MITM-G')} style={chipStyle}>
                        MITM Girls (MITM-G)
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>

            {error && (
              <div style={{ color: 'var(--danger)', fontSize: '0.85rem', padding: '0.75rem', background: 'rgba(239, 68, 68, 0.1)', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                {error}
              </div>
            )}

            <Button type="submit" variant="primary" size="lg" isLoading={isLoading} style={{ width: '100%', marginTop: '0.25rem' }}>
              Sign In to Portal
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

const chipStyle: React.CSSProperties = {
  padding: '0.25rem 0.5rem',
  borderRadius: '4px',
  background: 'var(--bg-tertiary)',
  border: '1px solid var(--border-color)',
  color: 'var(--text-secondary)',
  fontSize: '0.75rem',
  fontWeight: 600,
  cursor: 'pointer'
};

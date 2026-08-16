'use client';

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { adminLogin } from '@/app/actions/auth';

export default function AdminLogin() {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    
    const formData = new FormData(e.currentTarget);
    const result = await adminLogin(formData);
    
    if (result && result.error) {
      setError(result.error);
      setIsLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: 'var(--bg-primary)' }}>
      <Card className="animate-slide-up" style={{ width: '100%', maxWidth: '400px', border: '1px solid var(--accent-primary)', boxShadow: '0 0 30px var(--accent-glow)' }}>
        <CardHeader style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1.5rem', marginBottom: '1rem' }}>
            <img src="/vtu.png" alt="VTU Logo" style={{ height: '50px', width: 'auto', objectFit: 'contain' }} />
            <img src="/mit.png" alt="MIT Logo" style={{ height: '50px', width: 'auto', objectFit: 'contain' }} />
          </div>
          <CardTitle style={{ fontSize: '1rem', color: 'var(--text-secondary)', fontWeight: 500, textAlign: 'center' }}>
            Secure login for Meet Admins
          </CardTitle>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label htmlFor="adminId" style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-primary)' }}>
                Admin ID
              </label>
              <input
                id="adminId"
                name="adminId"
                type="text"
                placeholder="e.g. A001"
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
            </div>

            {error && (
              <div style={{ color: 'var(--danger)', fontSize: '0.875rem', padding: '0.75rem', background: 'rgba(239, 68, 68, 0.1)', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                {error}
              </div>
            )}

            <Button type="submit" variant="primary" size="lg" isLoading={isLoading} style={{ width: '100%', marginTop: '0.5rem' }}>
              Authenticate
            </Button>
            
            <a href="/login" style={{ textAlign: 'center', fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '0.5rem', textDecoration: 'none' }}>
              ← Back to public login
            </a>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

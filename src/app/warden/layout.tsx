import React from 'react';
import { getSession } from '@/lib/session';
import { redirect } from 'next/navigation';
import { logout } from '@/app/actions/auth';
import { Button } from '@/components/ui/Button';

export default async function WardenLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  if (!session.id || session.role !== 'warden') {
    redirect('/login');
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: 'var(--bg-primary)' }}>
      {/* Warden Header */}
      <header style={{ 
        padding: '1rem 1.5rem', 
        background: 'rgba(255, 255, 255, 0.03)', 
        borderBottom: '1px solid var(--border-color)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        backdropFilter: 'blur(10px)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '1.5rem' }}>🛏️</span>
          <div>
            <h1 style={{ fontSize: '1rem', fontWeight: 700, lineHeight: 1 }}>Hostel Warden</h1>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Location: {session.accommodationName}</span>
          </div>
        </div>
        <form action={logout}>
          <Button type="submit" variant="ghost" className="text-sm">Log Out</Button>
        </form>
      </header>

      {/* Main Content */}
      <main style={{ flex: 1, padding: '2rem 1.5rem' }}>
        {children}
      </main>
    </div>
  );
}

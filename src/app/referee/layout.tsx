import React from 'react';
import { getSession } from '@/lib/session';
import { redirect } from 'next/navigation';
import { logout } from '@/app/actions/auth';
import { Button } from '@/components/ui/Button';

export default async function RefereeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  if (!session.id || session.role !== 'official') {
    redirect('/login');
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: 'var(--bg-primary)' }}>
      {/* Referee Header */}
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
          <span style={{ fontSize: '1.5rem' }}>⏱️</span>
          <div>
            <h1 style={{ fontSize: '1rem', fontWeight: 700, lineHeight: 1 }}>Call Room Official</h1>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Event: {session.eventName}</span>
          </div>
        </div>
        <form action={logout}>
          <Button type="submit" variant="ghost" className="text-sm">Log Out</Button>
        </form>
      </header>

      <nav style={{ padding: '0.5rem 1.5rem', background: 'rgba(255, 255, 255, 0.02)', borderBottom: '1px solid var(--border-color)', display: 'flex', gap: '1rem' }}>
        <a href="/referee" style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', fontWeight: 500, textDecoration: 'none' }}>Call Room Scanner</a>
        <a href="/referee/results" style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', fontWeight: 500, textDecoration: 'none' }}>Results Engine</a>
      </nav>

      {/* Main Content */}
      <main style={{ flex: 1, padding: '2rem 1.5rem' }}>
        {children}
      </main>
    </div>
  );
}

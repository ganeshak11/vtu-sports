import React from 'react';
import Link from 'next/link';
import './athlete.css';
import { getSession } from '@/lib/session';
import { redirect } from 'next/navigation';
import { logout } from '@/app/actions/auth';

export default async function AthleteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  
  if (!session.id || (session.role !== 'athlete' && session.role !== 'admin')) {
    redirect('/login');
  }

  return (
    <div className="athlete-layout" style={{ maxWidth: '640px', margin: '0 auto', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Participant App Header */}
      <header className="athlete-header glass-panel" style={{ 
        padding: '0.85rem 1.25rem', 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        borderBottom: '1px solid var(--border-color)',
        position: 'sticky',
        top: 0,
        zIndex: 50,
        background: 'rgba(15, 23, 42, 0.85)',
        backdropFilter: 'blur(12px)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <img src="/vtu.png" alt="VTU Logo" style={{ height: '32px', width: 'auto', objectFit: 'contain' }} />
          <div>
            <span style={{ fontSize: '0.9rem', fontWeight: 800, display: 'block', lineHeight: 1.1 }}>VTU SportsOS</span>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Host: Dr. ACSCE</span>
          </div>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <form action={logout}>
            <button 
              type="submit" 
              style={{ 
                background: 'transparent', 
                border: '1px solid var(--border-color)', 
                color: 'var(--text-secondary)', 
                padding: '0.3rem 0.6rem', 
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.75rem',
                cursor: 'pointer'
              }}
            >
              Sign Out
            </button>
          </form>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="athlete-main" style={{ flex: 1, padding: '1.25rem 1rem 6rem' }}>
        {children}
      </main>

      {/* Exactly 4 Screens Bottom Navigation Bar */}
      <nav className="athlete-bottom-nav glass-panel" style={{
        position: 'fixed',
        bottom: 0,
        left: '50%',
        transform: 'translateX(-50%)',
        width: '100%',
        maxWidth: '640px',
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        padding: '0.5rem 0',
        background: 'rgba(15, 23, 42, 0.95)',
        borderTop: '1px solid var(--border-color)',
        backdropFilter: 'blur(16px)',
        zIndex: 100
      }}>
        <Link href="/athlete" className="nav-item hover-lift" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.2rem', textDecoration: 'none', color: 'var(--text-primary)', fontSize: '0.75rem' }}>
          <span style={{ fontSize: '1.25rem' }}>🏠</span>
          <span style={{ fontWeight: 600 }}>Dashboard</span>
        </Link>
        <Link href="/athlete/events" className="nav-item hover-lift" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.2rem', textDecoration: 'none', color: 'var(--text-primary)', fontSize: '0.75rem' }}>
          <span style={{ fontSize: '1.25rem' }}>🏃</span>
          <span style={{ fontWeight: 600 }}>My Events</span>
        </Link>
        <Link href="/athlete/schedule" className="nav-item hover-lift" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.2rem', textDecoration: 'none', color: 'var(--text-primary)', fontSize: '0.75rem' }}>
          <span style={{ fontSize: '1.25rem' }}>📅</span>
          <span style={{ fontWeight: 600 }}>Schedule</span>
        </Link>
        <Link href="/athlete/notifications" className="nav-item hover-lift" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.2rem', textDecoration: 'none', color: 'var(--text-primary)', fontSize: '0.75rem' }}>
          <span style={{ fontSize: '1.25rem' }}>🔔</span>
          <span style={{ fontWeight: 600 }}>Notices</span>
        </Link>
      </nav>
    </div>
  );
}

import React from 'react';
import Link from 'next/link';
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

  if (!session.id || (session.role !== 'warden' && session.role !== 'admin')) {
    redirect('/login');
  }

  return (
    <div className="portal-layout">
      <header className="desk-header">
        {/* Top Strip */}
        <div className="desk-top-strip">
          <span>Dr. ACS College of Engineering &bull; Campus Hostel Administration</span>
          <div className="desk-top-links">
            <Link href="/">🏠 Public Home</Link>
            <Link href="/live">🔴 Live Feed</Link>
            <Link href="/leaderboard">🏆 Standings</Link>
          </div>
        </div>

        {/* Main Bar */}
        <div className="desk-main-bar">
          <div className="desk-brand-group">
            <div className="desk-logos">
              <img 
                src="/vtu.png" 
                alt="VTU" 
                className="desk-logo-vtu" 
                style={{ height: '34px', width: 'auto', objectFit: 'contain' }} 
              />
              <div className="desk-logo-divider" />
              <img 
                src="/acsce-logo.png" 
                alt="ACSCE" 
                className="desk-logo-acsce" 
                style={{ height: '28px', width: 'auto', objectFit: 'contain' }} 
              />
            </div>

            <div className="desk-title-group">
              <div className="desk-title-row">
                <h1 className="desk-title">
                  Campus Hostel Warden Desk
                </h1>
                <span className="desk-badge desk-badge-warden">
                  Hostel Operations
                </span>
              </div>
              <span className="desk-station-text">
                Location: {session.accommodationName || 'Dr. ACSCE Campus Hostels'}
              </span>
            </div>
          </div>

          <form action={logout}>
            <Button 
              type="submit" 
              variant="ghost" 
              size="sm" 
              style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--danger)', padding: '0.4rem 0.8rem' }}
            >
              Sign Out ⎋
            </Button>
          </form>
        </div>
      </header>

      <main className="portal-main-content">
        {children}
      </main>
    </div>
  );
}


'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { logout } from '@/app/actions/auth';
import { Button } from '@/components/ui/Button';

interface Props {
  eventName?: string;
}

export const RefereeHeader: React.FC<Props> = ({ eventName }) => {
  const pathname = usePathname();

  return (
    <header className="desk-header">
      {/* Top Strip */}
      <div className="desk-top-strip">
        <span>Dr. ACS College of Engineering &bull; Official Meet Timing & Marshalling System</span>
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
                Referee & Timing Desk
              </h1>
              <span className="desk-badge desk-badge-official">
                Official
              </span>
            </div>
            {eventName && (
              <span className="desk-station-text">Station: {eventName}</span>
            )}
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

      {/* Operational Tabs */}
      <nav className="desk-nav-tabs">
        <Link 
          href="/referee" 
          className={`desk-nav-tab ${pathname === '/referee' ? 'active' : ''}`}
        >
          <span>📋</span>
          <span>Call Room Scanner</span>
        </Link>
        <Link 
          href="/referee/results" 
          className={`desk-nav-tab ${pathname === '/referee/results' ? 'active' : ''}`}
        >
          <span>⏱️</span>
          <span>Official Results Engine</span>
        </Link>
      </nav>
    </header>
  );
};


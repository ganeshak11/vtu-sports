import React from 'react';
import Link from 'next/link';
import './athlete.css';
import { getSession } from '@/lib/session';
import { redirect } from 'next/navigation';

export default async function AthleteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  
  if (!session.id || session.role !== 'athlete') {
    redirect('/login');
  }

  return (
    <div className="athlete-layout">
      <header className="athlete-header glass-panel">
        <div className="athlete-brand" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <img src="/vtu.png" alt="VTU Logo" style={{ height: '30px', width: 'auto', objectFit: 'contain' }} />
          <img src="/mit.png" alt="MIT Logo" style={{ height: '30px', width: 'auto', objectFit: 'contain' }} />
        </div>
        <div className="athlete-profile-badge">
          {session.id}
        </div>
      </header>

      <main className="athlete-main">
        {children}
      </main>

      <nav className="athlete-bottom-nav glass-panel">
        <Link href="/athlete" className="nav-item hover-lift">
          <span className="nav-icon">🏠</span>
          <span>Home</span>
        </Link>
        <Link href="/athlete/id" className="nav-item hover-lift">
          <span className="nav-icon">🪪</span>
          <span>ID Card</span>
        </Link>
        <Link href="/athlete/accommodation" className="nav-item hover-lift">
          <span className="nav-icon">🏨</span>
          <span>Stay</span>
        </Link>
        <Link href="/athlete/events" className="nav-item hover-lift">
          <span className="nav-icon">⏱️</span>
          <span>Events</span>
        </Link>
      </nav>
    </div>
  );
}

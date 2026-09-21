import React from 'react';
import { getSession } from '@/lib/session';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { logout } from '@/app/actions/auth';
import { Button } from '@/components/ui/Button';

export default async function PrincipalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  if (!session.id || session.role !== 'principal') {
    redirect('/login');
  }

  const isMen = session.targetGender === 'men';

  return (
    <div className="min-h-screen bg-[var(--bg-primary)]" style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
      {/* Principal Top Navigation */}
      <header style={{ 
        padding: '1rem 2rem', 
        background: 'var(--bg-secondary)', 
        borderBottom: '1px solid var(--border-color)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        position: 'sticky',
        top: 0,
        zIndex: 50,
        boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <img src="/vtu.png" alt="VTU" style={{ height: '36px', width: 'auto', objectFit: 'contain' }} />
            <div style={{ borderLeft: '1px solid var(--border-color)', paddingLeft: '0.75rem' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--accent-primary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Hosted by Dr. ACS College of Engineering
              </div>
              <div style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                {session.collegeName}
              </div>
            </div>
          </div>

          <span style={{ 
            fontSize: '0.75rem', 
            padding: '0.25rem 0.75rem', 
            borderRadius: '1rem', 
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            background: isMen ? 'rgba(37, 99, 235, 0.1)' : 'rgba(236, 72, 153, 0.1)',
            color: isMen ? '#2563eb' : '#db2777',
            border: `1px solid ${isMen ? 'rgba(37, 99, 235, 0.2)' : 'rgba(236, 72, 153, 0.2)'}`
          }}>
            {isMen ? "Boys' Contingent (M)" : "Girls' Contingent (G)"}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Link href="/principal" style={{ 
            fontSize: '0.875rem', 
            fontWeight: 600, 
            color: 'var(--text-secondary)',
            padding: '0.5rem 1rem',
            borderRadius: 'var(--radius-sm)'
          }}>
            Dashboard
          </Link>
          <Link href="/principal/register" style={{ 
            fontSize: '0.875rem', 
            fontWeight: 600, 
            color: '#fff',
            background: 'var(--accent-primary)',
            padding: '0.5rem 1.25rem',
            borderRadius: 'var(--radius-sm)'
          }}>
            + Register Student
          </Link>
          <form action={logout}>
            <button type="submit" style={{ 
              fontSize: '0.875rem', 
              color: 'var(--danger)', 
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              fontWeight: 600,
              padding: '0.5rem'
            }}>
              Sign Out
            </button>
          </form>
        </div>
      </header>

      {/* Main Content Area */}
      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 1.5rem' }}>
        {children}
      </main>
    </div>
  );
}

import React from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export default function Home() {
  return (
    <div className="min-h-screen bg-primary">
      <header style={{ 
        padding: '1rem 1.5rem', 
        background: 'rgba(255, 255, 255, 0.03)', 
        borderBottom: '1px solid var(--border-color)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        backdropFilter: 'blur(10px)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <img src="/vtu.png" alt="VTU Logo" style={{ height: '32px', width: 'auto' }} />
          <h1 style={{ fontSize: '1.25rem', fontWeight: 700 }}>VTU Athletics Meet 2026</h1>
        </div>
        <nav style={{ display: 'flex', gap: '1rem' }}>
          <Link href="/leaderboard" style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', fontWeight: 500 }}>Live Leaderboard</Link>
          <Link href="/login" style={{ color: 'var(--accent-primary)', fontSize: '0.875rem', fontWeight: 600 }}>Portal Login</Link>
        </nav>
      </header>

      <main style={{ padding: '4rem 1.5rem', maxWidth: '1200px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '4rem' }}>
        
        <div style={{ textAlign: 'center', maxWidth: '800px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '4rem', fontWeight: 800, marginBottom: '1rem', lineHeight: 1.1, background: 'linear-gradient(to right, var(--text-primary), var(--text-secondary))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            The Ultimate Stage for Champions
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.25rem', marginBottom: '2rem' }}>
            Welcome to the official portal for the 24th VTU Inter-Collegiate Athletics Meet. 
            Track live results, manage accommodations, and follow your college to victory.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <Link href="/leaderboard">
              <Button variant="primary" style={{ fontSize: '1.125rem', padding: '1rem 2rem' }}>View Live Standings</Button>
            </Link>
            <Link href="/login">
              <Button variant="ghost" style={{ fontSize: '1.125rem', padding: '1rem 2rem' }}>Athlete / Official Login</Button>
            </Link>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
          <Card className="hover-lift">
            <CardContent style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ fontSize: '2rem' }}>🏃</div>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 700 }}>For Athletes</h3>
              <p style={{ color: 'var(--text-secondary)' }}>View your personalized schedule, check room assignments, and access your digital food pass.</p>
            </CardContent>
          </Card>
          
          <Card className="hover-lift">
            <CardContent style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ fontSize: '2rem' }}>⏱️</div>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 700 }}>For Officials</h3>
              <p style={{ color: 'var(--text-secondary)' }}>Access the Call Room scanner and directly input live results from the track or field.</p>
            </CardContent>
          </Card>

          <Card className="hover-lift">
            <CardContent style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ fontSize: '2rem' }}>🏆</div>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Live Results</h3>
              <p style={{ color: 'var(--text-secondary)' }}>Follow the action in real-time as the leaderboard automatically updates with the latest scores.</p>
            </CardContent>
          </Card>
        </div>

      </main>
    </div>
  );
}

import React from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

// We disable caching to ensure the leaderboard is always live
export const revalidate = 0;

export default async function LeaderboardPage() {
  const { data: leaderboard, error } = await supabase
    .from('college_leaderboard')
    .select('*')
    // Sort by points descending, then gold, then silver, then bronze
    .order('total_points', { ascending: false })
    .order('gold_medals', { ascending: false })
    .order('silver_medals', { ascending: false })
    .order('bronze_medals', { ascending: false });

  if (error) {
    console.error('Error fetching leaderboard:', error);
  }

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
          <Link href="/" style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', fontWeight: 500 }}>Home</Link>
          <Link href="/login" style={{ color: 'var(--accent-primary)', fontSize: '0.875rem', fontWeight: 600 }}>Login</Link>
        </nav>
      </header>

      <main style={{ padding: '3rem 1.5rem', maxWidth: '1000px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h2 style={{ fontSize: '3rem', fontWeight: 800, marginBottom: '0.5rem', background: 'linear-gradient(to right, var(--accent-primary), var(--accent-secondary))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Live Leaderboard
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.125rem' }}>Overall Championship Standings</p>
        </div>

        <Card>
          <CardContent style={{ padding: 0 }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)', background: 'rgba(255,255,255,0.02)' }}>
                    <th style={{ padding: '1.5rem 1rem', fontWeight: 600, width: '80px', textAlign: 'center' }}>Rank</th>
                    <th style={{ padding: '1.5rem 1rem', fontWeight: 600 }}>College</th>
                    <th style={{ padding: '1.5rem 1rem', fontWeight: 600, textAlign: 'center', color: '#FCD34D' }}>🥇 Gold</th>
                    <th style={{ padding: '1.5rem 1rem', fontWeight: 600, textAlign: 'center', color: '#E5E7EB' }}>🥈 Silver</th>
                    <th style={{ padding: '1.5rem 1rem', fontWeight: 600, textAlign: 'center', color: '#D97706' }}>🥉 Bronze</th>
                    <th style={{ padding: '1.5rem 1rem', fontWeight: 800, textAlign: 'right', color: 'var(--accent-primary)' }}>Points</th>
                  </tr>
                </thead>
                <tbody>
                  {leaderboard?.map((row, idx) => (
                    <tr key={row.college_name} style={{ 
                      borderBottom: '1px solid rgba(255,255,255,0.05)',
                      background: idx === 0 ? 'rgba(252, 211, 77, 0.05)' : (idx === 1 ? 'rgba(229, 231, 235, 0.05)' : (idx === 2 ? 'rgba(217, 119, 6, 0.05)' : 'transparent')),
                      transition: 'background 0.2s'
                    }} className="hover:bg-[rgba(255,255,255,0.02)]">
                      <td style={{ padding: '1.5rem 1rem', fontWeight: 800, textAlign: 'center', fontSize: '1.25rem', color: idx < 3 ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
                        {idx + 1}
                      </td>
                      <td style={{ padding: '1.5rem 1rem', fontWeight: 700, fontSize: '1.125rem' }}>{row.college_name}</td>
                      <td style={{ padding: '1.5rem 1rem', textAlign: 'center', fontWeight: 600, color: row.gold_medals > 0 ? '#FCD34D' : 'var(--text-muted)' }}>{row.gold_medals}</td>
                      <td style={{ padding: '1.5rem 1rem', textAlign: 'center', fontWeight: 600, color: row.silver_medals > 0 ? '#E5E7EB' : 'var(--text-muted)' }}>{row.silver_medals}</td>
                      <td style={{ padding: '1.5rem 1rem', textAlign: 'center', fontWeight: 600, color: row.bronze_medals > 0 ? '#D97706' : 'var(--text-muted)' }}>{row.bronze_medals}</td>
                      <td style={{ padding: '1.5rem 1rem', textAlign: 'right', fontWeight: 800, fontSize: '1.25rem', color: 'var(--accent-primary)' }}>{row.total_points}</td>
                    </tr>
                  ))}
                  {(!leaderboard || leaderboard.length === 0) && (
                    <tr>
                      <td colSpan={6} style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                        No results have been finalized yet. The leaderboard will update automatically once finals are completed.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

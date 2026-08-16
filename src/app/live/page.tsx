import React from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { supabase } from '@/lib/supabase';
import { LiveResultsClient } from './LiveResultsClient';

export default async function LivePage() {
  return (
    <div className="min-h-screen bg-[var(--bg-primary)]">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 style={{ fontSize: '2.5rem', fontWeight: 800, letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <span className="relative flex h-4 w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500"></span>
              </span>
              Live Results
            </h1>
            <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem', fontSize: '1.125rem' }}>
              Real-time updates straight from the track and field.
            </p>
          </div>
        </div>

        <LiveResultsClient />
      </main>
    </div>
  );
}

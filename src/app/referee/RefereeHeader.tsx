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
    <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
      {/* Top Strip */}
      <div className="bg-slate-900 text-slate-300 text-xs px-6 py-1.5 flex justify-between items-center">
        <span>Dr. ACS College of Engineering &bull; Official Meet Timing & Marshalling System</span>
        <div className="flex items-center gap-4">
          <Link href="/" className="hover:text-white transition-colors">🏠 Public Home</Link>
          <Link href="/live" className="hover:text-white transition-colors">🔴 Live Feed</Link>
          <Link href="/leaderboard" className="hover:text-white transition-colors">🏆 Standings</Link>
        </div>
      </div>

      {/* Main Bar */}
      <div className="px-6 py-3 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <img src="/vtu.png" alt="VTU" className="h-8 w-auto object-contain" />
            <div className="h-6 w-px bg-slate-200"></div>
            <img src="/acsce-logo.png" alt="ACSCE" className="h-8 w-auto object-contain" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-extrabold text-slate-900 leading-none">
                Referee & Timing Desk
              </h1>
              <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-purple-100 text-purple-800 border border-purple-200">
                Official
              </span>
            </div>
            {eventName && (
              <span className="text-xs text-slate-500 font-medium">Station: {eventName}</span>
            )}
          </div>
        </div>

        <form action={logout}>
          <Button type="submit" variant="ghost" size="sm" className="text-xs font-bold text-red-600 hover:bg-red-50">
            Sign Out ⎋
          </Button>
        </form>
      </div>

      {/* Operational Tabs */}
      <nav className="px-6 flex gap-2 border-t border-slate-100 bg-slate-50">
        <Link 
          href="/referee" 
          className={`px-4 py-2.5 text-sm font-bold border-b-2 transition-all flex items-center gap-2 ${
            pathname === '/referee' 
              ? 'border-blue-600 text-blue-600 bg-white shadow-sm' 
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <span>📋</span>
          <span>Call Room Scanner</span>
        </Link>
        <Link 
          href="/referee/results" 
          className={`px-4 py-2.5 text-sm font-bold border-b-2 transition-all flex items-center gap-2 ${
            pathname === '/referee/results' 
              ? 'border-purple-600 text-purple-600 bg-white shadow-sm' 
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <span>⏱️</span>
          <span>Official Results Engine</span>
        </Link>
      </nav>
    </header>
  );
};

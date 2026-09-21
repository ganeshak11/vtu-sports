import React from 'react';
import Link from 'next/link';
import { getSession } from '@/lib/session';
import { redirect } from 'next/navigation';
import { logout } from '@/app/actions/auth';
import { Button } from '@/components/ui/Button';

export default async function VolunteerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  if (!session.id || (session.role !== 'food_volunteer' && session.role !== 'admin')) {
    redirect('/login');
  }

  return (
    <div className="flex flex-col min-h-screen bg-[var(--bg-primary)]">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
        {/* Top Strip */}
        <div className="bg-slate-900 text-slate-300 text-xs px-6 py-1.5 flex justify-between items-center">
          <span>Dr. ACS College of Engineering &bull; Central Dining & Canteen Operations</span>
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
                  Meal Pass Scanner Desk
                </h1>
                <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-teal-100 text-teal-800 border border-teal-200">
                  Canteen Volunteer
                </span>
              </div>
              <span className="text-xs text-slate-500 font-medium">
                Counter: {session.counterName || 'Central Canteen Counter'}
              </span>
            </div>
          </div>

          <form action={logout}>
            <Button type="submit" variant="ghost" size="sm" className="text-xs font-bold text-red-600 hover:bg-red-50">
              Sign Out ⎋
            </Button>
          </form>
        </div>
      </header>

      <main className="flex-1 p-4 sm:p-8 max-w-5xl mx-auto w-full">
        {children}
      </main>
    </div>
  );
}

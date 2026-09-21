import React from 'react';
import { getSession } from '@/lib/session';
import { redirect } from 'next/navigation';
import { RefereeHeader } from './RefereeHeader';

export default async function RefereeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  if (!session.id || (session.role !== 'official' && session.role !== 'admin')) {
    redirect('/login');
  }

  return (
    <div className="flex flex-col min-h-screen bg-[var(--bg-primary)]">
      <RefereeHeader eventName={session.eventName} />
      <main className="flex-1 p-4 sm:p-8 max-w-6xl mx-auto w-full">
        {children}
      </main>
    </div>
  );
}

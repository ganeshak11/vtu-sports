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
    <div className="portal-layout">
      <RefereeHeader eventName={session.eventName} />
      <main className="portal-main-content">
        {children}
      </main>
    </div>
  );
}


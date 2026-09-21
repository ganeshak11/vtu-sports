import React from 'react';
import { getSession } from '@/lib/session';
import { redirect } from 'next/navigation';
import { WardenScannerClient } from './ScannerClient';

export default async function WardenPage() {
  const session = await getSession();

  if (!session.id || (session.role !== 'warden' && session.role !== 'admin')) {
    redirect('/login');
  }

  return <WardenScannerClient accommodationId={session.accommodationId || 'campus-hostel'} accommodationName={session.accommodationName || 'ACSCE Campus Hostel'} />;
}

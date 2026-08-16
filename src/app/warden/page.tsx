import React from 'react';
import { getSession } from '@/lib/session';
import { redirect } from 'next/navigation';
import { WardenScannerClient } from './ScannerClient';

export default async function WardenPage() {
  const session = await getSession();

  if (!session.id || !session.accommodationId) {
    redirect('/login');
  }

  return <WardenScannerClient accommodationId={session.accommodationId} accommodationName={session.accommodationName || 'Unknown Hostel'} />;
}

import React from 'react';
import { getSession } from '@/lib/session';
import { redirect } from 'next/navigation';
import { getRegistrationEvents, getRelayQuotaCount } from '@/app/actions/registration';
import RegisterClient from './RegisterClient';

export default async function RegisterPage() {
  const session = await getSession();

  if (!session.id || session.role !== 'principal') {
    redirect('/login');
  }

  const gender = session.targetGender || 'men';
  const collegeName = session.collegeName || 'Your College';
  const collegeId = session.collegeId || '';

  const [events, relayCount] = await Promise.all([
    getRegistrationEvents(gender),
    getRelayQuotaCount(collegeId, gender)
  ]);

  return (
    <RegisterClient
      events={events}
      collegeName={collegeName}
      gender={gender}
      currentRelayCount={relayCount}
    />
  );
}

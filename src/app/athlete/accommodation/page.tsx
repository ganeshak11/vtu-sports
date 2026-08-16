import React from 'react';
import { getSession } from '@/lib/session';
import { supabase } from '@/lib/supabase';
import AccommodationClient from './AccommodationClient';

export default async function AccommodationPage() {
  const session = await getSession();

  let profile = null;
  let accommodation = null;

  if (session?.profileId) {
    const { data: profileData } = await supabase
      .from('profiles')
      .select('*, accommodations(*)')
      .eq('id', session.profileId)
      .single();
    
    if (profileData) {
      profile = profileData;
      accommodation = profileData.accommodations;
    }
  }

  return (
    <AccommodationClient 
      initialStatus={profile?.arrival_status || 'not_started'} 
      profileId={profile?.id}
      roomNumber={profile?.room_number}
      accommodationName={accommodation?.name}
    />
  );
}

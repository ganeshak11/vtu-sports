import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function testLogin(id) {
  console.log(`Testing login for: ${id}`);
  
  const { data: eventData, error: eventError } = await supabase
    .from('events')
    .select('id, name')
    .eq('official_pin', id)
    .maybeSingle();

  if (eventError) {
    console.log('Event Error:', eventError);
  } else if (eventData) {
    console.log('Found Event Official:', eventData);
    return;
  }

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('id, role, chest_number')
    .eq('chest_number', id)
    .maybeSingle();

  if (error) {
    console.log('Profile Error:', error);
  } else if (profile) {
    console.log('Found Profile:', profile);
  } else {
    console.log('Not found anywhere.');
  }
}

testLogin('M1042').then(() => testLogin('OFFICIAL-100M'));

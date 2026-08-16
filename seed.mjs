import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const headers = {
  'apikey': key,
  'Authorization': `Bearer ${key}`,
  'Content-Type': 'application/json',
  'Prefer': 'return=representation'
};

async function seed() {
  console.log('Seeding Event...');
  let eventRes = await fetch(`${url}/rest/v1/events?official_pin=eq.OFFICIAL-100M`, { headers });
  let events = await eventRes.json();
  
  if (events.length === 0) {
    const res = await fetch(`${url}/rest/v1/events`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        name: '100m Sprint (Men)', 
        start_date: new Date().toISOString(), 
        end_date: new Date().toISOString(), 
        status: 'upcoming', 
        official_pin: 'OFFICIAL-100M', 
        call_room_time: new Date(Date.now() + 30 * 60000).toISOString(),
        event_time: new Date(Date.now() + 60 * 60000).toISOString()
      })
    });
    
    const text = await res.text();
    console.log('POST events response:', text);
    try {
      events = JSON.parse(text);
    } catch(e) {
      events = [];
    }
  }
  const eventId = events[0].id;
  console.log('Event seeded:', eventId);

  console.log('Seeding Profile...');
  let profileRes = await fetch(`${url}/rest/v1/profiles?chest_number=eq.M1042`, { headers });
  let profiles = await profileRes.json();

  if (profiles.length === 0) {
    const res = await fetch(`${url}/rest/v1/profiles`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        full_name: 'Rahul Sharma',
        role: 'athlete',
        college_name: 'MIT Mysore',
        chest_number: 'M1042'
      })
    });
    profiles = await res.json();
  }
  const profileId = profiles[0].id;
  console.log('Profile seeded:', profileId);

  console.log('Linking Athlete to Event...');
  let regRes = await fetch(`${url}/rest/v1/event_registrations?athlete_id=eq.${profileId}&event_id=eq.${eventId}`, { headers });
  let regs = await regRes.json();

  if (regs.length === 0) {
    await fetch(`${url}/rest/v1/event_registrations`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        athlete_id: profileId,
        event_id: eventId
      })
    });
    console.log('Athlete linked to Event successfully!');
  } else {
    console.log('Athlete already linked to event.');
  }
}

seed();

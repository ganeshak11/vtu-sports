import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

async function check() {
  console.log('Fetching profiles...');
  const res = await fetch(`${url}/rest/v1/profiles?select=chest_number,role`, {
    headers: { 'apikey': key, 'Authorization': `Bearer ${key}` }
  });
  console.log(await res.json());

  console.log('\nFetching events...');
  const res2 = await fetch(`${url}/rest/v1/events?select=name,official_pin`, {
    headers: { 'apikey': key, 'Authorization': `Bearer ${key}` }
  });
  console.log(await res2.json());
}

check();

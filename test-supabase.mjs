import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function test() {
  console.log('Testing connection to:', supabaseUrl);
  const { data, error } = await supabase
    .from('profiles')
    .select('id, role, chest_number')
    .eq('chest_number', 'M1042')
    .single();
    
  console.log('Result:', { data, error });
}

test();

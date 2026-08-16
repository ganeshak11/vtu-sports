import { supabase } from '@/lib/supabase';

/**
 * Generates chest numbers based on gender.
 * M1001, M1002 for Men
 * W1001, W1002 for Women
 */
export async function generateChestNumbers(count: number, gender: 'men' | 'women'): Promise<string[]> {
  const prefix = gender.toLowerCase() === 'women' ? 'W' : 'M';
  
  // Find highest current chest number for this prefix
  const { data, error } = await supabase
    .from('profiles')
    .select('chest_number')
    .like('chest_number', `${prefix}%`)
    .order('chest_number', { ascending: false })
    .limit(1)
    .maybeSingle();

  let nextNumber = 1001;

  if (!error && data?.chest_number) {
    const numPart = parseInt(data.chest_number.substring(1), 10);
    if (!isNaN(numPart)) {
      nextNumber = numPart + 1;
    }
  }

  const generated: string[] = [];
  for (let i = 0; i < count; i++) {
    generated.push(`${prefix}${nextNumber + i}`);
  }

  return generated;
}

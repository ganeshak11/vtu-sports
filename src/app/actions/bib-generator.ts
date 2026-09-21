'use server';

import { supabase } from '@/lib/supabase';
import { requireRole, AuthError } from '@/lib/auth-guard';
import { revalidatePath } from 'next/cache';

export async function closeRegistrationAndGenerateBibs() {
  try {
    await requireRole('admin');
  } catch (e) {
    if (e instanceof AuthError) return { error: e.message };
    throw e;
  }

  // 1. Fetch all confirmed athletes
  const { data: athletes, error: fetchErr } = await supabase
    .from('profiles')
    .select('id, sslc_name, full_name, college_name, gender, payment_status')
    .eq('role', 'athlete')
    .eq('payment_status', 'CONFIRMED');

  if (fetchErr || !athletes || athletes.length === 0) {
    return { error: 'No confirmed athletes found to generate bib numbers for.' };
  }

  // 2. Separate by gender
  const boys = athletes.filter(a => a.gender === 'men');
  const girls = athletes.filter(a => a.gender === 'women');

  // Helper to group by college and sort colleges alphabetically
  const groupByCollege = (list: typeof athletes) => {
    const map: Record<string, typeof athletes> = {};
    for (const ath of list) {
      const col = ath.college_name || 'Individual';
      if (!map[col]) map[col] = [];
      map[col].push(ath);
    }

    // Sort college names alphabetically
    const sortedColleges = Object.keys(map).sort();
    
    // Sort athletes within each college by name
    for (const col of sortedColleges) {
      map[col].sort((a, b) => (a.sslc_name || a.full_name || '').localeCompare(b.sslc_name || b.full_name || ''));
    }

    return { map, sortedColleges };
  };

  const boysGrouped = groupByCollege(boys);
  const girlsGrouped = groupByCollege(girls);

  const updates: { id: string; bib_number: string; chest_number: string }[] = [];
  const collegeBlocks: { college: string; gender: string; startBib: string; endBib: string; count: number }[] = [];

  // 3. Allocate Boys Bib Numbers: Starting at 100
  let boyBibCounter = 100;
  for (const college of boysGrouped.sortedColleges) {
    const colAthletes = boysGrouped.map[college];
    if (colAthletes.length === 0) continue;

    const startBib = boyBibCounter.toString();

    for (const athlete of colAthletes) {
      const bibStr = boyBibCounter.toString();
      updates.push({
        id: athlete.id,
        bib_number: bibStr,
        chest_number: bibStr
      });
      boyBibCounter++;
    }

    const endBib = (boyBibCounter - 1).toString();
    collegeBlocks.push({
      college,
      gender: 'Boys',
      startBib,
      endBib,
      count: colAthletes.length
    });
  }

  // 4. Allocate Girls Bib Numbers: Starting at 2001
  let girlBibCounter = 2001;
  for (const college of girlsGrouped.sortedColleges) {
    const colAthletes = girlsGrouped.map[college];
    if (colAthletes.length === 0) continue;

    const startBib = girlBibCounter.toString();

    for (const athlete of colAthletes) {
      const bibStr = girlBibCounter.toString();
      updates.push({
        id: athlete.id,
        bib_number: bibStr,
        chest_number: bibStr
      });
      girlBibCounter++;
    }

    const endBib = (girlBibCounter - 1).toString();
    collegeBlocks.push({
      college,
      gender: 'Girls',
      startBib,
      endBib,
      count: colAthletes.length
    });
  }

  // 5. Batch update profiles in chunks of 200
  const chunkSize = 200;
  for (let i = 0; i < updates.length; i += chunkSize) {
    const chunk = updates.slice(i, i + chunkSize);
    // Use upsert or individual updates
    for (const item of chunk) {
      await supabase
        .from('profiles')
        .update({
          bib_number: item.bib_number,
          chest_number: item.chest_number
        })
        .eq('id', item.id);
    }
  }

  // 6. Update meet_settings to CLOSED
  await supabase
    .from('meet_settings')
    .update({
      registration_status: 'CLOSED',
      registration_closed_at: new Date().toISOString()
    })
    .neq('id', '00000000-0000-0000-0000-000000000000');

  revalidatePath('/admin');
  revalidatePath('/admin/athletes');
  revalidatePath('/admin/id-cards');
  revalidatePath('/principal');

  return {
    success: true,
    totalBoys: boys.length,
    totalGirls: girls.length,
    collegeBlocks
  };
}

export async function reopenRegistration() {
  try {
    await requireRole('admin');
  } catch (e) {
    if (e instanceof AuthError) return { error: e.message };
    throw e;
  }

  await supabase
    .from('meet_settings')
    .update({
      registration_status: 'OPEN',
      registration_closed_at: null
    })
    .neq('id', '00000000-0000-0000-0000-000000000000');

  revalidatePath('/admin');
  revalidatePath('/principal');

  return { success: true };
}

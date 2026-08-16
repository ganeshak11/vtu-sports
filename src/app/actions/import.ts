'use server';

import { supabase } from '@/lib/supabase';
import { revalidatePath } from 'next/cache';
import { requireRole, AuthError } from '@/lib/auth-guard';
import Papa from 'papaparse';
import { generateChestNumbers } from '@/lib/id-generator';

interface CsvRow {
  Name: string;
  College: string;
  Gender: string;
}

export async function importAthletesCSV(formData: FormData) {
  try {
    await requireRole('admin');
  } catch (e) {
    if (e instanceof AuthError) return { error: e.message };
    throw e;
  }

  const file = formData.get('file') as File;
  if (!file) {
    return { error: 'No file uploaded.' };
  }

  const csvText = await file.text();
  
  type ImportResponse = { error?: string; success?: boolean; count?: number };

  return new Promise<ImportResponse>((resolve) => {
    Papa.parse<CsvRow>(csvText, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        const rows = results.data;
        if (!rows || rows.length === 0) {
          resolve({ error: 'The CSV file is empty or invalid.' });
          return;
        }

        // Validate basic structure
        if (!('Name' in rows[0]) || !('College' in rows[0]) || !('Gender' in rows[0])) {
          resolve({ error: 'CSV must contain exactly these headers: Name, College, Gender.' });
          return;
        }

        const men = rows.filter(r => r.Gender?.toLowerCase().trim() === 'male' || r.Gender?.toLowerCase().trim() === 'm' || r.Gender?.toLowerCase().trim() === 'men');
        const women = rows.filter(r => r.Gender?.toLowerCase().trim() === 'female' || r.Gender?.toLowerCase().trim() === 'f' || r.Gender?.toLowerCase().trim() === 'women');
        const other = rows.filter(r => !men.includes(r) && !women.includes(r));
        
        if (other.length > 0) {
           console.warn(`Skipping ${other.length} rows with unknown gender formats.`);
        }

        const menIds = await generateChestNumbers(men.length, 'men');
        const womenIds = await generateChestNumbers(women.length, 'women');

        const profilesToInsert = [];

        for (let i = 0; i < men.length; i++) {
          profilesToInsert.push({
            full_name: men[i].Name.trim(),
            college_name: men[i].College.trim(),
            gender: 'men',
            chest_number: menIds[i],
            role: 'athlete'
          });
        }

        for (let i = 0; i < women.length; i++) {
          profilesToInsert.push({
            full_name: women[i].Name.trim(),
            college_name: women[i].College.trim(),
            gender: 'women',
            chest_number: womenIds[i],
            role: 'athlete'
          });
        }

        if (profilesToInsert.length === 0) {
           resolve({ error: 'No valid rows found to insert.'});
           return;
        }

        // Batch insert in chunks of 500 to avoid Supabase limits
        const chunkSize = 500;
        let insertedCount = 0;
        let errors = [];

        for (let i = 0; i < profilesToInsert.length; i += chunkSize) {
          const chunk = profilesToInsert.slice(i, i + chunkSize);
          const { error: insertError } = await supabase.from('profiles').insert(chunk);
          if (insertError) {
             console.error("Insert chunk error", insertError);
             errors.push(insertError.message);
          } else {
             insertedCount += chunk.length;
          }
        }
        
        revalidatePath('/admin/athletes');
        revalidatePath('/admin');
        
        if (errors.length > 0) {
           resolve({ error: `Import finished with errors. Inserted ${insertedCount}. Errors: ${errors.join(' | ')}` });
        } else {
           resolve({ success: true, count: insertedCount });
        }
      },
      error: (error: any) => {
        resolve({ error: `Failed to parse CSV: ${error.message}` });
      }
    });
  });
}

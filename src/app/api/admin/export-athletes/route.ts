import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import * as XLSX from 'xlsx';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const college = searchParams.get('college');
    const gender = searchParams.get('gender');

    // 1. Fetch all events to create an ID -> Name dictionary
    const { data: events } = await supabase
      .from('events')
      .select('id, name, category');
    
    const eventMap = new Map<string, string>();
    events?.forEach(e => eventMap.set(e.id, e.name));

    // 2. Build athletes query with all fields
    let query = supabase
      .from('profiles')
      .select(`
        id,
        bib_number,
        chest_number,
        sslc_name,
        full_name,
        usn,
        college_name,
        gender,
        semester,
        sem_start_date,
        college_joining_date,
        blood_group,
        event1_id,
        event2_id,
        reserve_event_id,
        is_relay,
        is_half_marathon,
        accreditation_status,
        accredited_at,
        payment_status,
        amount_paid,
        payment_id,
        room_number,
        accommodation_checked_in,
        arrival_status,
        created_at
      `)
      .eq('role', 'athlete')
      .order('college_name', { ascending: true })
      .order('gender', { ascending: true })
      .order('bib_number', { ascending: true });

    if (college && college !== 'all') {
      query = query.eq('college_name', college);
    }
    if (gender && gender !== 'all') {
      query = query.eq('gender', gender);
    }

    const { data: athletes, error } = await query;

    if (error || !athletes) {
      return NextResponse.json({ error: 'Failed to fetch athlete data' }, { status: 500 });
    }

    // 3. Transform into clean, structured tabular rows for Excel
    const rows = athletes.map((a, idx) => ({
      'Sl. No.': idx + 1,
      'Bib Number': a.bib_number || 'Unassigned',
      'Chest Number': a.chest_number || '-',
      'Athlete Name (as per SSLC)': a.sslc_name || a.full_name || 'N/A',
      'USN': a.usn || 'N/A',
      'College / Institution': a.college_name || 'N/A',
      'Gender': a.gender ? a.gender.toUpperCase() : 'N/A',
      'Semester': a.semester ? `Semester ${a.semester}` : 'N/A',
      'Semester Start Date': a.sem_start_date || 'N/A',
      'College Joining / Start Date': a.college_joining_date || 'N/A',
      'Blood Group': a.blood_group || 'N/A',
      'Event 1 (Regular)': (a.event1_id && eventMap.get(a.event1_id)) || 'N/A',
      'Event 2 (Regular)': (a.event2_id && eventMap.get(a.event2_id)) || 'None',
      'Reserve Event': (a.reserve_event_id && eventMap.get(a.reserve_event_id)) || 'None',
      '4x100m Relay Squad': a.is_relay ? 'YES' : 'NO',
      '21km Half Marathon': a.is_half_marathon ? 'YES' : 'NO',
      'Accreditation Status': a.accreditation_status || 'REGISTERED',
      'Accredited At': a.accredited_at ? new Date(a.accredited_at).toLocaleString('en-IN') : '-',
      'Fee Payment Status': a.payment_status || 'PENDING',
      'Fee Amount Paid': a.amount_paid ? `₹${a.amount_paid}` : '₹0',
      'Razorpay Payment ID': a.payment_id || '-',
      'Hostel Room #': a.room_number || 'Not Assigned',
      'Hostel Checked-in': a.accommodation_checked_in ? 'YES' : 'NO',
      'Campus Arrival Status': a.arrival_status ? a.arrival_status.replace('_', ' ') : 'Pending',
      'Registration Date': a.created_at ? new Date(a.created_at).toLocaleString('en-IN') : '-'
    }));

    // 4. Create workbook and worksheet
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(rows);

    // 5. Define generous column widths for perfect spreadsheet presentation
    ws['!cols'] = [
      { wch: 8 },  // Sl. No.
      { wch: 12 }, // Bib Number
      { wch: 14 }, // Chest Number
      { wch: 28 }, // Athlete Name
      { wch: 16 }, // USN
      { wch: 32 }, // College
      { wch: 10 }, // Gender
      { wch: 14 }, // Semester
      { wch: 20 }, // Sem Start Date
      { wch: 26 }, // College Joining Date
      { wch: 12 }, // Blood Group
      { wch: 24 }, // Event 1
      { wch: 24 }, // Event 2
      { wch: 24 }, // Reserve Event
      { wch: 18 }, // Relay
      { wch: 20 }, // Half Marathon
      { wch: 22 }, // Accreditation Status
      { wch: 24 }, // Accredited At
      { wch: 18 }, // Payment Status
      { wch: 16 }, // Fee Amount Paid
      { wch: 24 }, // Razorpay Payment ID
      { wch: 16 }, // Hostel Room #
      { wch: 18 }, // Hostel Checked-in
      { wch: 22 }, // Arrival Status
      { wch: 24 }  // Registration Date
    ];

    XLSX.utils.book_append_sheet(wb, ws, 'VTU Athletes Roster');

    const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

    const cleanCollege = college && college !== 'all' ? college.replace(/[^a-zA-Z0-9]/g, '_') : null;
    const filename = cleanCollege 
      ? `VTU_Athletes_${cleanCollege}.xlsx`
      : 'VTU_Athletics_2026_All_Athletes.xlsx';

    return new Response(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${filename}"`
      }
    });
  } catch (err: any) {
    console.error('Export Excel error:', err);
    return NextResponse.json({ error: 'Internal Server Error: ' + err.message }, { status: 500 });
  }
}

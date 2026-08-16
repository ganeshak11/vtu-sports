const fs = require('fs');
const { randomUUID: uuidv4 } = require('crypto');

const COLLEGES = [
  'MIT Mysore', 'PES University', 'RVCE Bangalore', 'BMSCE Bangalore', 
  'MSRIT Bangalore', 'Nitte Meenakshi', 'SJCE Mysore', 'NIE Mysore',
  'DSCE Bangalore', 'BIT Bangalore'
];

const MALE_NAMES = ['Rahul', 'Karthik', 'Sanjay', 'Arjun', 'Rohan', 'Vikram', 'Aditya', 'Abhinav', 'Varun', 'Nitin'];
const FEMALE_NAMES = ['Priya', 'Sneha', 'Ananya', 'Divya', 'Neha', 'Pooja', 'Kavya', 'Shruti', 'Anjali', 'Swati'];
const SURNAMES = ['Sharma', 'Patil', 'Gowda', 'Kumar', 'Singh', 'Reddy', 'Rao', 'Iyer', 'Desai', 'Nair'];

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateAthletes() {
  const athletes = [];
  let maleCount = 1;
  let femaleCount = 1;

  for (let i = 0; i < 500; i++) {
    const isMale = Math.random() > 0.4; // 60% male
    const gender = isMale ? 'men' : 'women';
    const firstNames = isMale ? MALE_NAMES : FEMALE_NAMES;
    const firstName = firstNames[getRandomInt(0, firstNames.length - 1)];
    const lastName = SURNAMES[getRandomInt(0, SURNAMES.length - 1)];
    const fullName = `${firstName} ${lastName}`;
    
    let chestNumber;
    if (isMale) {
      chestNumber = `M${1000 + maleCount}`;
      maleCount++;
    } else {
      chestNumber = `W${2000 + femaleCount}`;
      femaleCount++;
    }

    const officialPin = `PIN-${chestNumber}`;
    const college = COLLEGES[getRandomInt(0, COLLEGES.length - 1)];

    athletes.push({
      id: uuidv4(),
      chest_number: chestNumber,
      full_name: fullName,
      college_name: college,
      gender: gender,
      role: 'athlete',
      official_pin: officialPin
    });
  }
  return athletes;
}

function generateSQL() {
  let sql = `-- 0016_realistic_seed.sql\n\n`;

  // 1. Clear existing transactional data
  sql += `-- 1. Clear existing test data\n`;
  sql += `TRUNCATE profiles CASCADE;\n`;
  sql += `TRUNCATE accommodations CASCADE;\n\n`;

  // 2. Insert Admin
  sql += `-- 2. Insert Admin\n`;
  sql += `INSERT INTO profiles (id, chest_number, full_name, college_name, role) VALUES\n`;
  sql += `('${uuidv4()}', 'ADMIN123', 'Super Admin', 'VTU Head Office', 'admin');\n\n`;

  // 3. Insert Athletes
  const athletes = generateAthletes();
  sql += `-- 3. Insert 500 Athletes\n`;
  sql += `INSERT INTO profiles (id, chest_number, full_name, college_name, gender, role) VALUES\n`;
  
  const athleteValues = athletes.map(a => 
    `('${a.id}', '${a.chest_number}', '${a.full_name}', '${a.college_name}', '${a.gender}', '${a.role}')`
  );
  
  // Chunking to avoid massive single insert statement issues
  const chunkSize = 100;
  for (let i = 0; i < athleteValues.length; i += chunkSize) {
    const chunk = athleteValues.slice(i, i + chunkSize);
    sql += chunk.join(',\n') + (i + chunkSize < athleteValues.length ? ';\nINSERT INTO profiles (id, chest_number, full_name, college_name, gender, role) VALUES\n' : ';\n\n');
  }

  // 4. Insert Accommodations
  sql += `-- 4. Insert Accommodations\n`;
  const accommodations = [
    { id: uuidv4(), name: 'Block A - Boys Hostel', capacity: 300, gender_allowed: 'men', pin: 'WARDEN_BOYS' },
    { id: uuidv4(), name: 'Block B - Girls Hostel', capacity: 300, gender_allowed: 'women', pin: 'WARDEN_GIRLS' }
  ];
  sql += `INSERT INTO accommodations (id, name, capacity, gender_allowed, warden_pin) VALUES\n`;
  sql += accommodations.map(a => `('${a.id}', '${a.name}', ${a.capacity}, '${a.gender_allowed}', '${a.pin}')`).join(',\n') + ';\n\n';

  // 4.5 Insert Food Counter and Update Events
  sql += `-- Update Events with Official PIN (Just one for testing to avoid unique constraint)\n`;
  sql += `UPDATE events SET official_pin = 'REF123' WHERE code = '100M_MEN';\n\n`;

  sql += `-- Insert Food Counter\n`;
  sql += `INSERT INTO food_counters (id, name, volunteer_pin) VALUES ('${uuidv4()}', 'Main Dining Hall', 'FOOD123') ON CONFLICT DO NOTHING;\n\n`;

  // 5. Register Athletes to Events
  // We need to write PL/pgSQL to dynamically fetch event IDs and register them, since IDs are UUIDs.
  sql += `-- 5. Register Athletes to Events\n`;
  sql += `DO $$
DECLARE
  men_events UUID[];
  women_events UUID[];
  v_event_id UUID;
  v_athlete RECORD;
  i INT;
BEGIN
  -- Gather event IDs
  SELECT array_agg(id) INTO men_events FROM events WHERE gender = 'men';
  SELECT array_agg(id) INTO women_events FROM events WHERE gender = 'women';

  -- Loop through athletes and assign to 2 random events
  FOR v_athlete IN SELECT id, gender FROM profiles WHERE role = 'athlete' LOOP
    IF v_athlete.gender = 'men' AND array_length(men_events, 1) > 0 THEN
      -- Pick 2 random events
      FOR i IN 1..2 LOOP
        v_event_id := men_events[floor(random() * array_length(men_events, 1) + 1)];
        BEGIN
          INSERT INTO event_registrations (athlete_id, event_id) VALUES (v_athlete.id, v_event_id);
        EXCEPTION WHEN unique_violation THEN
          -- Ignore duplicates
        END;
      END LOOP;
    ELSIF v_athlete.gender = 'women' AND array_length(women_events, 1) > 0 THEN
      FOR i IN 1..2 LOOP
        v_event_id := women_events[floor(random() * array_length(women_events, 1) + 1)];
        BEGIN
          INSERT INTO event_registrations (athlete_id, event_id) VALUES (v_athlete.id, v_event_id);
        EXCEPTION WHEN unique_violation THEN
        END;
      END LOOP;
    END IF;
  END LOOP;
END $$;\n`;

  fs.writeFileSync('supabase/migrations/0016_realistic_seed.sql', sql);
  console.log('Successfully generated 0016_realistic_seed.sql with 500 athletes.');
}

generateSQL();

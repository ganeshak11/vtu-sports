const fs = require('fs');

const eventList = [
  { code: 1, name: "100 mtrs Run", for: "Men & Women", category: "track", metric: "time" },
  { code: 2, name: "200 mtrs Run", for: "Men & Women", category: "track", metric: "time" },
  { code: 3, name: "400 mtrs Run", for: "Men & Women", category: "track", metric: "time" },
  { code: 4, name: "800 mtrs Run", for: "Men & Women", category: "track", metric: "time" },
  { code: 5, name: "1500 mtrs Run", for: "Men & Women", category: "track", metric: "time" },
  { code: 6, name: "5000 mtrs Run", for: "Men & Women", category: "track", metric: "time" },
  { code: 7, name: "10000 mtrs Run", for: "Men & Women", category: "track", metric: "time" },
  { code: 8, name: "110 mtrs Hurdles", for: "Men", category: "track", metric: "time" },
  { code: 9, name: "100 mtrs Hurdles", for: "Women", category: "track", metric: "time" },
  { code: 10, name: "400 mtrs Hurdles", for: "Men & Women", category: "track", metric: "time" },
  { code: 11, name: "Shot put", for: "Men & Women", category: "field", metric: "distance" },
  { code: 12, name: "Discus Throw", for: "Men & Women", category: "field", metric: "distance" },
  { code: 13, name: "Javelin Throw", for: "Men & Women", category: "field", metric: "distance" },
  { code: 14, name: "Hammer Throw", for: "Men & Women", category: "field", metric: "distance" },
  { code: 15, name: "Long Jump", for: "Men & Women", category: "field", metric: "distance" },
  { code: 16, name: "High Jump", for: "Men & Women", category: "field", metric: "height" },
  { code: 17, name: "Triple Jump", for: "Men & Women", category: "field", metric: "distance" },
  { code: 18, name: "Pole-vault", for: "Men & Women", category: "field", metric: "height" },
  { code: 19, name: "20 km Walk", for: "Men & Women", category: "track", metric: "time" },
  { code: 20, name: "4x100 mtrs Relay", for: "Men & Women", category: "relay", metric: "time" },
  { code: 21, name: "4x400 mtrs Relay", for: "Men & Women", category: "relay", metric: "time" },
  { code: 22, name: "4x400 mtrs Mix Relay", for: "Mix Relay", category: "relay", metric: "time" },
  { code: 23, name: "21 km Half Marathon", for: "Men & Women", category: "track", metric: "time" },
  { code: 24, name: "Decathlon", for: "Men", category: "combined", metric: "points" },
  { code: 25, name: "Heptathlon", for: "Women", category: "combined", metric: "points" }
];

const schedule = [
  // Day 1
  { day: 1, eventCode: 7, time: "06:30", round: "Final", section: "Men" },
  { day: 1, eventCode: 7, time: "07:25", round: "Final", section: "Women" },
  { day: 1, eventCode: 16, time: "07:30", round: "Trial & Final", section: "Men" },
  { day: 1, eventCode: 13, time: "07:45", round: "Trial & Final", section: "Women" },
  { day: 1, eventCode: 4, time: "10:30", round: "Heats", section: "Men" },
  { day: 1, eventCode: 4, time: "10:50", round: "Heats", section: "Women" },
  { day: 1, eventCode: 20, time: "11:15", round: "Heats", section: "Men" },
  { day: 1, eventCode: 20, time: "11:45", round: "Heats", section: "Women" },
  { day: 1, eventCode: 10, time: "12:30", round: "Heats", section: "Men" },
  { day: 1, eventCode: 10, time: "12:45", round: "Heats", section: "Women" },
  { day: 1, eventCode: 13, time: "14:30", round: "Trials & Final", section: "Men" },
  { day: 1, eventCode: 16, time: "14:30", round: "Trials & Final", section: "Women" },
  { day: 1, eventCode: 10, time: "14:45", round: "Final", section: "Women" },
  { day: 1, eventCode: 10, time: "14:55", round: "Final", section: "Men" },
  { day: 1, eventCode: 20, time: "15:10", round: "Semi-Final", section: "Men" },
  { day: 1, eventCode: 20, time: "15:25", round: "Semi-Final", section: "Women" },
  { day: 1, eventCode: 4, time: "15:40", round: "Final", section: "Men" }, 
  { day: 1, eventCode: 4, time: "15:50", round: "Final", section: "Women" },
  { day: 1, eventCode: 20, time: "16:00", round: "Final", section: "Men" },
  { day: 1, eventCode: 20, time: "16:15", round: "Final", section: "Women" },
  
  // Day 2
  { day: 2, eventCode: 19, time: "06:00", round: "Final", section: "Men" },
  { day: 2, eventCode: 19, time: "06:15", round: "Final", section: "Women" },
  { day: 2, eventCode: 3, time: "08:00", round: "Heats", section: "Men" },
  { day: 2, eventCode: 12, time: "08:00", round: "Trial & Final", section: "Men" },
  { day: 2, eventCode: 3, time: "08:30", round: "Heats", section: "Women" },
  { day: 2, eventCode: 24, time: "08:50", round: "Decathlon 1", section: "Men" },
  { day: 2, eventCode: 17, time: "08:50", round: "Trials & Finals", section: "Women" },
  { day: 2, eventCode: 1, time: "09:00", round: "Heats", section: "Women" },
  { day: 2, eventCode: 1, time: "09:30", round: "Heats", section: "Men" },
  { day: 2, eventCode: 24, time: "09:45", round: "Decathlon 2", section: "Men" },
  { day: 2, eventCode: 25, time: "10:00", round: "Heptathlon 1", section: "Women" },
  { day: 2, eventCode: 9, time: "10:10", round: "Heats", section: "Women" },
  { day: 2, eventCode: 5, time: "10:30", round: "Heats", section: "Men" },
  { day: 2, eventCode: 5, time: "10:45", round: "Heats", section: "Women" },
  { day: 2, eventCode: 24, time: "11:00", round: "Decathlon 3", section: "Men" },
  { day: 2, eventCode: 25, time: "11:00", round: "Heptathlon 2", section: "Women" },
  { day: 2, eventCode: 1, time: "11:15", round: "Semi-Final", section: "Men" },
  { day: 2, eventCode: 1, time: "11:30", round: "Semi-Final", section: "Women" },
  { day: 2, eventCode: 9, time: "12:15", round: "Semi-Final", section: "Women" },
  { day: 2, eventCode: 22, time: "12:30", round: "Heats", section: "Mixed" },
  { day: 2, eventCode: 17, time: "14:30", round: "Trials & Final", section: "Men" },
  { day: 2, eventCode: 12, time: "14:30", round: "Trials & Final", section: "Women" },
  { day: 2, eventCode: 9, time: "14:30", round: "Final", section: "Women" },
  { day: 2, eventCode: 24, time: "14:30", round: "Decathlon 4", section: "Men" },
  { day: 2, eventCode: 1, time: "15:15", round: "Final", section: "Men" },
  { day: 2, eventCode: 25, time: "15:15", round: "Heptathlon 3", section: "Women" },
  { day: 2, eventCode: 1, time: "15:20", round: "Final", section: "Women" },
  { day: 2, eventCode: 22, time: "16:00", round: "Semi-Final", section: "Mixed" },
  { day: 2, eventCode: 25, time: "16:30", round: "Heptathlon 4", section: "Women" },
  { day: 2, eventCode: 20, time: "16:45", round: "Decathlon 5", section: "Men" },
  { day: 2, eventCode: 22, time: "16:50", round: "Final", section: "Mixed" },

  // Day 3
  { day: 3, eventCode: 6, time: "06:30", round: "Final", section: "Men" },
  { day: 3, eventCode: 6, time: "07:30", round: "Final", section: "Women" },
  { day: 3, eventCode: 8, time: "08:30", round: "Heats", section: "Men" },
  { day: 3, eventCode: 24, time: "09:00", round: "Decathlon 6", section: "Men" },
  { day: 3, eventCode: 11, time: "09:00", round: "Final", section: "Women" },
  { day: 3, eventCode: 25, time: "09:00", round: "Heptathlon 5", section: "Women" },
  { day: 3, eventCode: 8, time: "09:45", round: "Semi-Final", section: "Men" },
  { day: 3, eventCode: 15, time: "10:00", round: "Final", section: "Women" },
  { day: 3, eventCode: 3, time: "10:10", round: "Semi-Final", section: "Men" },
  { day: 3, eventCode: 24, time: "10:15", round: "Decathlon 7", section: "Men" },
  { day: 3, eventCode: 3, time: "10:15", round: "Semi-Final", section: "Women" },
  { day: 3, eventCode: 25, time: "10:45", round: "Heptathlon 6", section: "Women" },
  { day: 3, eventCode: 24, time: "11:15", round: "Decathlon 8", section: "Men" },
  { day: 3, eventCode: 8, time: "14:30", round: "Final", section: "Men" },
  { day: 3, eventCode: 15, time: "14:45", round: "Final", section: "Men" },
  { day: 3, eventCode: 24, time: "15:00", round: "Decathlon 9", section: "Men" },
  { day: 3, eventCode: 11, time: "15:30", round: "Final", section: "Men" },
  { day: 3, eventCode: 5, time: "15:30", round: "Final", section: "Men" },
  { day: 3, eventCode: 5, time: "15:40", round: "Final", section: "Women" },
  { day: 3, eventCode: 25, time: "16:00", round: "Heptathlon 7", section: "Women" },
  { day: 3, eventCode: 24, time: "16:30", round: "Decathlon 10", section: "Men" },
  { day: 3, eventCode: 3, time: "16:40", round: "Final", section: "Men" },
  { day: 3, eventCode: 3, time: "16:45", round: "Final", section: "Women" },

  // Day 4
  { day: 4, eventCode: 23, time: "06:00", round: "Final", section: "Men" },
  { day: 4, eventCode: 23, time: "06:10", round: "Final", section: "Women" },
  { day: 4, eventCode: 14, time: "07:00", round: "Final", section: "Men" },
  { day: 4, eventCode: 18, time: "07:15", round: "Final", section: "Men" },
  { day: 4, eventCode: 2, time: "07:30", round: "Heats", section: "Men" },
  { day: 4, eventCode: 2, time: "08:00", round: "Heats", section: "Women" },
  { day: 4, eventCode: 18, time: "08:45", round: "Final", section: "Women" },
  { day: 4, eventCode: 14, time: "09:00", round: "Final", section: "Women" },
  { day: 4, eventCode: 21, time: "09:15", round: "Heats", section: "Men" },
  { day: 4, eventCode: 21, time: "09:45", round: "Heats", section: "Women" },
  { day: 4, eventCode: 2, time: "10:30", round: "Semi-Final", section: "Men" },
  { day: 4, eventCode: 2, time: "10:45", round: "Semi-Final", section: "Women" },
  { day: 4, eventCode: 21, time: "11:00", round: "Semi-Final", section: "Men" },
  { day: 4, eventCode: 21, time: "11:15", round: "Semi-Final", section: "Women" },
  { day: 4, eventCode: 2, time: "12:00", round: "Final", section: "Men" },
  { day: 4, eventCode: 2, time: "12:15", round: "Final", section: "Women" },
  { day: 4, eventCode: 21, time: "12:30", round: "Final", section: "Men" },
  { day: 4, eventCode: 21, time: "12:45", round: "Final", section: "Women" },
];

const dayToDate = {
  1: "2025-03-15",
  2: "2025-03-16",
  3: "2025-03-17",
  4: "2025-03-18",
};

let sql = `-- 0008_seed_vtumeet_events.sql\n`;
sql += `-- Auto-generated migration from VTU meet schedule\n\n`;

const generatedEvents = {}; // code_gender -> string

sql += `DO $$\nDECLARE\n`;
sql += `  v_top_8_rule UUID;\n`;
sql += `  v_top_2_rule UUID;\n`;
sql += `  v_field_rule UUID;\n`;
sql += `  v_event_id UUID;\n`;
sql += `BEGIN\n`;
sql += `  SELECT id INTO v_top_8_rule FROM qualification_rules WHERE name = 'Top 8 Overall' LIMIT 1;\n`;
sql += `  SELECT id INTO v_top_2_rule FROM qualification_rules WHERE name = 'Top 2 Per Heat + Next 2' LIMIT 1;\n`;
sql += `  SELECT id INTO v_field_rule FROM qualification_rules WHERE name = 'Best of 3 Attempts (Field)' LIMIT 1;\n\n`;

for (const e of eventList) {
  const genders = [];
  if (e.for.includes("Men")) genders.push("men");
  if (e.for.includes("Women")) genders.push("women");
  if (e.for.includes("Mix Relay")) genders.push("mixed");

  for (const g of genders) {
    const categoryLetter = e.category === 'track' ? 'T' : e.category === 'field' ? 'F' : e.category === 'relay' ? 'R' : 'C';
    const code = categoryLetter + '-' + e.code + '-' + g.toUpperCase();
    const officialPin = 'OFFICIAL-' + code;
    generatedEvents[e.code + '_' + g] = code;

    sql += `  INSERT INTO events (name, code, category, gender, measurement_metric, official_pin, status, qualification_rule_id, start_date, end_date)\n`;
    sql += `  VALUES ('` + e.name.replace("'", "''") + `', '` + code + `', '` + e.category + `', '` + g + `', '` + e.metric + `', '` + officialPin + `', 'upcoming', \n`;
    sql += `    CASE \n`;
    sql += `      WHEN '` + e.category + `' = 'field' THEN v_field_rule\n`;
    sql += `      ELSE v_top_2_rule\n`; 
    sql += `    END,\n`;
    sql += `    '2025-03-15 06:00:00+05:30',\n`;
    sql += `    '2025-03-18 20:00:00+05:30'\n`;
    sql += `  ) ON CONFLICT (code) DO NOTHING;\n\n`;
  }
}

for (const s of schedule) {
  let g = s.section.toLowerCase();
  if (g === "men & women") g = "mixed";
  
  const code = generatedEvents[s.eventCode + '_' + g];
  if (!code) {
    console.log("Missing code for:", s);
    continue;
  }

  const timestamp = dayToDate[s.day] + ' ' + s.time + ':00+05:30';

  sql += `  SELECT id INTO v_event_id FROM events WHERE code = '` + code + `';\n`;
  sql += `  IF FOUND THEN\n`;
  
  const roundType = s.round.toLowerCase().includes("heat") ? "heat" 
                  : s.round.toLowerCase().includes("semi") ? "semi" 
                  : "final";
  
  const seq = roundType === "heat" ? 1 : roundType === "semi" ? 2 : 3;

  sql += `    INSERT INTO event_rounds (event_id, round_type, sequence_number, status)\n`;
  sql += `    VALUES (v_event_id, '` + roundType + `', ` + seq + `, 'pending') ON CONFLICT (event_id, sequence_number) DO NOTHING;\n`;
  
  if (roundType === "final") {
    sql += `    UPDATE events SET start_date = '` + timestamp + `', event_time = '` + timestamp + `', call_room_time = ('` + timestamp + `'::timestamptz - interval '30 minutes') WHERE id = v_event_id;\n`;
  }
  
  sql += `  END IF;\n\n`;
}

sql += `END $$;\n`;

fs.writeFileSync('/home/ganeshak11/dev/Projects/vtu-atletics/supabase/migrations/0008_seed_vtumeet_events.sql', sql);
console.log('SQL generated successfully.');

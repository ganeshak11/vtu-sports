-- Ensure Athlete M1042 exists in the profiles table!
INSERT INTO profiles (full_name, role, college_name, chest_number)
VALUES ('Rahul Sharma', 'athlete', 'MIT Mysore', 'M1042')
ON CONFLICT (chest_number) DO NOTHING;

-- Relink athlete M1042 to the mock event just in case they were created late
INSERT INTO event_registrations (athlete_id, event_id)
SELECT p.id, e.id
FROM profiles p, events e
WHERE p.chest_number = 'M1042' AND e.official_pin = 'OFFICIAL-100M'
ON CONFLICT DO NOTHING;

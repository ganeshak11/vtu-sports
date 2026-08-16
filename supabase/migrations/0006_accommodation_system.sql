-- Phase 6: Accommodation & Transport System

-- 1. Add warden_pin to accommodations
ALTER TABLE accommodations ADD COLUMN IF NOT EXISTS warden_pin VARCHAR(50) UNIQUE;

-- 2. Mock Hostels
INSERT INTO accommodations (name, type, capacity, current_occupancy, warden_pin)
VALUES 
    ('Boys Hostel A', 'hostel', 200, 0, 'WARDEN-BOYS-A'),
    ('Girls Hostel B', 'hostel', 200, 0, 'WARDEN-GIRLS-B')
ON CONFLICT DO NOTHING;

-- 3. RLS Policies
ALTER TABLE accommodations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access on accommodations" ON accommodations FOR SELECT USING (true);
CREATE POLICY "Allow public update on accommodations" ON accommodations FOR UPDATE USING (true) WITH CHECK (true);

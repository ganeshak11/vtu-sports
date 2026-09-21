-- 0017_overhaul_colleges_registration.sql
-- VTU SportsOS complete overhaul for Dr. ACS College of Engineering prototype

-- 1. Create Colleges Table
CREATE TABLE IF NOT EXISTS colleges (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) NOT NULL UNIQUE,
    boys_login_code VARCHAR(50) NOT NULL UNIQUE,
    girls_login_code VARCHAR(50) NOT NULL UNIQUE,
    principal_name VARCHAR(255),
    ped_name VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE colleges ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read access on colleges" ON colleges;
CREATE POLICY "Allow public read access on colleges" ON colleges FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow public all on colleges" ON colleges;
CREATE POLICY "Allow public all on colleges" ON colleges FOR ALL USING (true) WITH CHECK (true);

-- Seed initial 10 representative colleges
INSERT INTO colleges (name, code, boys_login_code, girls_login_code, principal_name, ped_name) VALUES
('Dr. ACS College of Engineering', 'ACSCE', 'ACSCE-M', 'ACSCE-G', 'Dr. M. S. Murali', 'Prof. Anand Kumar'),
('MIT Mysore', 'MITM', 'MITM-M', 'MITM-G', 'Dr. B. G. Naresh Kumar', 'Prof. Chethan V'),
('RVCE Bangalore', 'RVCE', 'RVCE-M', 'RVCE-G', 'Dr. K. N. Subramanya', 'Prof. Rajesh M'),
('BMSCE Bangalore', 'BMSCE', 'BMSCE-M', 'BMSCE-G', 'Dr. S. Muralidhara', 'Prof. Harish K'),
('PES University', 'PESU', 'PESU-M', 'PESU-G', 'Dr. J. Suryaprasad', 'Prof. Vinayaka P'),
('SJCE Mysore', 'SJCE', 'SJCE-M', 'SJCE-G', 'Dr. S. B. Kivadasannavar', 'Prof. Ramesh B'),
('DSCE Bangalore', 'DSCE', 'DSCE-M', 'DSCE-G', 'Dr. C. P. S. Prakash', 'Prof. Manjunath N'),
('MSRIT Bangalore', 'MSRIT', 'MSRIT-M', 'MSRIT-G', 'Dr. N. V. R. Naidu', 'Prof. Kiran G'),
('BIT Bangalore', 'BIT', 'BIT-M', 'BIT-G', 'Dr. M. U. Aswath', 'Prof. Suresh T'),
('NIE Mysore', 'NIE', 'NIE-M', 'NIE-G', 'Dr. Rohini Nagapadma', 'Prof. Venkatesh L')
ON CONFLICT (code) DO UPDATE SET
  boys_login_code = EXCLUDED.boys_login_code,
  girls_login_code = EXCLUDED.girls_login_code;

-- 2. Create Meet Settings Table
CREATE TABLE IF NOT EXISTS meet_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    registration_status VARCHAR(20) DEFAULT 'OPEN', -- 'OPEN', 'CLOSED'
    registration_closed_at TIMESTAMP WITH TIME ZONE,
    host_college_name VARCHAR(255) DEFAULT 'Dr. ACS College of Engineering',
    event_fee_per_regular NUMERIC(10,2) DEFAULT 100.00,
    reserve_fee NUMERIC(10,2) DEFAULT 0.00,
    relay_fee NUMERIC(10,2) DEFAULT 0.00,
    half_marathon_fee NUMERIC(10,2) DEFAULT 0.00,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE meet_settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read access on meet_settings" ON meet_settings;
CREATE POLICY "Allow public read access on meet_settings" ON meet_settings FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow public all on meet_settings" ON meet_settings;
CREATE POLICY "Allow public all on meet_settings" ON meet_settings FOR ALL USING (true) WITH CHECK (true);

INSERT INTO meet_settings (registration_status, host_college_name)
SELECT 'OPEN', 'Dr. ACS College of Engineering'
WHERE NOT EXISTS (SELECT 1 FROM meet_settings);

-- 3. Create Orders Table for Razorpay Tracking
CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id VARCHAR(100) UNIQUE NOT NULL,
    college_code VARCHAR(50),
    athlete_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    amount NUMERIC(10,2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'INR',
    status VARCHAR(20) DEFAULT 'PENDING', -- 'PENDING', 'SUCCESS', 'FAILED'
    payment_id VARCHAR(100),
    signature TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public all on orders" ON orders;
CREATE POLICY "Allow public all on orders" ON orders FOR ALL USING (true) WITH CHECK (true);

-- 4. Alter Profiles Table with New Required Attributes
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS college_id UUID REFERENCES colleges(id) ON DELETE SET NULL;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS sslc_name VARCHAR(255);
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS usn VARCHAR(50);
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS semester INTEGER DEFAULT 1;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS blood_group VARCHAR(10) DEFAULT 'O+';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS college_joining_date DATE DEFAULT '2023-08-01';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS sem_start_date DATE DEFAULT '2026-02-01';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS bib_number VARCHAR(50);

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS payment_status VARCHAR(20) DEFAULT 'DRAFT'; -- 'DRAFT', 'PAYMENT_PENDING', 'CONFIRMED'
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS amount_paid NUMERIC(10,2) DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS order_id VARCHAR(100);
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS payment_id VARCHAR(100);

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS accreditation_status VARCHAR(20) DEFAULT 'REGISTERED'; -- 'REGISTERED', 'ACCREDITED'
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS accredited_at TIMESTAMP WITH TIME ZONE;

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS accommodation_checked_in BOOLEAN DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS accommodation_checked_in_at TIMESTAMP WITH TIME ZONE;

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_reserve BOOLEAN DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_relay BOOLEAN DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_half_marathon BOOLEAN DEFAULT false;

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS event1_id UUID REFERENCES events(id) ON DELETE SET NULL;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS event2_id UUID REFERENCES events(id) ON DELETE SET NULL;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS reserve_event_id UUID REFERENCES events(id) ON DELETE SET NULL;

-- Sync existing data
UPDATE profiles SET sslc_name = full_name WHERE sslc_name IS NULL;
UPDATE profiles SET payment_status = 'CONFIRMED' WHERE role = 'athlete' AND (payment_status IS NULL OR payment_status = 'DRAFT');
UPDATE profiles SET bib_number = chest_number WHERE bib_number IS NULL;

-- Link existing profiles to colleges table by name matching
UPDATE profiles p
SET college_id = c.id
FROM colleges c
WHERE p.college_name = c.name AND p.college_id IS NULL;

-- 5. Alter Call Room Logs Table
ALTER TABLE call_room_logs ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'REPORTED';
ALTER TABLE call_room_logs ADD COLUMN IF NOT EXISTS reported_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE call_room_logs ADD COLUMN IF NOT EXISTS substituted_by_reserve_id UUID REFERENCES profiles(id) ON DELETE SET NULL;

-- 6. Alter Event Results Table for Field Events & DQ/DNS
ALTER TABLE event_results ADD COLUMN IF NOT EXISTS attempt_1 NUMERIC(10,3);
ALTER TABLE event_results ADD COLUMN IF NOT EXISTS attempt_2 NUMERIC(10,3);
ALTER TABLE event_results ADD COLUMN IF NOT EXISTS attempt_3 NUMERIC(10,3);
ALTER TABLE event_results ADD COLUMN IF NOT EXISTS best_mark NUMERIC(10,3);
ALTER TABLE event_results ADD COLUMN IF NOT EXISTS is_dns BOOLEAN DEFAULT false;
ALTER TABLE event_results ADD COLUMN IF NOT EXISTS is_dq BOOLEAN DEFAULT false;

-- 0005_fix_rls.sql
-- Fix Row Level Security policies to allow the application to read data!

-- 1. Enable RLS explicitly (just in case)
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 2. Create policies to allow ANYONE to read events and profiles
-- Since this app uses custom PIN logins, we need to be able to query these tables before the user is authenticated.
CREATE POLICY "Allow public read access on events" ON events FOR SELECT USING (true);
CREATE POLICY "Allow public read access on profiles" ON profiles FOR SELECT USING (true);

-- 3. (Optional) Allow public inserts for testing if you don't have an admin dashboard yet
CREATE POLICY "Allow public insert on events" ON events FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public insert on profiles" ON profiles FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on events" ON events FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Allow public update on profiles" ON profiles FOR UPDATE USING (true) WITH CHECK (true);

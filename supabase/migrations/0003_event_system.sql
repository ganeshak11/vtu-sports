-- Phase 5 & 7: Event Management & Digital Call Room

-- 1. Add official_pin to events table
ALTER TABLE events ADD COLUMN IF NOT EXISTS official_pin VARCHAR(50) UNIQUE;
ALTER TABLE events ADD COLUMN IF NOT EXISTS call_room_time TIMESTAMP WITH TIME ZONE;
ALTER TABLE events ADD COLUMN IF NOT EXISTS event_time TIMESTAMP WITH TIME ZONE;

-- 2. Event Registrations (Athletes registered for an event)
CREATE TABLE IF NOT EXISTS event_registrations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    athlete_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    event_id UUID REFERENCES events(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(athlete_id, event_id)
);

-- 3. Call Room Logs (Recording check-ins)
CREATE TABLE IF NOT EXISTS call_room_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    athlete_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    event_id UUID REFERENCES events(id) ON DELETE CASCADE,
    checked_in_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(athlete_id, event_id)
);

-- Enable RLS
ALTER TABLE event_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE call_room_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public all on event_registrations" ON event_registrations FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public all on call_room_logs" ON call_room_logs FOR ALL USING (true) WITH CHECK (true);

-- Create a mock event for testing
INSERT INTO events (name, start_date, end_date, status, official_pin, call_room_time, event_time)
VALUES (
    '100m Sprint (Men)', 
    CURRENT_DATE, 
    CURRENT_DATE, 
    'upcoming', 
    'OFFICIAL-100M', 
    CURRENT_TIMESTAMP + INTERVAL '30 minutes', -- Call room in 30 mins
    CURRENT_TIMESTAMP + INTERVAL '60 minutes'  -- Event in 60 mins
)
ON CONFLICT DO NOTHING;

INSERT INTO event_registrations (athlete_id, event_id)
SELECT p.id, e.id
FROM profiles p, events e
WHERE p.chest_number = 'M1042' AND e.official_pin = 'OFFICIAL-100M'
ON CONFLICT DO NOTHING;

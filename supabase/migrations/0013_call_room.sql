-- 1. Alter call_room_logs to use round_id instead of event_id
ALTER TABLE call_room_logs DROP CONSTRAINT IF EXISTS call_room_logs_event_id_fkey;
ALTER TABLE call_room_logs DROP COLUMN IF EXISTS event_id;

ALTER TABLE call_room_logs ADD COLUMN IF NOT EXISTS round_id UUID REFERENCES event_rounds(id) ON DELETE CASCADE;

-- 2. Ensure unique constraint to prevent duplicate check-ins
ALTER TABLE call_room_logs DROP CONSTRAINT IF EXISTS call_room_logs_athlete_id_round_id_key;
ALTER TABLE call_room_logs ADD CONSTRAINT call_room_logs_athlete_id_round_id_key UNIQUE (athlete_id, round_id);

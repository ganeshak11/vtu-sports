-- Add scheduling fields to event_rounds
ALTER TABLE event_rounds ADD COLUMN IF NOT EXISTS scheduled_time TIMESTAMP WITH TIME ZONE;
ALTER TABLE event_rounds ADD COLUMN IF NOT EXISTS location VARCHAR(255);

-- Create an index to quickly fetch upcoming events
CREATE INDEX IF NOT EXISTS idx_event_rounds_scheduled_time ON event_rounds(scheduled_time) WHERE scheduled_time IS NOT NULL;

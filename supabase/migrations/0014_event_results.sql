-- Add round_id to event_results
ALTER TABLE event_results DROP CONSTRAINT IF EXISTS event_results_heat_id_profile_id_key;
ALTER TABLE event_results ADD COLUMN IF NOT EXISTS round_id UUID REFERENCES event_rounds(id) ON DELETE CASCADE;

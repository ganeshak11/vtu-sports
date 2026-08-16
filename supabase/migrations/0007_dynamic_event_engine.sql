-- 0007_dynamic_event_engine.sql
-- Upgrades the events schema to a generic JSONB-driven dynamic engine

-- 1. Create Rules Tables
CREATE TABLE IF NOT EXISTS qualification_rules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    config JSONB NOT NULL -- e.g., {"type": "top_per_heat_and_overall", "top_per_heat": 2, "next_best_overall": 2}
);

CREATE TABLE IF NOT EXISTS scoring_rules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    config JSONB NOT NULL -- e.g., {"formula": "A(B-P)^C", "constants": {"A": 25.4347, "B": 18.0, "C": 1.81}}
);

-- 2. Alter Events Table
-- Adding dynamic fields to support any event type
ALTER TABLE events ADD COLUMN IF NOT EXISTS code VARCHAR(50) UNIQUE;
ALTER TABLE events ADD COLUMN IF NOT EXISTS category VARCHAR(50) DEFAULT 'track'; -- track, field, relay, combined, custom
ALTER TABLE events ADD COLUMN IF NOT EXISTS gender VARCHAR(50) DEFAULT 'mixed'; -- men, women, mixed
ALTER TABLE events ADD COLUMN IF NOT EXISTS measurement_metric VARCHAR(50) DEFAULT 'time'; -- time, distance, height, points
ALTER TABLE events ADD COLUMN IF NOT EXISTS lanes_required INTEGER DEFAULT 8;
ALTER TABLE events ADD COLUMN IF NOT EXISTS reporting_window_minutes INTEGER DEFAULT 30;
ALTER TABLE events ADD COLUMN IF NOT EXISTS venue VARCHAR(255);
ALTER TABLE events ADD COLUMN IF NOT EXISTS qualification_rule_id UUID REFERENCES qualification_rules(id);
ALTER TABLE events ADD COLUMN IF NOT EXISTS scoring_rule_id UUID REFERENCES scoring_rules(id);

-- Update existing data
UPDATE events SET code = '100M-MEN-SPRINT' WHERE official_pin = 'OFFICIAL-100M';

-- 3. Round Configuration
CREATE TABLE IF NOT EXISTS event_rounds (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID REFERENCES events(id) ON DELETE CASCADE,
    round_type VARCHAR(50) NOT NULL, -- heat, quarter, semi, final
    sequence_number INTEGER NOT NULL, -- 1, 2, 3
    status VARCHAR(50) DEFAULT 'pending', -- pending, active, completed
    UNIQUE(event_id, sequence_number)
);

CREATE TABLE IF NOT EXISTS event_heats (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    round_id UUID REFERENCES event_rounds(id) ON DELETE CASCADE,
    heat_name VARCHAR(100) NOT NULL, -- "Heat 1"
    start_time TIMESTAMP WITH TIME ZONE
);

-- 4. Results Engine
CREATE TABLE IF NOT EXISTS event_results (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID REFERENCES events(id) ON DELETE CASCADE,
    heat_id UUID REFERENCES event_heats(id) ON DELETE CASCADE,
    profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    lane_number INTEGER,
    attempt_results JSONB, -- For field events: [{"attempt": 1, "result": 7.12, "foul": false}]
    final_result DECIMAL(10,3), -- Aggregated or best result
    points INTEGER, -- For combined events
    rank INTEGER,
    qualified BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(heat_id, profile_id)
);

-- 5. Public RLS Policies
ALTER TABLE qualification_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE scoring_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_rounds ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_heats ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access on qualification_rules" ON qualification_rules FOR SELECT USING (true);
CREATE POLICY "Allow public read access on scoring_rules" ON scoring_rules FOR SELECT USING (true);
CREATE POLICY "Allow public read access on event_rounds" ON event_rounds FOR SELECT USING (true);
CREATE POLICY "Allow public read access on event_heats" ON event_heats FOR SELECT USING (true);
CREATE POLICY "Allow public read access on event_results" ON event_results FOR SELECT USING (true);

CREATE POLICY "Allow admin write on qualification_rules" ON qualification_rules FOR ALL USING (true);
CREATE POLICY "Allow admin write on scoring_rules" ON scoring_rules FOR ALL USING (true);
CREATE POLICY "Allow admin write on event_rounds" ON event_rounds FOR ALL USING (true);
CREATE POLICY "Allow admin write on event_heats" ON event_heats FOR ALL USING (true);
CREATE POLICY "Allow admin/referee write on event_results" ON event_results FOR ALL USING (true);

-- 6. Seed Basic Rules
INSERT INTO qualification_rules (name, description, config) VALUES 
('Top 8 Overall', 'Top 8 fastest times across all heats qualify', '{"type": "top_overall", "count": 8}'),
('Top 2 Per Heat + Next 2', 'Top 2 from each heat plus the next 2 fastest overall', '{"type": "top_per_heat_and_overall", "top_per_heat": 2, "next_best_overall": 2}'),
('Best of 3 Attempts (Field)', 'Athlete takes 3 attempts, best is chosen', '{"type": "field_attempts", "attempts_allowed": 3, "best_wins": true}')
ON CONFLICT DO NOTHING;

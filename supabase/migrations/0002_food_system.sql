-- Phase 3 & 4: Food Management System

CREATE TABLE IF NOT EXISTS food_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    athlete_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    meal_type VARCHAR(100) NOT NULL, -- e.g., 'day1_breakfast', 'day1_lunch'
    scanned_by UUID REFERENCES profiles(id) ON DELETE SET NULL, -- Admin or Volunteer ID
    consumed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(athlete_id, meal_type) -- Ensures an athlete can only consume a specific meal once
);

-- Enable RLS (and allow all operations for public access during dev)
ALTER TABLE food_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public all on food_logs" 
ON food_logs 
FOR ALL 
USING (true)
WITH CHECK (true);

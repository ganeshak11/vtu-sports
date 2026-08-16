-- 0009_food_volunteer_role.sql
-- Separates food scanning from the Admin role by creating a dedicated Food Counters table

CREATE TABLE IF NOT EXISTS food_counters (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    volunteer_pin VARCHAR(50) UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Insert default mock counter
INSERT INTO food_counters (name, volunteer_pin) 
VALUES ('Main Cafeteria Counter 1', 'FOOD-VOLUNTEER-1')
ON CONFLICT (volunteer_pin) DO NOTHING;

-- RLS Policies
ALTER TABLE food_counters ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access on food_counters" ON food_counters FOR SELECT USING (true);
CREATE POLICY "Allow admin write on food_counters" ON food_counters FOR ALL USING (true);

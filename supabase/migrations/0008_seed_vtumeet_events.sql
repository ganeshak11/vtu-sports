-- 0008_seed_vtumeet_events.sql
-- Auto-generated migration from VTU meet schedule

DO $$
DECLARE
  v_top_8_rule UUID;
  v_top_2_rule UUID;
  v_field_rule UUID;
  v_event_id UUID;
BEGIN
  SELECT id INTO v_top_8_rule FROM qualification_rules WHERE name = 'Top 8 Overall' LIMIT 1;
  SELECT id INTO v_top_2_rule FROM qualification_rules WHERE name = 'Top 2 Per Heat + Next 2' LIMIT 1;
  SELECT id INTO v_field_rule FROM qualification_rules WHERE name = 'Best of 3 Attempts (Field)' LIMIT 1;

  INSERT INTO events (name, code, category, gender, measurement_metric, official_pin, status, qualification_rule_id, start_date, end_date)
  VALUES ('100 mtrs Run', 'T-1-MEN', 'track', 'men', 'time', 'OFFICIAL-T-1-MEN', 'upcoming', 
    CASE 
      WHEN 'track' = 'field' THEN v_field_rule
      ELSE v_top_2_rule
    END,
    '2025-03-15 06:00:00+05:30',
    '2025-03-18 20:00:00+05:30'
  ) ON CONFLICT (code) DO NOTHING;

  INSERT INTO events (name, code, category, gender, measurement_metric, official_pin, status, qualification_rule_id, start_date, end_date)
  VALUES ('100 mtrs Run', 'T-1-WOMEN', 'track', 'women', 'time', 'OFFICIAL-T-1-WOMEN', 'upcoming', 
    CASE 
      WHEN 'track' = 'field' THEN v_field_rule
      ELSE v_top_2_rule
    END,
    '2025-03-15 06:00:00+05:30',
    '2025-03-18 20:00:00+05:30'
  ) ON CONFLICT (code) DO NOTHING;

  INSERT INTO events (name, code, category, gender, measurement_metric, official_pin, status, qualification_rule_id, start_date, end_date)
  VALUES ('200 mtrs Run', 'T-2-MEN', 'track', 'men', 'time', 'OFFICIAL-T-2-MEN', 'upcoming', 
    CASE 
      WHEN 'track' = 'field' THEN v_field_rule
      ELSE v_top_2_rule
    END,
    '2025-03-15 06:00:00+05:30',
    '2025-03-18 20:00:00+05:30'
  ) ON CONFLICT (code) DO NOTHING;

  INSERT INTO events (name, code, category, gender, measurement_metric, official_pin, status, qualification_rule_id, start_date, end_date)
  VALUES ('200 mtrs Run', 'T-2-WOMEN', 'track', 'women', 'time', 'OFFICIAL-T-2-WOMEN', 'upcoming', 
    CASE 
      WHEN 'track' = 'field' THEN v_field_rule
      ELSE v_top_2_rule
    END,
    '2025-03-15 06:00:00+05:30',
    '2025-03-18 20:00:00+05:30'
  ) ON CONFLICT (code) DO NOTHING;

  INSERT INTO events (name, code, category, gender, measurement_metric, official_pin, status, qualification_rule_id, start_date, end_date)
  VALUES ('400 mtrs Run', 'T-3-MEN', 'track', 'men', 'time', 'OFFICIAL-T-3-MEN', 'upcoming', 
    CASE 
      WHEN 'track' = 'field' THEN v_field_rule
      ELSE v_top_2_rule
    END,
    '2025-03-15 06:00:00+05:30',
    '2025-03-18 20:00:00+05:30'
  ) ON CONFLICT (code) DO NOTHING;

  INSERT INTO events (name, code, category, gender, measurement_metric, official_pin, status, qualification_rule_id, start_date, end_date)
  VALUES ('400 mtrs Run', 'T-3-WOMEN', 'track', 'women', 'time', 'OFFICIAL-T-3-WOMEN', 'upcoming', 
    CASE 
      WHEN 'track' = 'field' THEN v_field_rule
      ELSE v_top_2_rule
    END,
    '2025-03-15 06:00:00+05:30',
    '2025-03-18 20:00:00+05:30'
  ) ON CONFLICT (code) DO NOTHING;

  INSERT INTO events (name, code, category, gender, measurement_metric, official_pin, status, qualification_rule_id, start_date, end_date)
  VALUES ('800 mtrs Run', 'T-4-MEN', 'track', 'men', 'time', 'OFFICIAL-T-4-MEN', 'upcoming', 
    CASE 
      WHEN 'track' = 'field' THEN v_field_rule
      ELSE v_top_2_rule
    END,
    '2025-03-15 06:00:00+05:30',
    '2025-03-18 20:00:00+05:30'
  ) ON CONFLICT (code) DO NOTHING;

  INSERT INTO events (name, code, category, gender, measurement_metric, official_pin, status, qualification_rule_id, start_date, end_date)
  VALUES ('800 mtrs Run', 'T-4-WOMEN', 'track', 'women', 'time', 'OFFICIAL-T-4-WOMEN', 'upcoming', 
    CASE 
      WHEN 'track' = 'field' THEN v_field_rule
      ELSE v_top_2_rule
    END,
    '2025-03-15 06:00:00+05:30',
    '2025-03-18 20:00:00+05:30'
  ) ON CONFLICT (code) DO NOTHING;

  INSERT INTO events (name, code, category, gender, measurement_metric, official_pin, status, qualification_rule_id, start_date, end_date)
  VALUES ('1500 mtrs Run', 'T-5-MEN', 'track', 'men', 'time', 'OFFICIAL-T-5-MEN', 'upcoming', 
    CASE 
      WHEN 'track' = 'field' THEN v_field_rule
      ELSE v_top_2_rule
    END,
    '2025-03-15 06:00:00+05:30',
    '2025-03-18 20:00:00+05:30'
  ) ON CONFLICT (code) DO NOTHING;

  INSERT INTO events (name, code, category, gender, measurement_metric, official_pin, status, qualification_rule_id, start_date, end_date)
  VALUES ('1500 mtrs Run', 'T-5-WOMEN', 'track', 'women', 'time', 'OFFICIAL-T-5-WOMEN', 'upcoming', 
    CASE 
      WHEN 'track' = 'field' THEN v_field_rule
      ELSE v_top_2_rule
    END,
    '2025-03-15 06:00:00+05:30',
    '2025-03-18 20:00:00+05:30'
  ) ON CONFLICT (code) DO NOTHING;

  INSERT INTO events (name, code, category, gender, measurement_metric, official_pin, status, qualification_rule_id, start_date, end_date)
  VALUES ('5000 mtrs Run', 'T-6-MEN', 'track', 'men', 'time', 'OFFICIAL-T-6-MEN', 'upcoming', 
    CASE 
      WHEN 'track' = 'field' THEN v_field_rule
      ELSE v_top_2_rule
    END,
    '2025-03-15 06:00:00+05:30',
    '2025-03-18 20:00:00+05:30'
  ) ON CONFLICT (code) DO NOTHING;

  INSERT INTO events (name, code, category, gender, measurement_metric, official_pin, status, qualification_rule_id, start_date, end_date)
  VALUES ('5000 mtrs Run', 'T-6-WOMEN', 'track', 'women', 'time', 'OFFICIAL-T-6-WOMEN', 'upcoming', 
    CASE 
      WHEN 'track' = 'field' THEN v_field_rule
      ELSE v_top_2_rule
    END,
    '2025-03-15 06:00:00+05:30',
    '2025-03-18 20:00:00+05:30'
  ) ON CONFLICT (code) DO NOTHING;

  INSERT INTO events (name, code, category, gender, measurement_metric, official_pin, status, qualification_rule_id, start_date, end_date)
  VALUES ('10000 mtrs Run', 'T-7-MEN', 'track', 'men', 'time', 'OFFICIAL-T-7-MEN', 'upcoming', 
    CASE 
      WHEN 'track' = 'field' THEN v_field_rule
      ELSE v_top_2_rule
    END,
    '2025-03-15 06:00:00+05:30',
    '2025-03-18 20:00:00+05:30'
  ) ON CONFLICT (code) DO NOTHING;

  INSERT INTO events (name, code, category, gender, measurement_metric, official_pin, status, qualification_rule_id, start_date, end_date)
  VALUES ('10000 mtrs Run', 'T-7-WOMEN', 'track', 'women', 'time', 'OFFICIAL-T-7-WOMEN', 'upcoming', 
    CASE 
      WHEN 'track' = 'field' THEN v_field_rule
      ELSE v_top_2_rule
    END,
    '2025-03-15 06:00:00+05:30',
    '2025-03-18 20:00:00+05:30'
  ) ON CONFLICT (code) DO NOTHING;

  INSERT INTO events (name, code, category, gender, measurement_metric, official_pin, status, qualification_rule_id, start_date, end_date)
  VALUES ('110 mtrs Hurdles', 'T-8-MEN', 'track', 'men', 'time', 'OFFICIAL-T-8-MEN', 'upcoming', 
    CASE 
      WHEN 'track' = 'field' THEN v_field_rule
      ELSE v_top_2_rule
    END,
    '2025-03-15 06:00:00+05:30',
    '2025-03-18 20:00:00+05:30'
  ) ON CONFLICT (code) DO NOTHING;

  INSERT INTO events (name, code, category, gender, measurement_metric, official_pin, status, qualification_rule_id, start_date, end_date)
  VALUES ('100 mtrs Hurdles', 'T-9-WOMEN', 'track', 'women', 'time', 'OFFICIAL-T-9-WOMEN', 'upcoming', 
    CASE 
      WHEN 'track' = 'field' THEN v_field_rule
      ELSE v_top_2_rule
    END,
    '2025-03-15 06:00:00+05:30',
    '2025-03-18 20:00:00+05:30'
  ) ON CONFLICT (code) DO NOTHING;

  INSERT INTO events (name, code, category, gender, measurement_metric, official_pin, status, qualification_rule_id, start_date, end_date)
  VALUES ('400 mtrs Hurdles', 'T-10-MEN', 'track', 'men', 'time', 'OFFICIAL-T-10-MEN', 'upcoming', 
    CASE 
      WHEN 'track' = 'field' THEN v_field_rule
      ELSE v_top_2_rule
    END,
    '2025-03-15 06:00:00+05:30',
    '2025-03-18 20:00:00+05:30'
  ) ON CONFLICT (code) DO NOTHING;

  INSERT INTO events (name, code, category, gender, measurement_metric, official_pin, status, qualification_rule_id, start_date, end_date)
  VALUES ('400 mtrs Hurdles', 'T-10-WOMEN', 'track', 'women', 'time', 'OFFICIAL-T-10-WOMEN', 'upcoming', 
    CASE 
      WHEN 'track' = 'field' THEN v_field_rule
      ELSE v_top_2_rule
    END,
    '2025-03-15 06:00:00+05:30',
    '2025-03-18 20:00:00+05:30'
  ) ON CONFLICT (code) DO NOTHING;

  INSERT INTO events (name, code, category, gender, measurement_metric, official_pin, status, qualification_rule_id, start_date, end_date)
  VALUES ('Shot put', 'F-11-MEN', 'field', 'men', 'distance', 'OFFICIAL-F-11-MEN', 'upcoming', 
    CASE 
      WHEN 'field' = 'field' THEN v_field_rule
      ELSE v_top_2_rule
    END,
    '2025-03-15 06:00:00+05:30',
    '2025-03-18 20:00:00+05:30'
  ) ON CONFLICT (code) DO NOTHING;

  INSERT INTO events (name, code, category, gender, measurement_metric, official_pin, status, qualification_rule_id, start_date, end_date)
  VALUES ('Shot put', 'F-11-WOMEN', 'field', 'women', 'distance', 'OFFICIAL-F-11-WOMEN', 'upcoming', 
    CASE 
      WHEN 'field' = 'field' THEN v_field_rule
      ELSE v_top_2_rule
    END,
    '2025-03-15 06:00:00+05:30',
    '2025-03-18 20:00:00+05:30'
  ) ON CONFLICT (code) DO NOTHING;

  INSERT INTO events (name, code, category, gender, measurement_metric, official_pin, status, qualification_rule_id, start_date, end_date)
  VALUES ('Discus Throw', 'F-12-MEN', 'field', 'men', 'distance', 'OFFICIAL-F-12-MEN', 'upcoming', 
    CASE 
      WHEN 'field' = 'field' THEN v_field_rule
      ELSE v_top_2_rule
    END,
    '2025-03-15 06:00:00+05:30',
    '2025-03-18 20:00:00+05:30'
  ) ON CONFLICT (code) DO NOTHING;

  INSERT INTO events (name, code, category, gender, measurement_metric, official_pin, status, qualification_rule_id, start_date, end_date)
  VALUES ('Discus Throw', 'F-12-WOMEN', 'field', 'women', 'distance', 'OFFICIAL-F-12-WOMEN', 'upcoming', 
    CASE 
      WHEN 'field' = 'field' THEN v_field_rule
      ELSE v_top_2_rule
    END,
    '2025-03-15 06:00:00+05:30',
    '2025-03-18 20:00:00+05:30'
  ) ON CONFLICT (code) DO NOTHING;

  INSERT INTO events (name, code, category, gender, measurement_metric, official_pin, status, qualification_rule_id, start_date, end_date)
  VALUES ('Javelin Throw', 'F-13-MEN', 'field', 'men', 'distance', 'OFFICIAL-F-13-MEN', 'upcoming', 
    CASE 
      WHEN 'field' = 'field' THEN v_field_rule
      ELSE v_top_2_rule
    END,
    '2025-03-15 06:00:00+05:30',
    '2025-03-18 20:00:00+05:30'
  ) ON CONFLICT (code) DO NOTHING;

  INSERT INTO events (name, code, category, gender, measurement_metric, official_pin, status, qualification_rule_id, start_date, end_date)
  VALUES ('Javelin Throw', 'F-13-WOMEN', 'field', 'women', 'distance', 'OFFICIAL-F-13-WOMEN', 'upcoming', 
    CASE 
      WHEN 'field' = 'field' THEN v_field_rule
      ELSE v_top_2_rule
    END,
    '2025-03-15 06:00:00+05:30',
    '2025-03-18 20:00:00+05:30'
  ) ON CONFLICT (code) DO NOTHING;

  INSERT INTO events (name, code, category, gender, measurement_metric, official_pin, status, qualification_rule_id, start_date, end_date)
  VALUES ('Hammer Throw', 'F-14-MEN', 'field', 'men', 'distance', 'OFFICIAL-F-14-MEN', 'upcoming', 
    CASE 
      WHEN 'field' = 'field' THEN v_field_rule
      ELSE v_top_2_rule
    END,
    '2025-03-15 06:00:00+05:30',
    '2025-03-18 20:00:00+05:30'
  ) ON CONFLICT (code) DO NOTHING;

  INSERT INTO events (name, code, category, gender, measurement_metric, official_pin, status, qualification_rule_id, start_date, end_date)
  VALUES ('Hammer Throw', 'F-14-WOMEN', 'field', 'women', 'distance', 'OFFICIAL-F-14-WOMEN', 'upcoming', 
    CASE 
      WHEN 'field' = 'field' THEN v_field_rule
      ELSE v_top_2_rule
    END,
    '2025-03-15 06:00:00+05:30',
    '2025-03-18 20:00:00+05:30'
  ) ON CONFLICT (code) DO NOTHING;

  INSERT INTO events (name, code, category, gender, measurement_metric, official_pin, status, qualification_rule_id, start_date, end_date)
  VALUES ('Long Jump', 'F-15-MEN', 'field', 'men', 'distance', 'OFFICIAL-F-15-MEN', 'upcoming', 
    CASE 
      WHEN 'field' = 'field' THEN v_field_rule
      ELSE v_top_2_rule
    END,
    '2025-03-15 06:00:00+05:30',
    '2025-03-18 20:00:00+05:30'
  ) ON CONFLICT (code) DO NOTHING;

  INSERT INTO events (name, code, category, gender, measurement_metric, official_pin, status, qualification_rule_id, start_date, end_date)
  VALUES ('Long Jump', 'F-15-WOMEN', 'field', 'women', 'distance', 'OFFICIAL-F-15-WOMEN', 'upcoming', 
    CASE 
      WHEN 'field' = 'field' THEN v_field_rule
      ELSE v_top_2_rule
    END,
    '2025-03-15 06:00:00+05:30',
    '2025-03-18 20:00:00+05:30'
  ) ON CONFLICT (code) DO NOTHING;

  INSERT INTO events (name, code, category, gender, measurement_metric, official_pin, status, qualification_rule_id, start_date, end_date)
  VALUES ('High Jump', 'F-16-MEN', 'field', 'men', 'height', 'OFFICIAL-F-16-MEN', 'upcoming', 
    CASE 
      WHEN 'field' = 'field' THEN v_field_rule
      ELSE v_top_2_rule
    END,
    '2025-03-15 06:00:00+05:30',
    '2025-03-18 20:00:00+05:30'
  ) ON CONFLICT (code) DO NOTHING;

  INSERT INTO events (name, code, category, gender, measurement_metric, official_pin, status, qualification_rule_id, start_date, end_date)
  VALUES ('High Jump', 'F-16-WOMEN', 'field', 'women', 'height', 'OFFICIAL-F-16-WOMEN', 'upcoming', 
    CASE 
      WHEN 'field' = 'field' THEN v_field_rule
      ELSE v_top_2_rule
    END,
    '2025-03-15 06:00:00+05:30',
    '2025-03-18 20:00:00+05:30'
  ) ON CONFLICT (code) DO NOTHING;

  INSERT INTO events (name, code, category, gender, measurement_metric, official_pin, status, qualification_rule_id, start_date, end_date)
  VALUES ('Triple Jump', 'F-17-MEN', 'field', 'men', 'distance', 'OFFICIAL-F-17-MEN', 'upcoming', 
    CASE 
      WHEN 'field' = 'field' THEN v_field_rule
      ELSE v_top_2_rule
    END,
    '2025-03-15 06:00:00+05:30',
    '2025-03-18 20:00:00+05:30'
  ) ON CONFLICT (code) DO NOTHING;

  INSERT INTO events (name, code, category, gender, measurement_metric, official_pin, status, qualification_rule_id, start_date, end_date)
  VALUES ('Triple Jump', 'F-17-WOMEN', 'field', 'women', 'distance', 'OFFICIAL-F-17-WOMEN', 'upcoming', 
    CASE 
      WHEN 'field' = 'field' THEN v_field_rule
      ELSE v_top_2_rule
    END,
    '2025-03-15 06:00:00+05:30',
    '2025-03-18 20:00:00+05:30'
  ) ON CONFLICT (code) DO NOTHING;

  INSERT INTO events (name, code, category, gender, measurement_metric, official_pin, status, qualification_rule_id, start_date, end_date)
  VALUES ('Pole-vault', 'F-18-MEN', 'field', 'men', 'height', 'OFFICIAL-F-18-MEN', 'upcoming', 
    CASE 
      WHEN 'field' = 'field' THEN v_field_rule
      ELSE v_top_2_rule
    END,
    '2025-03-15 06:00:00+05:30',
    '2025-03-18 20:00:00+05:30'
  ) ON CONFLICT (code) DO NOTHING;

  INSERT INTO events (name, code, category, gender, measurement_metric, official_pin, status, qualification_rule_id, start_date, end_date)
  VALUES ('Pole-vault', 'F-18-WOMEN', 'field', 'women', 'height', 'OFFICIAL-F-18-WOMEN', 'upcoming', 
    CASE 
      WHEN 'field' = 'field' THEN v_field_rule
      ELSE v_top_2_rule
    END,
    '2025-03-15 06:00:00+05:30',
    '2025-03-18 20:00:00+05:30'
  ) ON CONFLICT (code) DO NOTHING;

  INSERT INTO events (name, code, category, gender, measurement_metric, official_pin, status, qualification_rule_id, start_date, end_date)
  VALUES ('20 km Walk', 'T-19-MEN', 'track', 'men', 'time', 'OFFICIAL-T-19-MEN', 'upcoming', 
    CASE 
      WHEN 'track' = 'field' THEN v_field_rule
      ELSE v_top_2_rule
    END,
    '2025-03-15 06:00:00+05:30',
    '2025-03-18 20:00:00+05:30'
  ) ON CONFLICT (code) DO NOTHING;

  INSERT INTO events (name, code, category, gender, measurement_metric, official_pin, status, qualification_rule_id, start_date, end_date)
  VALUES ('20 km Walk', 'T-19-WOMEN', 'track', 'women', 'time', 'OFFICIAL-T-19-WOMEN', 'upcoming', 
    CASE 
      WHEN 'track' = 'field' THEN v_field_rule
      ELSE v_top_2_rule
    END,
    '2025-03-15 06:00:00+05:30',
    '2025-03-18 20:00:00+05:30'
  ) ON CONFLICT (code) DO NOTHING;

  INSERT INTO events (name, code, category, gender, measurement_metric, official_pin, status, qualification_rule_id, start_date, end_date)
  VALUES ('4x100 mtrs Relay', 'R-20-MEN', 'relay', 'men', 'time', 'OFFICIAL-R-20-MEN', 'upcoming', 
    CASE 
      WHEN 'relay' = 'field' THEN v_field_rule
      ELSE v_top_2_rule
    END,
    '2025-03-15 06:00:00+05:30',
    '2025-03-18 20:00:00+05:30'
  ) ON CONFLICT (code) DO NOTHING;

  INSERT INTO events (name, code, category, gender, measurement_metric, official_pin, status, qualification_rule_id, start_date, end_date)
  VALUES ('4x100 mtrs Relay', 'R-20-WOMEN', 'relay', 'women', 'time', 'OFFICIAL-R-20-WOMEN', 'upcoming', 
    CASE 
      WHEN 'relay' = 'field' THEN v_field_rule
      ELSE v_top_2_rule
    END,
    '2025-03-15 06:00:00+05:30',
    '2025-03-18 20:00:00+05:30'
  ) ON CONFLICT (code) DO NOTHING;

  INSERT INTO events (name, code, category, gender, measurement_metric, official_pin, status, qualification_rule_id, start_date, end_date)
  VALUES ('4x400 mtrs Relay', 'R-21-MEN', 'relay', 'men', 'time', 'OFFICIAL-R-21-MEN', 'upcoming', 
    CASE 
      WHEN 'relay' = 'field' THEN v_field_rule
      ELSE v_top_2_rule
    END,
    '2025-03-15 06:00:00+05:30',
    '2025-03-18 20:00:00+05:30'
  ) ON CONFLICT (code) DO NOTHING;

  INSERT INTO events (name, code, category, gender, measurement_metric, official_pin, status, qualification_rule_id, start_date, end_date)
  VALUES ('4x400 mtrs Relay', 'R-21-WOMEN', 'relay', 'women', 'time', 'OFFICIAL-R-21-WOMEN', 'upcoming', 
    CASE 
      WHEN 'relay' = 'field' THEN v_field_rule
      ELSE v_top_2_rule
    END,
    '2025-03-15 06:00:00+05:30',
    '2025-03-18 20:00:00+05:30'
  ) ON CONFLICT (code) DO NOTHING;

  INSERT INTO events (name, code, category, gender, measurement_metric, official_pin, status, qualification_rule_id, start_date, end_date)
  VALUES ('4x400 mtrs Mix Relay', 'R-22-MIXED', 'relay', 'mixed', 'time', 'OFFICIAL-R-22-MIXED', 'upcoming', 
    CASE 
      WHEN 'relay' = 'field' THEN v_field_rule
      ELSE v_top_2_rule
    END,
    '2025-03-15 06:00:00+05:30',
    '2025-03-18 20:00:00+05:30'
  ) ON CONFLICT (code) DO NOTHING;

  INSERT INTO events (name, code, category, gender, measurement_metric, official_pin, status, qualification_rule_id, start_date, end_date)
  VALUES ('21 km Half Marathon', 'T-23-MEN', 'track', 'men', 'time', 'OFFICIAL-T-23-MEN', 'upcoming', 
    CASE 
      WHEN 'track' = 'field' THEN v_field_rule
      ELSE v_top_2_rule
    END,
    '2025-03-15 06:00:00+05:30',
    '2025-03-18 20:00:00+05:30'
  ) ON CONFLICT (code) DO NOTHING;

  INSERT INTO events (name, code, category, gender, measurement_metric, official_pin, status, qualification_rule_id, start_date, end_date)
  VALUES ('21 km Half Marathon', 'T-23-WOMEN', 'track', 'women', 'time', 'OFFICIAL-T-23-WOMEN', 'upcoming', 
    CASE 
      WHEN 'track' = 'field' THEN v_field_rule
      ELSE v_top_2_rule
    END,
    '2025-03-15 06:00:00+05:30',
    '2025-03-18 20:00:00+05:30'
  ) ON CONFLICT (code) DO NOTHING;

  INSERT INTO events (name, code, category, gender, measurement_metric, official_pin, status, qualification_rule_id, start_date, end_date)
  VALUES ('Decathlon', 'C-24-MEN', 'combined', 'men', 'points', 'OFFICIAL-C-24-MEN', 'upcoming', 
    CASE 
      WHEN 'combined' = 'field' THEN v_field_rule
      ELSE v_top_2_rule
    END,
    '2025-03-15 06:00:00+05:30',
    '2025-03-18 20:00:00+05:30'
  ) ON CONFLICT (code) DO NOTHING;

  INSERT INTO events (name, code, category, gender, measurement_metric, official_pin, status, qualification_rule_id, start_date, end_date)
  VALUES ('Heptathlon', 'C-25-WOMEN', 'combined', 'women', 'points', 'OFFICIAL-C-25-WOMEN', 'upcoming', 
    CASE 
      WHEN 'combined' = 'field' THEN v_field_rule
      ELSE v_top_2_rule
    END,
    '2025-03-15 06:00:00+05:30',
    '2025-03-18 20:00:00+05:30'
  ) ON CONFLICT (code) DO NOTHING;

  SELECT id INTO v_event_id FROM events WHERE code = 'T-7-MEN';
  IF FOUND THEN
    INSERT INTO event_rounds (event_id, round_type, sequence_number, status)
    VALUES (v_event_id, 'final', 3, 'pending') ON CONFLICT (event_id, sequence_number) DO NOTHING;
    UPDATE events SET start_date = '2025-03-15 06:30:00+05:30', event_time = '2025-03-15 06:30:00+05:30', call_room_time = ('2025-03-15 06:30:00+05:30'::timestamptz - interval '30 minutes') WHERE id = v_event_id;
  END IF;

  SELECT id INTO v_event_id FROM events WHERE code = 'T-7-WOMEN';
  IF FOUND THEN
    INSERT INTO event_rounds (event_id, round_type, sequence_number, status)
    VALUES (v_event_id, 'final', 3, 'pending') ON CONFLICT (event_id, sequence_number) DO NOTHING;
    UPDATE events SET start_date = '2025-03-15 07:25:00+05:30', event_time = '2025-03-15 07:25:00+05:30', call_room_time = ('2025-03-15 07:25:00+05:30'::timestamptz - interval '30 minutes') WHERE id = v_event_id;
  END IF;

  SELECT id INTO v_event_id FROM events WHERE code = 'F-16-MEN';
  IF FOUND THEN
    INSERT INTO event_rounds (event_id, round_type, sequence_number, status)
    VALUES (v_event_id, 'final', 3, 'pending') ON CONFLICT (event_id, sequence_number) DO NOTHING;
    UPDATE events SET start_date = '2025-03-15 07:30:00+05:30', event_time = '2025-03-15 07:30:00+05:30', call_room_time = ('2025-03-15 07:30:00+05:30'::timestamptz - interval '30 minutes') WHERE id = v_event_id;
  END IF;

  SELECT id INTO v_event_id FROM events WHERE code = 'F-13-WOMEN';
  IF FOUND THEN
    INSERT INTO event_rounds (event_id, round_type, sequence_number, status)
    VALUES (v_event_id, 'final', 3, 'pending') ON CONFLICT (event_id, sequence_number) DO NOTHING;
    UPDATE events SET start_date = '2025-03-15 07:45:00+05:30', event_time = '2025-03-15 07:45:00+05:30', call_room_time = ('2025-03-15 07:45:00+05:30'::timestamptz - interval '30 minutes') WHERE id = v_event_id;
  END IF;

  SELECT id INTO v_event_id FROM events WHERE code = 'T-4-MEN';
  IF FOUND THEN
    INSERT INTO event_rounds (event_id, round_type, sequence_number, status)
    VALUES (v_event_id, 'heat', 1, 'pending') ON CONFLICT (event_id, sequence_number) DO NOTHING;
  END IF;

  SELECT id INTO v_event_id FROM events WHERE code = 'T-4-WOMEN';
  IF FOUND THEN
    INSERT INTO event_rounds (event_id, round_type, sequence_number, status)
    VALUES (v_event_id, 'heat', 1, 'pending') ON CONFLICT (event_id, sequence_number) DO NOTHING;
  END IF;

  SELECT id INTO v_event_id FROM events WHERE code = 'R-20-MEN';
  IF FOUND THEN
    INSERT INTO event_rounds (event_id, round_type, sequence_number, status)
    VALUES (v_event_id, 'heat', 1, 'pending') ON CONFLICT (event_id, sequence_number) DO NOTHING;
  END IF;

  SELECT id INTO v_event_id FROM events WHERE code = 'R-20-WOMEN';
  IF FOUND THEN
    INSERT INTO event_rounds (event_id, round_type, sequence_number, status)
    VALUES (v_event_id, 'heat', 1, 'pending') ON CONFLICT (event_id, sequence_number) DO NOTHING;
  END IF;

  SELECT id INTO v_event_id FROM events WHERE code = 'T-10-MEN';
  IF FOUND THEN
    INSERT INTO event_rounds (event_id, round_type, sequence_number, status)
    VALUES (v_event_id, 'heat', 1, 'pending') ON CONFLICT (event_id, sequence_number) DO NOTHING;
  END IF;

  SELECT id INTO v_event_id FROM events WHERE code = 'T-10-WOMEN';
  IF FOUND THEN
    INSERT INTO event_rounds (event_id, round_type, sequence_number, status)
    VALUES (v_event_id, 'heat', 1, 'pending') ON CONFLICT (event_id, sequence_number) DO NOTHING;
  END IF;

  SELECT id INTO v_event_id FROM events WHERE code = 'F-13-MEN';
  IF FOUND THEN
    INSERT INTO event_rounds (event_id, round_type, sequence_number, status)
    VALUES (v_event_id, 'final', 3, 'pending') ON CONFLICT (event_id, sequence_number) DO NOTHING;
    UPDATE events SET start_date = '2025-03-15 14:30:00+05:30', event_time = '2025-03-15 14:30:00+05:30', call_room_time = ('2025-03-15 14:30:00+05:30'::timestamptz - interval '30 minutes') WHERE id = v_event_id;
  END IF;

  SELECT id INTO v_event_id FROM events WHERE code = 'F-16-WOMEN';
  IF FOUND THEN
    INSERT INTO event_rounds (event_id, round_type, sequence_number, status)
    VALUES (v_event_id, 'final', 3, 'pending') ON CONFLICT (event_id, sequence_number) DO NOTHING;
    UPDATE events SET start_date = '2025-03-15 14:30:00+05:30', event_time = '2025-03-15 14:30:00+05:30', call_room_time = ('2025-03-15 14:30:00+05:30'::timestamptz - interval '30 minutes') WHERE id = v_event_id;
  END IF;

  SELECT id INTO v_event_id FROM events WHERE code = 'T-10-WOMEN';
  IF FOUND THEN
    INSERT INTO event_rounds (event_id, round_type, sequence_number, status)
    VALUES (v_event_id, 'final', 3, 'pending') ON CONFLICT (event_id, sequence_number) DO NOTHING;
    UPDATE events SET start_date = '2025-03-15 14:45:00+05:30', event_time = '2025-03-15 14:45:00+05:30', call_room_time = ('2025-03-15 14:45:00+05:30'::timestamptz - interval '30 minutes') WHERE id = v_event_id;
  END IF;

  SELECT id INTO v_event_id FROM events WHERE code = 'T-10-MEN';
  IF FOUND THEN
    INSERT INTO event_rounds (event_id, round_type, sequence_number, status)
    VALUES (v_event_id, 'final', 3, 'pending') ON CONFLICT (event_id, sequence_number) DO NOTHING;
    UPDATE events SET start_date = '2025-03-15 14:55:00+05:30', event_time = '2025-03-15 14:55:00+05:30', call_room_time = ('2025-03-15 14:55:00+05:30'::timestamptz - interval '30 minutes') WHERE id = v_event_id;
  END IF;

  SELECT id INTO v_event_id FROM events WHERE code = 'R-20-MEN';
  IF FOUND THEN
    INSERT INTO event_rounds (event_id, round_type, sequence_number, status)
    VALUES (v_event_id, 'semi', 2, 'pending') ON CONFLICT (event_id, sequence_number) DO NOTHING;
  END IF;

  SELECT id INTO v_event_id FROM events WHERE code = 'R-20-WOMEN';
  IF FOUND THEN
    INSERT INTO event_rounds (event_id, round_type, sequence_number, status)
    VALUES (v_event_id, 'semi', 2, 'pending') ON CONFLICT (event_id, sequence_number) DO NOTHING;
  END IF;

  SELECT id INTO v_event_id FROM events WHERE code = 'T-4-MEN';
  IF FOUND THEN
    INSERT INTO event_rounds (event_id, round_type, sequence_number, status)
    VALUES (v_event_id, 'final', 3, 'pending') ON CONFLICT (event_id, sequence_number) DO NOTHING;
    UPDATE events SET start_date = '2025-03-15 15:40:00+05:30', event_time = '2025-03-15 15:40:00+05:30', call_room_time = ('2025-03-15 15:40:00+05:30'::timestamptz - interval '30 minutes') WHERE id = v_event_id;
  END IF;

  SELECT id INTO v_event_id FROM events WHERE code = 'T-4-WOMEN';
  IF FOUND THEN
    INSERT INTO event_rounds (event_id, round_type, sequence_number, status)
    VALUES (v_event_id, 'final', 3, 'pending') ON CONFLICT (event_id, sequence_number) DO NOTHING;
    UPDATE events SET start_date = '2025-03-15 15:50:00+05:30', event_time = '2025-03-15 15:50:00+05:30', call_room_time = ('2025-03-15 15:50:00+05:30'::timestamptz - interval '30 minutes') WHERE id = v_event_id;
  END IF;

  SELECT id INTO v_event_id FROM events WHERE code = 'R-20-MEN';
  IF FOUND THEN
    INSERT INTO event_rounds (event_id, round_type, sequence_number, status)
    VALUES (v_event_id, 'final', 3, 'pending') ON CONFLICT (event_id, sequence_number) DO NOTHING;
    UPDATE events SET start_date = '2025-03-15 16:00:00+05:30', event_time = '2025-03-15 16:00:00+05:30', call_room_time = ('2025-03-15 16:00:00+05:30'::timestamptz - interval '30 minutes') WHERE id = v_event_id;
  END IF;

  SELECT id INTO v_event_id FROM events WHERE code = 'R-20-WOMEN';
  IF FOUND THEN
    INSERT INTO event_rounds (event_id, round_type, sequence_number, status)
    VALUES (v_event_id, 'final', 3, 'pending') ON CONFLICT (event_id, sequence_number) DO NOTHING;
    UPDATE events SET start_date = '2025-03-15 16:15:00+05:30', event_time = '2025-03-15 16:15:00+05:30', call_room_time = ('2025-03-15 16:15:00+05:30'::timestamptz - interval '30 minutes') WHERE id = v_event_id;
  END IF;

  SELECT id INTO v_event_id FROM events WHERE code = 'T-19-MEN';
  IF FOUND THEN
    INSERT INTO event_rounds (event_id, round_type, sequence_number, status)
    VALUES (v_event_id, 'final', 3, 'pending') ON CONFLICT (event_id, sequence_number) DO NOTHING;
    UPDATE events SET start_date = '2025-03-16 06:00:00+05:30', event_time = '2025-03-16 06:00:00+05:30', call_room_time = ('2025-03-16 06:00:00+05:30'::timestamptz - interval '30 minutes') WHERE id = v_event_id;
  END IF;

  SELECT id INTO v_event_id FROM events WHERE code = 'T-19-WOMEN';
  IF FOUND THEN
    INSERT INTO event_rounds (event_id, round_type, sequence_number, status)
    VALUES (v_event_id, 'final', 3, 'pending') ON CONFLICT (event_id, sequence_number) DO NOTHING;
    UPDATE events SET start_date = '2025-03-16 06:15:00+05:30', event_time = '2025-03-16 06:15:00+05:30', call_room_time = ('2025-03-16 06:15:00+05:30'::timestamptz - interval '30 minutes') WHERE id = v_event_id;
  END IF;

  SELECT id INTO v_event_id FROM events WHERE code = 'T-3-MEN';
  IF FOUND THEN
    INSERT INTO event_rounds (event_id, round_type, sequence_number, status)
    VALUES (v_event_id, 'heat', 1, 'pending') ON CONFLICT (event_id, sequence_number) DO NOTHING;
  END IF;

  SELECT id INTO v_event_id FROM events WHERE code = 'F-12-MEN';
  IF FOUND THEN
    INSERT INTO event_rounds (event_id, round_type, sequence_number, status)
    VALUES (v_event_id, 'final', 3, 'pending') ON CONFLICT (event_id, sequence_number) DO NOTHING;
    UPDATE events SET start_date = '2025-03-16 08:00:00+05:30', event_time = '2025-03-16 08:00:00+05:30', call_room_time = ('2025-03-16 08:00:00+05:30'::timestamptz - interval '30 minutes') WHERE id = v_event_id;
  END IF;

  SELECT id INTO v_event_id FROM events WHERE code = 'T-3-WOMEN';
  IF FOUND THEN
    INSERT INTO event_rounds (event_id, round_type, sequence_number, status)
    VALUES (v_event_id, 'heat', 1, 'pending') ON CONFLICT (event_id, sequence_number) DO NOTHING;
  END IF;

  SELECT id INTO v_event_id FROM events WHERE code = 'C-24-MEN';
  IF FOUND THEN
    INSERT INTO event_rounds (event_id, round_type, sequence_number, status)
    VALUES (v_event_id, 'final', 3, 'pending') ON CONFLICT (event_id, sequence_number) DO NOTHING;
    UPDATE events SET start_date = '2025-03-16 08:50:00+05:30', event_time = '2025-03-16 08:50:00+05:30', call_room_time = ('2025-03-16 08:50:00+05:30'::timestamptz - interval '30 minutes') WHERE id = v_event_id;
  END IF;

  SELECT id INTO v_event_id FROM events WHERE code = 'F-17-WOMEN';
  IF FOUND THEN
    INSERT INTO event_rounds (event_id, round_type, sequence_number, status)
    VALUES (v_event_id, 'final', 3, 'pending') ON CONFLICT (event_id, sequence_number) DO NOTHING;
    UPDATE events SET start_date = '2025-03-16 08:50:00+05:30', event_time = '2025-03-16 08:50:00+05:30', call_room_time = ('2025-03-16 08:50:00+05:30'::timestamptz - interval '30 minutes') WHERE id = v_event_id;
  END IF;

  SELECT id INTO v_event_id FROM events WHERE code = 'T-1-WOMEN';
  IF FOUND THEN
    INSERT INTO event_rounds (event_id, round_type, sequence_number, status)
    VALUES (v_event_id, 'heat', 1, 'pending') ON CONFLICT (event_id, sequence_number) DO NOTHING;
  END IF;

  SELECT id INTO v_event_id FROM events WHERE code = 'T-1-MEN';
  IF FOUND THEN
    INSERT INTO event_rounds (event_id, round_type, sequence_number, status)
    VALUES (v_event_id, 'heat', 1, 'pending') ON CONFLICT (event_id, sequence_number) DO NOTHING;
  END IF;

  SELECT id INTO v_event_id FROM events WHERE code = 'C-24-MEN';
  IF FOUND THEN
    INSERT INTO event_rounds (event_id, round_type, sequence_number, status)
    VALUES (v_event_id, 'final', 3, 'pending') ON CONFLICT (event_id, sequence_number) DO NOTHING;
    UPDATE events SET start_date = '2025-03-16 09:45:00+05:30', event_time = '2025-03-16 09:45:00+05:30', call_room_time = ('2025-03-16 09:45:00+05:30'::timestamptz - interval '30 minutes') WHERE id = v_event_id;
  END IF;

  SELECT id INTO v_event_id FROM events WHERE code = 'C-25-WOMEN';
  IF FOUND THEN
    INSERT INTO event_rounds (event_id, round_type, sequence_number, status)
    VALUES (v_event_id, 'final', 3, 'pending') ON CONFLICT (event_id, sequence_number) DO NOTHING;
    UPDATE events SET start_date = '2025-03-16 10:00:00+05:30', event_time = '2025-03-16 10:00:00+05:30', call_room_time = ('2025-03-16 10:00:00+05:30'::timestamptz - interval '30 minutes') WHERE id = v_event_id;
  END IF;

  SELECT id INTO v_event_id FROM events WHERE code = 'T-9-WOMEN';
  IF FOUND THEN
    INSERT INTO event_rounds (event_id, round_type, sequence_number, status)
    VALUES (v_event_id, 'heat', 1, 'pending') ON CONFLICT (event_id, sequence_number) DO NOTHING;
  END IF;

  SELECT id INTO v_event_id FROM events WHERE code = 'T-5-MEN';
  IF FOUND THEN
    INSERT INTO event_rounds (event_id, round_type, sequence_number, status)
    VALUES (v_event_id, 'heat', 1, 'pending') ON CONFLICT (event_id, sequence_number) DO NOTHING;
  END IF;

  SELECT id INTO v_event_id FROM events WHERE code = 'T-5-WOMEN';
  IF FOUND THEN
    INSERT INTO event_rounds (event_id, round_type, sequence_number, status)
    VALUES (v_event_id, 'heat', 1, 'pending') ON CONFLICT (event_id, sequence_number) DO NOTHING;
  END IF;

  SELECT id INTO v_event_id FROM events WHERE code = 'C-24-MEN';
  IF FOUND THEN
    INSERT INTO event_rounds (event_id, round_type, sequence_number, status)
    VALUES (v_event_id, 'final', 3, 'pending') ON CONFLICT (event_id, sequence_number) DO NOTHING;
    UPDATE events SET start_date = '2025-03-16 11:00:00+05:30', event_time = '2025-03-16 11:00:00+05:30', call_room_time = ('2025-03-16 11:00:00+05:30'::timestamptz - interval '30 minutes') WHERE id = v_event_id;
  END IF;

  SELECT id INTO v_event_id FROM events WHERE code = 'C-25-WOMEN';
  IF FOUND THEN
    INSERT INTO event_rounds (event_id, round_type, sequence_number, status)
    VALUES (v_event_id, 'final', 3, 'pending') ON CONFLICT (event_id, sequence_number) DO NOTHING;
    UPDATE events SET start_date = '2025-03-16 11:00:00+05:30', event_time = '2025-03-16 11:00:00+05:30', call_room_time = ('2025-03-16 11:00:00+05:30'::timestamptz - interval '30 minutes') WHERE id = v_event_id;
  END IF;

  SELECT id INTO v_event_id FROM events WHERE code = 'T-1-MEN';
  IF FOUND THEN
    INSERT INTO event_rounds (event_id, round_type, sequence_number, status)
    VALUES (v_event_id, 'semi', 2, 'pending') ON CONFLICT (event_id, sequence_number) DO NOTHING;
  END IF;

  SELECT id INTO v_event_id FROM events WHERE code = 'T-1-WOMEN';
  IF FOUND THEN
    INSERT INTO event_rounds (event_id, round_type, sequence_number, status)
    VALUES (v_event_id, 'semi', 2, 'pending') ON CONFLICT (event_id, sequence_number) DO NOTHING;
  END IF;

  SELECT id INTO v_event_id FROM events WHERE code = 'T-9-WOMEN';
  IF FOUND THEN
    INSERT INTO event_rounds (event_id, round_type, sequence_number, status)
    VALUES (v_event_id, 'semi', 2, 'pending') ON CONFLICT (event_id, sequence_number) DO NOTHING;
  END IF;

  SELECT id INTO v_event_id FROM events WHERE code = 'R-22-MIXED';
  IF FOUND THEN
    INSERT INTO event_rounds (event_id, round_type, sequence_number, status)
    VALUES (v_event_id, 'heat', 1, 'pending') ON CONFLICT (event_id, sequence_number) DO NOTHING;
  END IF;

  SELECT id INTO v_event_id FROM events WHERE code = 'F-17-MEN';
  IF FOUND THEN
    INSERT INTO event_rounds (event_id, round_type, sequence_number, status)
    VALUES (v_event_id, 'final', 3, 'pending') ON CONFLICT (event_id, sequence_number) DO NOTHING;
    UPDATE events SET start_date = '2025-03-16 14:30:00+05:30', event_time = '2025-03-16 14:30:00+05:30', call_room_time = ('2025-03-16 14:30:00+05:30'::timestamptz - interval '30 minutes') WHERE id = v_event_id;
  END IF;

  SELECT id INTO v_event_id FROM events WHERE code = 'F-12-WOMEN';
  IF FOUND THEN
    INSERT INTO event_rounds (event_id, round_type, sequence_number, status)
    VALUES (v_event_id, 'final', 3, 'pending') ON CONFLICT (event_id, sequence_number) DO NOTHING;
    UPDATE events SET start_date = '2025-03-16 14:30:00+05:30', event_time = '2025-03-16 14:30:00+05:30', call_room_time = ('2025-03-16 14:30:00+05:30'::timestamptz - interval '30 minutes') WHERE id = v_event_id;
  END IF;

  SELECT id INTO v_event_id FROM events WHERE code = 'T-9-WOMEN';
  IF FOUND THEN
    INSERT INTO event_rounds (event_id, round_type, sequence_number, status)
    VALUES (v_event_id, 'final', 3, 'pending') ON CONFLICT (event_id, sequence_number) DO NOTHING;
    UPDATE events SET start_date = '2025-03-16 14:30:00+05:30', event_time = '2025-03-16 14:30:00+05:30', call_room_time = ('2025-03-16 14:30:00+05:30'::timestamptz - interval '30 minutes') WHERE id = v_event_id;
  END IF;

  SELECT id INTO v_event_id FROM events WHERE code = 'C-24-MEN';
  IF FOUND THEN
    INSERT INTO event_rounds (event_id, round_type, sequence_number, status)
    VALUES (v_event_id, 'final', 3, 'pending') ON CONFLICT (event_id, sequence_number) DO NOTHING;
    UPDATE events SET start_date = '2025-03-16 14:30:00+05:30', event_time = '2025-03-16 14:30:00+05:30', call_room_time = ('2025-03-16 14:30:00+05:30'::timestamptz - interval '30 minutes') WHERE id = v_event_id;
  END IF;

  SELECT id INTO v_event_id FROM events WHERE code = 'T-1-MEN';
  IF FOUND THEN
    INSERT INTO event_rounds (event_id, round_type, sequence_number, status)
    VALUES (v_event_id, 'final', 3, 'pending') ON CONFLICT (event_id, sequence_number) DO NOTHING;
    UPDATE events SET start_date = '2025-03-16 15:15:00+05:30', event_time = '2025-03-16 15:15:00+05:30', call_room_time = ('2025-03-16 15:15:00+05:30'::timestamptz - interval '30 minutes') WHERE id = v_event_id;
  END IF;

  SELECT id INTO v_event_id FROM events WHERE code = 'C-25-WOMEN';
  IF FOUND THEN
    INSERT INTO event_rounds (event_id, round_type, sequence_number, status)
    VALUES (v_event_id, 'final', 3, 'pending') ON CONFLICT (event_id, sequence_number) DO NOTHING;
    UPDATE events SET start_date = '2025-03-16 15:15:00+05:30', event_time = '2025-03-16 15:15:00+05:30', call_room_time = ('2025-03-16 15:15:00+05:30'::timestamptz - interval '30 minutes') WHERE id = v_event_id;
  END IF;

  SELECT id INTO v_event_id FROM events WHERE code = 'T-1-WOMEN';
  IF FOUND THEN
    INSERT INTO event_rounds (event_id, round_type, sequence_number, status)
    VALUES (v_event_id, 'final', 3, 'pending') ON CONFLICT (event_id, sequence_number) DO NOTHING;
    UPDATE events SET start_date = '2025-03-16 15:20:00+05:30', event_time = '2025-03-16 15:20:00+05:30', call_room_time = ('2025-03-16 15:20:00+05:30'::timestamptz - interval '30 minutes') WHERE id = v_event_id;
  END IF;

  SELECT id INTO v_event_id FROM events WHERE code = 'R-22-MIXED';
  IF FOUND THEN
    INSERT INTO event_rounds (event_id, round_type, sequence_number, status)
    VALUES (v_event_id, 'semi', 2, 'pending') ON CONFLICT (event_id, sequence_number) DO NOTHING;
  END IF;

  SELECT id INTO v_event_id FROM events WHERE code = 'C-25-WOMEN';
  IF FOUND THEN
    INSERT INTO event_rounds (event_id, round_type, sequence_number, status)
    VALUES (v_event_id, 'final', 3, 'pending') ON CONFLICT (event_id, sequence_number) DO NOTHING;
    UPDATE events SET start_date = '2025-03-16 16:30:00+05:30', event_time = '2025-03-16 16:30:00+05:30', call_room_time = ('2025-03-16 16:30:00+05:30'::timestamptz - interval '30 minutes') WHERE id = v_event_id;
  END IF;

  SELECT id INTO v_event_id FROM events WHERE code = 'R-20-MEN';
  IF FOUND THEN
    INSERT INTO event_rounds (event_id, round_type, sequence_number, status)
    VALUES (v_event_id, 'final', 3, 'pending') ON CONFLICT (event_id, sequence_number) DO NOTHING;
    UPDATE events SET start_date = '2025-03-16 16:45:00+05:30', event_time = '2025-03-16 16:45:00+05:30', call_room_time = ('2025-03-16 16:45:00+05:30'::timestamptz - interval '30 minutes') WHERE id = v_event_id;
  END IF;

  SELECT id INTO v_event_id FROM events WHERE code = 'R-22-MIXED';
  IF FOUND THEN
    INSERT INTO event_rounds (event_id, round_type, sequence_number, status)
    VALUES (v_event_id, 'final', 3, 'pending') ON CONFLICT (event_id, sequence_number) DO NOTHING;
    UPDATE events SET start_date = '2025-03-16 16:50:00+05:30', event_time = '2025-03-16 16:50:00+05:30', call_room_time = ('2025-03-16 16:50:00+05:30'::timestamptz - interval '30 minutes') WHERE id = v_event_id;
  END IF;

  SELECT id INTO v_event_id FROM events WHERE code = 'T-6-MEN';
  IF FOUND THEN
    INSERT INTO event_rounds (event_id, round_type, sequence_number, status)
    VALUES (v_event_id, 'final', 3, 'pending') ON CONFLICT (event_id, sequence_number) DO NOTHING;
    UPDATE events SET start_date = '2025-03-17 06:30:00+05:30', event_time = '2025-03-17 06:30:00+05:30', call_room_time = ('2025-03-17 06:30:00+05:30'::timestamptz - interval '30 minutes') WHERE id = v_event_id;
  END IF;

  SELECT id INTO v_event_id FROM events WHERE code = 'T-6-WOMEN';
  IF FOUND THEN
    INSERT INTO event_rounds (event_id, round_type, sequence_number, status)
    VALUES (v_event_id, 'final', 3, 'pending') ON CONFLICT (event_id, sequence_number) DO NOTHING;
    UPDATE events SET start_date = '2025-03-17 07:30:00+05:30', event_time = '2025-03-17 07:30:00+05:30', call_room_time = ('2025-03-17 07:30:00+05:30'::timestamptz - interval '30 minutes') WHERE id = v_event_id;
  END IF;

  SELECT id INTO v_event_id FROM events WHERE code = 'T-8-MEN';
  IF FOUND THEN
    INSERT INTO event_rounds (event_id, round_type, sequence_number, status)
    VALUES (v_event_id, 'heat', 1, 'pending') ON CONFLICT (event_id, sequence_number) DO NOTHING;
  END IF;

  SELECT id INTO v_event_id FROM events WHERE code = 'C-24-MEN';
  IF FOUND THEN
    INSERT INTO event_rounds (event_id, round_type, sequence_number, status)
    VALUES (v_event_id, 'final', 3, 'pending') ON CONFLICT (event_id, sequence_number) DO NOTHING;
    UPDATE events SET start_date = '2025-03-17 09:00:00+05:30', event_time = '2025-03-17 09:00:00+05:30', call_room_time = ('2025-03-17 09:00:00+05:30'::timestamptz - interval '30 minutes') WHERE id = v_event_id;
  END IF;

  SELECT id INTO v_event_id FROM events WHERE code = 'F-11-WOMEN';
  IF FOUND THEN
    INSERT INTO event_rounds (event_id, round_type, sequence_number, status)
    VALUES (v_event_id, 'final', 3, 'pending') ON CONFLICT (event_id, sequence_number) DO NOTHING;
    UPDATE events SET start_date = '2025-03-17 09:00:00+05:30', event_time = '2025-03-17 09:00:00+05:30', call_room_time = ('2025-03-17 09:00:00+05:30'::timestamptz - interval '30 minutes') WHERE id = v_event_id;
  END IF;

  SELECT id INTO v_event_id FROM events WHERE code = 'C-25-WOMEN';
  IF FOUND THEN
    INSERT INTO event_rounds (event_id, round_type, sequence_number, status)
    VALUES (v_event_id, 'final', 3, 'pending') ON CONFLICT (event_id, sequence_number) DO NOTHING;
    UPDATE events SET start_date = '2025-03-17 09:00:00+05:30', event_time = '2025-03-17 09:00:00+05:30', call_room_time = ('2025-03-17 09:00:00+05:30'::timestamptz - interval '30 minutes') WHERE id = v_event_id;
  END IF;

  SELECT id INTO v_event_id FROM events WHERE code = 'T-8-MEN';
  IF FOUND THEN
    INSERT INTO event_rounds (event_id, round_type, sequence_number, status)
    VALUES (v_event_id, 'semi', 2, 'pending') ON CONFLICT (event_id, sequence_number) DO NOTHING;
  END IF;

  SELECT id INTO v_event_id FROM events WHERE code = 'F-15-WOMEN';
  IF FOUND THEN
    INSERT INTO event_rounds (event_id, round_type, sequence_number, status)
    VALUES (v_event_id, 'final', 3, 'pending') ON CONFLICT (event_id, sequence_number) DO NOTHING;
    UPDATE events SET start_date = '2025-03-17 10:00:00+05:30', event_time = '2025-03-17 10:00:00+05:30', call_room_time = ('2025-03-17 10:00:00+05:30'::timestamptz - interval '30 minutes') WHERE id = v_event_id;
  END IF;

  SELECT id INTO v_event_id FROM events WHERE code = 'T-3-MEN';
  IF FOUND THEN
    INSERT INTO event_rounds (event_id, round_type, sequence_number, status)
    VALUES (v_event_id, 'semi', 2, 'pending') ON CONFLICT (event_id, sequence_number) DO NOTHING;
  END IF;

  SELECT id INTO v_event_id FROM events WHERE code = 'C-24-MEN';
  IF FOUND THEN
    INSERT INTO event_rounds (event_id, round_type, sequence_number, status)
    VALUES (v_event_id, 'final', 3, 'pending') ON CONFLICT (event_id, sequence_number) DO NOTHING;
    UPDATE events SET start_date = '2025-03-17 10:15:00+05:30', event_time = '2025-03-17 10:15:00+05:30', call_room_time = ('2025-03-17 10:15:00+05:30'::timestamptz - interval '30 minutes') WHERE id = v_event_id;
  END IF;

  SELECT id INTO v_event_id FROM events WHERE code = 'T-3-WOMEN';
  IF FOUND THEN
    INSERT INTO event_rounds (event_id, round_type, sequence_number, status)
    VALUES (v_event_id, 'semi', 2, 'pending') ON CONFLICT (event_id, sequence_number) DO NOTHING;
  END IF;

  SELECT id INTO v_event_id FROM events WHERE code = 'C-25-WOMEN';
  IF FOUND THEN
    INSERT INTO event_rounds (event_id, round_type, sequence_number, status)
    VALUES (v_event_id, 'final', 3, 'pending') ON CONFLICT (event_id, sequence_number) DO NOTHING;
    UPDATE events SET start_date = '2025-03-17 10:45:00+05:30', event_time = '2025-03-17 10:45:00+05:30', call_room_time = ('2025-03-17 10:45:00+05:30'::timestamptz - interval '30 minutes') WHERE id = v_event_id;
  END IF;

  SELECT id INTO v_event_id FROM events WHERE code = 'C-24-MEN';
  IF FOUND THEN
    INSERT INTO event_rounds (event_id, round_type, sequence_number, status)
    VALUES (v_event_id, 'final', 3, 'pending') ON CONFLICT (event_id, sequence_number) DO NOTHING;
    UPDATE events SET start_date = '2025-03-17 11:15:00+05:30', event_time = '2025-03-17 11:15:00+05:30', call_room_time = ('2025-03-17 11:15:00+05:30'::timestamptz - interval '30 minutes') WHERE id = v_event_id;
  END IF;

  SELECT id INTO v_event_id FROM events WHERE code = 'T-8-MEN';
  IF FOUND THEN
    INSERT INTO event_rounds (event_id, round_type, sequence_number, status)
    VALUES (v_event_id, 'final', 3, 'pending') ON CONFLICT (event_id, sequence_number) DO NOTHING;
    UPDATE events SET start_date = '2025-03-17 14:30:00+05:30', event_time = '2025-03-17 14:30:00+05:30', call_room_time = ('2025-03-17 14:30:00+05:30'::timestamptz - interval '30 minutes') WHERE id = v_event_id;
  END IF;

  SELECT id INTO v_event_id FROM events WHERE code = 'F-15-MEN';
  IF FOUND THEN
    INSERT INTO event_rounds (event_id, round_type, sequence_number, status)
    VALUES (v_event_id, 'final', 3, 'pending') ON CONFLICT (event_id, sequence_number) DO NOTHING;
    UPDATE events SET start_date = '2025-03-17 14:45:00+05:30', event_time = '2025-03-17 14:45:00+05:30', call_room_time = ('2025-03-17 14:45:00+05:30'::timestamptz - interval '30 minutes') WHERE id = v_event_id;
  END IF;

  SELECT id INTO v_event_id FROM events WHERE code = 'C-24-MEN';
  IF FOUND THEN
    INSERT INTO event_rounds (event_id, round_type, sequence_number, status)
    VALUES (v_event_id, 'final', 3, 'pending') ON CONFLICT (event_id, sequence_number) DO NOTHING;
    UPDATE events SET start_date = '2025-03-17 15:00:00+05:30', event_time = '2025-03-17 15:00:00+05:30', call_room_time = ('2025-03-17 15:00:00+05:30'::timestamptz - interval '30 minutes') WHERE id = v_event_id;
  END IF;

  SELECT id INTO v_event_id FROM events WHERE code = 'F-11-MEN';
  IF FOUND THEN
    INSERT INTO event_rounds (event_id, round_type, sequence_number, status)
    VALUES (v_event_id, 'final', 3, 'pending') ON CONFLICT (event_id, sequence_number) DO NOTHING;
    UPDATE events SET start_date = '2025-03-17 15:30:00+05:30', event_time = '2025-03-17 15:30:00+05:30', call_room_time = ('2025-03-17 15:30:00+05:30'::timestamptz - interval '30 minutes') WHERE id = v_event_id;
  END IF;

  SELECT id INTO v_event_id FROM events WHERE code = 'T-5-MEN';
  IF FOUND THEN
    INSERT INTO event_rounds (event_id, round_type, sequence_number, status)
    VALUES (v_event_id, 'final', 3, 'pending') ON CONFLICT (event_id, sequence_number) DO NOTHING;
    UPDATE events SET start_date = '2025-03-17 15:30:00+05:30', event_time = '2025-03-17 15:30:00+05:30', call_room_time = ('2025-03-17 15:30:00+05:30'::timestamptz - interval '30 minutes') WHERE id = v_event_id;
  END IF;

  SELECT id INTO v_event_id FROM events WHERE code = 'T-5-WOMEN';
  IF FOUND THEN
    INSERT INTO event_rounds (event_id, round_type, sequence_number, status)
    VALUES (v_event_id, 'final', 3, 'pending') ON CONFLICT (event_id, sequence_number) DO NOTHING;
    UPDATE events SET start_date = '2025-03-17 15:40:00+05:30', event_time = '2025-03-17 15:40:00+05:30', call_room_time = ('2025-03-17 15:40:00+05:30'::timestamptz - interval '30 minutes') WHERE id = v_event_id;
  END IF;

  SELECT id INTO v_event_id FROM events WHERE code = 'C-25-WOMEN';
  IF FOUND THEN
    INSERT INTO event_rounds (event_id, round_type, sequence_number, status)
    VALUES (v_event_id, 'final', 3, 'pending') ON CONFLICT (event_id, sequence_number) DO NOTHING;
    UPDATE events SET start_date = '2025-03-17 16:00:00+05:30', event_time = '2025-03-17 16:00:00+05:30', call_room_time = ('2025-03-17 16:00:00+05:30'::timestamptz - interval '30 minutes') WHERE id = v_event_id;
  END IF;

  SELECT id INTO v_event_id FROM events WHERE code = 'C-24-MEN';
  IF FOUND THEN
    INSERT INTO event_rounds (event_id, round_type, sequence_number, status)
    VALUES (v_event_id, 'final', 3, 'pending') ON CONFLICT (event_id, sequence_number) DO NOTHING;
    UPDATE events SET start_date = '2025-03-17 16:30:00+05:30', event_time = '2025-03-17 16:30:00+05:30', call_room_time = ('2025-03-17 16:30:00+05:30'::timestamptz - interval '30 minutes') WHERE id = v_event_id;
  END IF;

  SELECT id INTO v_event_id FROM events WHERE code = 'T-3-MEN';
  IF FOUND THEN
    INSERT INTO event_rounds (event_id, round_type, sequence_number, status)
    VALUES (v_event_id, 'final', 3, 'pending') ON CONFLICT (event_id, sequence_number) DO NOTHING;
    UPDATE events SET start_date = '2025-03-17 16:40:00+05:30', event_time = '2025-03-17 16:40:00+05:30', call_room_time = ('2025-03-17 16:40:00+05:30'::timestamptz - interval '30 minutes') WHERE id = v_event_id;
  END IF;

  SELECT id INTO v_event_id FROM events WHERE code = 'T-3-WOMEN';
  IF FOUND THEN
    INSERT INTO event_rounds (event_id, round_type, sequence_number, status)
    VALUES (v_event_id, 'final', 3, 'pending') ON CONFLICT (event_id, sequence_number) DO NOTHING;
    UPDATE events SET start_date = '2025-03-17 16:45:00+05:30', event_time = '2025-03-17 16:45:00+05:30', call_room_time = ('2025-03-17 16:45:00+05:30'::timestamptz - interval '30 minutes') WHERE id = v_event_id;
  END IF;

  SELECT id INTO v_event_id FROM events WHERE code = 'T-23-MEN';
  IF FOUND THEN
    INSERT INTO event_rounds (event_id, round_type, sequence_number, status)
    VALUES (v_event_id, 'final', 3, 'pending') ON CONFLICT (event_id, sequence_number) DO NOTHING;
    UPDATE events SET start_date = '2025-03-18 06:00:00+05:30', event_time = '2025-03-18 06:00:00+05:30', call_room_time = ('2025-03-18 06:00:00+05:30'::timestamptz - interval '30 minutes') WHERE id = v_event_id;
  END IF;

  SELECT id INTO v_event_id FROM events WHERE code = 'T-23-WOMEN';
  IF FOUND THEN
    INSERT INTO event_rounds (event_id, round_type, sequence_number, status)
    VALUES (v_event_id, 'final', 3, 'pending') ON CONFLICT (event_id, sequence_number) DO NOTHING;
    UPDATE events SET start_date = '2025-03-18 06:10:00+05:30', event_time = '2025-03-18 06:10:00+05:30', call_room_time = ('2025-03-18 06:10:00+05:30'::timestamptz - interval '30 minutes') WHERE id = v_event_id;
  END IF;

  SELECT id INTO v_event_id FROM events WHERE code = 'F-14-MEN';
  IF FOUND THEN
    INSERT INTO event_rounds (event_id, round_type, sequence_number, status)
    VALUES (v_event_id, 'final', 3, 'pending') ON CONFLICT (event_id, sequence_number) DO NOTHING;
    UPDATE events SET start_date = '2025-03-18 07:00:00+05:30', event_time = '2025-03-18 07:00:00+05:30', call_room_time = ('2025-03-18 07:00:00+05:30'::timestamptz - interval '30 minutes') WHERE id = v_event_id;
  END IF;

  SELECT id INTO v_event_id FROM events WHERE code = 'F-18-MEN';
  IF FOUND THEN
    INSERT INTO event_rounds (event_id, round_type, sequence_number, status)
    VALUES (v_event_id, 'final', 3, 'pending') ON CONFLICT (event_id, sequence_number) DO NOTHING;
    UPDATE events SET start_date = '2025-03-18 07:15:00+05:30', event_time = '2025-03-18 07:15:00+05:30', call_room_time = ('2025-03-18 07:15:00+05:30'::timestamptz - interval '30 minutes') WHERE id = v_event_id;
  END IF;

  SELECT id INTO v_event_id FROM events WHERE code = 'T-2-MEN';
  IF FOUND THEN
    INSERT INTO event_rounds (event_id, round_type, sequence_number, status)
    VALUES (v_event_id, 'heat', 1, 'pending') ON CONFLICT (event_id, sequence_number) DO NOTHING;
  END IF;

  SELECT id INTO v_event_id FROM events WHERE code = 'T-2-WOMEN';
  IF FOUND THEN
    INSERT INTO event_rounds (event_id, round_type, sequence_number, status)
    VALUES (v_event_id, 'heat', 1, 'pending') ON CONFLICT (event_id, sequence_number) DO NOTHING;
  END IF;

  SELECT id INTO v_event_id FROM events WHERE code = 'F-18-WOMEN';
  IF FOUND THEN
    INSERT INTO event_rounds (event_id, round_type, sequence_number, status)
    VALUES (v_event_id, 'final', 3, 'pending') ON CONFLICT (event_id, sequence_number) DO NOTHING;
    UPDATE events SET start_date = '2025-03-18 08:45:00+05:30', event_time = '2025-03-18 08:45:00+05:30', call_room_time = ('2025-03-18 08:45:00+05:30'::timestamptz - interval '30 minutes') WHERE id = v_event_id;
  END IF;

  SELECT id INTO v_event_id FROM events WHERE code = 'F-14-WOMEN';
  IF FOUND THEN
    INSERT INTO event_rounds (event_id, round_type, sequence_number, status)
    VALUES (v_event_id, 'final', 3, 'pending') ON CONFLICT (event_id, sequence_number) DO NOTHING;
    UPDATE events SET start_date = '2025-03-18 09:00:00+05:30', event_time = '2025-03-18 09:00:00+05:30', call_room_time = ('2025-03-18 09:00:00+05:30'::timestamptz - interval '30 minutes') WHERE id = v_event_id;
  END IF;

  SELECT id INTO v_event_id FROM events WHERE code = 'R-21-MEN';
  IF FOUND THEN
    INSERT INTO event_rounds (event_id, round_type, sequence_number, status)
    VALUES (v_event_id, 'heat', 1, 'pending') ON CONFLICT (event_id, sequence_number) DO NOTHING;
  END IF;

  SELECT id INTO v_event_id FROM events WHERE code = 'R-21-WOMEN';
  IF FOUND THEN
    INSERT INTO event_rounds (event_id, round_type, sequence_number, status)
    VALUES (v_event_id, 'heat', 1, 'pending') ON CONFLICT (event_id, sequence_number) DO NOTHING;
  END IF;

  SELECT id INTO v_event_id FROM events WHERE code = 'T-2-MEN';
  IF FOUND THEN
    INSERT INTO event_rounds (event_id, round_type, sequence_number, status)
    VALUES (v_event_id, 'semi', 2, 'pending') ON CONFLICT (event_id, sequence_number) DO NOTHING;
  END IF;

  SELECT id INTO v_event_id FROM events WHERE code = 'T-2-WOMEN';
  IF FOUND THEN
    INSERT INTO event_rounds (event_id, round_type, sequence_number, status)
    VALUES (v_event_id, 'semi', 2, 'pending') ON CONFLICT (event_id, sequence_number) DO NOTHING;
  END IF;

  SELECT id INTO v_event_id FROM events WHERE code = 'R-21-MEN';
  IF FOUND THEN
    INSERT INTO event_rounds (event_id, round_type, sequence_number, status)
    VALUES (v_event_id, 'semi', 2, 'pending') ON CONFLICT (event_id, sequence_number) DO NOTHING;
  END IF;

  SELECT id INTO v_event_id FROM events WHERE code = 'R-21-WOMEN';
  IF FOUND THEN
    INSERT INTO event_rounds (event_id, round_type, sequence_number, status)
    VALUES (v_event_id, 'semi', 2, 'pending') ON CONFLICT (event_id, sequence_number) DO NOTHING;
  END IF;

  SELECT id INTO v_event_id FROM events WHERE code = 'T-2-MEN';
  IF FOUND THEN
    INSERT INTO event_rounds (event_id, round_type, sequence_number, status)
    VALUES (v_event_id, 'final', 3, 'pending') ON CONFLICT (event_id, sequence_number) DO NOTHING;
    UPDATE events SET start_date = '2025-03-18 12:00:00+05:30', event_time = '2025-03-18 12:00:00+05:30', call_room_time = ('2025-03-18 12:00:00+05:30'::timestamptz - interval '30 minutes') WHERE id = v_event_id;
  END IF;

  SELECT id INTO v_event_id FROM events WHERE code = 'T-2-WOMEN';
  IF FOUND THEN
    INSERT INTO event_rounds (event_id, round_type, sequence_number, status)
    VALUES (v_event_id, 'final', 3, 'pending') ON CONFLICT (event_id, sequence_number) DO NOTHING;
    UPDATE events SET start_date = '2025-03-18 12:15:00+05:30', event_time = '2025-03-18 12:15:00+05:30', call_room_time = ('2025-03-18 12:15:00+05:30'::timestamptz - interval '30 minutes') WHERE id = v_event_id;
  END IF;

  SELECT id INTO v_event_id FROM events WHERE code = 'R-21-MEN';
  IF FOUND THEN
    INSERT INTO event_rounds (event_id, round_type, sequence_number, status)
    VALUES (v_event_id, 'final', 3, 'pending') ON CONFLICT (event_id, sequence_number) DO NOTHING;
    UPDATE events SET start_date = '2025-03-18 12:30:00+05:30', event_time = '2025-03-18 12:30:00+05:30', call_room_time = ('2025-03-18 12:30:00+05:30'::timestamptz - interval '30 minutes') WHERE id = v_event_id;
  END IF;

  SELECT id INTO v_event_id FROM events WHERE code = 'R-21-WOMEN';
  IF FOUND THEN
    INSERT INTO event_rounds (event_id, round_type, sequence_number, status)
    VALUES (v_event_id, 'final', 3, 'pending') ON CONFLICT (event_id, sequence_number) DO NOTHING;
    UPDATE events SET start_date = '2025-03-18 12:45:00+05:30', event_time = '2025-03-18 12:45:00+05:30', call_room_time = ('2025-03-18 12:45:00+05:30'::timestamptz - interval '30 minutes') WHERE id = v_event_id;
  END IF;

END $$;

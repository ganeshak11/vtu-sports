-- ==============================================================================
-- VTU SPORTSOS &bull; STRICT RELAY QUOTA ENFORCEMENT & DATA PURGE
-- Enforces absolute max 4 relay athletes per college per gender
-- ==============================================================================

BEGIN;

-- 1. PURGE EXCESS RELAY PROFILES
-- For each college and gender, keep the first 4 athletes with is_relay = true;
-- Set is_relay = false for the 5th and subsequent athletes.
WITH ranked_profiles AS (
  SELECT id,
         ROW_NUMBER() OVER (
           PARTITION BY college_name, gender 
           ORDER BY bib_number ASC NULLS LAST, created_at ASC
         ) as rn
  FROM profiles
  WHERE is_relay = true
)
UPDATE profiles p
SET is_relay = false
FROM ranked_profiles rp
WHERE p.id = rp.id AND rp.rn > 4;

-- 2. PURGE EXCESS RELAY EVENT REGISTRATIONS
-- For each relay event and college, delete any registrations beyond 4 runners
WITH ranked_registrations AS (
  SELECT er.id,
         ROW_NUMBER() OVER (
           PARTITION BY er.event_id, p.college_name 
           ORDER BY p.is_relay DESC, er.created_at ASC
         ) as rn
  FROM event_registrations er
  JOIN events e ON e.id = er.event_id
  JOIN profiles p ON p.id = er.athlete_id
  WHERE e.category = 'relay'
)
DELETE FROM event_registrations
WHERE id IN (
  SELECT id FROM ranked_registrations WHERE rn > 4
);

-- 3. PURGE EXCESS RELAY EVENT RESULTS
-- For each relay event, round, and college, keep at most 4 athlete results
WITH ranked_results AS (
  SELECT er.id,
         ROW_NUMBER() OVER (
           PARTITION BY er.event_id, er.round_id, p.college_name 
           ORDER BY er.rank ASC NULLS LAST, er.id ASC
         ) as rn
  FROM event_results er
  JOIN events e ON e.id = er.event_id
  JOIN profiles p ON p.id = er.profile_id
  WHERE e.category = 'relay'
)
DELETE FROM event_results
WHERE id IN (
  SELECT id FROM ranked_results WHERE rn > 4
);

-- 4. CREATE DATABASE TRIGGER FUNCTION ON PROFILES
CREATE OR REPLACE FUNCTION trg_enforce_profiles_relay_limit()
RETURNS TRIGGER AS $$
DECLARE
  v_count INT;
  v_college VARCHAR;
BEGIN
  IF NEW.is_relay = true THEN
    v_college := COALESCE(NEW.college_name, (SELECT name FROM colleges WHERE id = NEW.college_id));
    
    SELECT COUNT(*) INTO v_count
    FROM profiles
    WHERE is_relay = true
      AND gender = NEW.gender
      AND (
        (NEW.college_name IS NOT NULL AND college_name = NEW.college_name) OR
        (NEW.college_id IS NOT NULL AND college_id = NEW.college_id)
      )
      AND (TG_OP = 'INSERT' OR id != NEW.id);

    IF v_count >= 4 THEN
      RAISE EXCEPTION 'STRICT RELAY LIMIT VIOLATION: College "%" already has % relay athletes registered for gender "%". Maximum allowed quota is 4 students.',
        v_college, v_count, NEW.gender;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS enforce_profiles_relay_limit ON profiles;
CREATE TRIGGER enforce_profiles_relay_limit
BEFORE INSERT OR UPDATE OF is_relay, gender, college_name, college_id
ON profiles
FOR EACH ROW
EXECUTE FUNCTION trg_enforce_profiles_relay_limit();

-- 5. CREATE DATABASE TRIGGER FUNCTION ON EVENT_REGISTRATIONS
CREATE OR REPLACE FUNCTION trg_enforce_event_registrations_relay_limit()
RETURNS TRIGGER AS $$
DECLARE
  v_is_relay BOOLEAN;
  v_college_name VARCHAR;
  v_college_id UUID;
  v_count INT;
BEGIN
  -- Check if the target event is a relay
  SELECT (category = 'relay') INTO v_is_relay
  FROM events
  WHERE id = NEW.event_id;

  IF v_is_relay = true THEN
    -- Get the athlete's college
    SELECT college_name, college_id INTO v_college_name, v_college_id
    FROM profiles
    WHERE id = NEW.athlete_id;

    -- Count existing athletes from this college in this relay event
    SELECT COUNT(*) INTO v_count
    FROM event_registrations er
    JOIN profiles p ON p.id = er.athlete_id
    WHERE er.event_id = NEW.event_id
      AND (
        (v_college_name IS NOT NULL AND p.college_name = v_college_name) OR
        (v_college_id IS NOT NULL AND p.college_id = v_college_id)
      )
      AND (TG_OP = 'INSERT' OR er.id != NEW.id);

    IF v_count >= 4 THEN
      RAISE EXCEPTION 'STRICT RELAY LIMIT VIOLATION: College "%" already has % athletes registered in this relay event. Maximum allowed quota is 4 students per college squad.',
        COALESCE(v_college_name, v_college_id::text), v_count;
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS enforce_event_registrations_relay_limit ON event_registrations;
CREATE TRIGGER enforce_event_registrations_relay_limit
BEFORE INSERT OR UPDATE OF athlete_id, event_id
ON event_registrations
FOR EACH ROW
EXECUTE FUNCTION trg_enforce_event_registrations_relay_limit();

-- 6. CREATE DATABASE TRIGGER FUNCTION ON EVENT_RESULTS
CREATE OR REPLACE FUNCTION trg_enforce_event_results_relay_limit()
RETURNS TRIGGER AS $$
DECLARE
  v_is_relay BOOLEAN;
  v_college_name VARCHAR;
  v_college_id UUID;
  v_count INT;
BEGIN
  -- Check if event is relay
  SELECT (category = 'relay') INTO v_is_relay
  FROM events
  WHERE id = NEW.event_id;

  IF v_is_relay = true THEN
    SELECT college_name, college_id INTO v_college_name, v_college_id
    FROM profiles
    WHERE id = NEW.profile_id;

    SELECT COUNT(*) INTO v_count
    FROM event_results er
    JOIN profiles p ON p.id = er.profile_id
    WHERE er.event_id = NEW.event_id
      AND er.round_id = NEW.round_id
      AND (
        (v_college_name IS NOT NULL AND p.college_name = v_college_name) OR
        (v_college_id IS NOT NULL AND p.college_id = v_college_id)
      )
      AND (TG_OP = 'INSERT' OR er.id != NEW.id);

    IF v_count >= 4 THEN
      RAISE EXCEPTION 'STRICT RELAY LIMIT VIOLATION: College "%" already has % athletes in this relay round result. Maximum allowed is 4 students per squad.',
        COALESCE(v_college_name, v_college_id::text), v_count;
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS enforce_event_results_relay_limit ON event_results;
CREATE TRIGGER enforce_event_results_relay_limit
BEFORE INSERT OR UPDATE OF profile_id, event_id, round_id
ON event_results
FOR EACH ROW
EXECUTE FUNCTION trg_enforce_event_results_relay_limit();

COMMIT;

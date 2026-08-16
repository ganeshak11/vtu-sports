CREATE OR REPLACE FUNCTION assign_accommodation(
  p_athlete_id UUID,
  p_accommodation_id UUID,
  p_room_number TEXT
) RETURNS JSONB AS $$
DECLARE
  v_athlete_gender TEXT;
  v_acc_gender TEXT;
  v_acc_capacity INT;
  v_acc_occupancy INT;
  v_old_acc_id UUID;
BEGIN
  -- 1. Lock the new accommodation row for update to prevent concurrent race conditions
  SELECT capacity, current_occupancy, gender_allowed 
  INTO v_acc_capacity, v_acc_occupancy, v_acc_gender
  FROM accommodations
  WHERE id = p_accommodation_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Accommodation not found.');
  END IF;

  -- 2. Fetch athlete info and old assignment
  SELECT gender, accommodation_id 
  INTO v_athlete_gender, v_old_acc_id
  FROM profiles
  WHERE id = p_athlete_id;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Athlete not found.');
  END IF;

  -- 3. Check Gender Rule
  IF v_acc_gender != 'mixed' AND v_athlete_gender != v_acc_gender THEN
    RETURN jsonb_build_object(
      'success', false, 
      'error', 'Gender mismatch. This hostel is restricted to ' || v_acc_gender || ' only.'
    );
  END IF;

  -- 4. If re-assigning to the SAME accommodation, just update room number and exit
  IF v_old_acc_id = p_accommodation_id THEN
    UPDATE profiles 
    SET room_number = p_room_number 
    WHERE id = p_athlete_id;
    
    RETURN jsonb_build_object('success', true);
  END IF;

  -- 5. Check Capacity Rule (only needed if moving to a new accommodation)
  IF v_acc_occupancy >= v_acc_capacity THEN
    RETURN jsonb_build_object('success', false, 'error', 'Accommodation is full.');
  END IF;

  -- 6. Perform the Assignment
  -- Decrement old accommodation if it exists
  IF v_old_acc_id IS NOT NULL THEN
    UPDATE accommodations 
    SET current_occupancy = GREATEST(current_occupancy - 1, 0)
    WHERE id = v_old_acc_id;
  END IF;

  -- Increment new accommodation
  UPDATE accommodations 
  SET current_occupancy = current_occupancy + 1
  WHERE id = p_accommodation_id;

  -- Update athlete profile
  UPDATE profiles 
  SET accommodation_id = p_accommodation_id,
      room_number = p_room_number
  WHERE id = p_athlete_id;

  RETURN jsonb_build_object('success', true);
END;
$$ LANGUAGE plpgsql;

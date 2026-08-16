-- Add gender_allowed column to accommodations
ALTER TABLE accommodations ADD COLUMN IF NOT EXISTS gender_allowed VARCHAR(20) DEFAULT 'mixed';

-- Update the existing mock hostels from migration 0006
UPDATE accommodations 
SET gender_allowed = 'men' 
WHERE name = 'Boys Hostel A';

UPDATE accommodations 
SET gender_allowed = 'women' 
WHERE name = 'Girls Hostel B';

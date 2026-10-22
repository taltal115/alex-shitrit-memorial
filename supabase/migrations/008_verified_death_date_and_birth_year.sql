-- Add birth year field (year only, no day/month required)
ALTER TABLE memorial
ADD COLUMN birth_year INTEGER;

-- Update memorial with verified death date and birth year
UPDATE memorial
SET 
  hebrew_death_date_day = 9,
  hebrew_death_date_month = 'Cheshvan',
  hebrew_death_date_year = 5781,
  death_date_verified = true,
  death_date_verified_at = NOW(),
  death_time_relative_to_sunset = 'before_sunset',
  birth_year = 1950,
  hebrew_name = 'אלכס שטרית בן פורטונה ומכלוף ז״ל',
  gregorian_death_date = '2020-10-27'
WHERE english_name = 'Alex Shitrit';

-- Verify the update
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM memorial 
    WHERE english_name = 'Alex Shitrit' 
    AND death_date_verified = true
    AND hebrew_death_date_day = 9
  ) THEN
    RAISE EXCEPTION 'Failed to update memorial with verified death date';
  END IF;
END $$;

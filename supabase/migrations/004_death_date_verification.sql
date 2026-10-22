-- Add death date verification fields to memorial table
-- This allows admins to configure the Hebrew death date via CMS

ALTER TABLE memorial ADD COLUMN IF NOT EXISTS death_time_relative_to_sunset TEXT 
  CHECK (death_time_relative_to_sunset IN ('pending', 'before_sunset', 'after_sunset'))
  DEFAULT 'pending';

-- Store both candidate Hebrew dates (before and after sunset)
ALTER TABLE memorial ADD COLUMN IF NOT EXISTS hebrew_date_before_sunset_day INTEGER;
ALTER TABLE memorial ADD COLUMN IF NOT EXISTS hebrew_date_before_sunset_month TEXT;
ALTER TABLE memorial ADD COLUMN IF NOT EXISTS hebrew_date_before_sunset_year INTEGER;

ALTER TABLE memorial ADD COLUMN IF NOT EXISTS hebrew_date_after_sunset_day INTEGER;
ALTER TABLE memorial ADD COLUMN IF NOT EXISTS hebrew_date_after_sunset_month TEXT;
ALTER TABLE memorial ADD COLUMN IF NOT EXISTS hebrew_date_after_sunset_year INTEGER;

-- Add verification timestamp and admin who verified
ALTER TABLE memorial ADD COLUMN IF NOT EXISTS death_date_verified_at TIMESTAMPTZ;
ALTER TABLE memorial ADD COLUMN IF NOT EXISTS death_date_verified_by UUID REFERENCES auth.users(id);

-- Update existing memorial with both candidate dates for Oct 27, 2020
UPDATE memorial 
SET 
  death_time_relative_to_sunset = 'pending',
  hebrew_date_before_sunset_day = 9,
  hebrew_date_before_sunset_month = 'Cheshvan',
  hebrew_date_before_sunset_year = 5781,
  hebrew_date_after_sunset_day = 10,
  hebrew_date_after_sunset_month = 'Cheshvan',
  hebrew_date_after_sunset_year = 5781,
  death_date_verified = false
WHERE english_name = 'Alex Shitrit';

-- Add helpful comment
COMMENT ON COLUMN memorial.death_time_relative_to_sunset IS 
  'Whether death occurred before or after sunset on the Gregorian date. Determines which Hebrew date applies.';

COMMENT ON COLUMN memorial.hebrew_date_before_sunset_day IS 
  'Hebrew date if death was BEFORE sunset (typically the expected date)';

COMMENT ON COLUMN memorial.hebrew_date_after_sunset_day IS 
  'Hebrew date if death was AFTER sunset (next Hebrew day)';

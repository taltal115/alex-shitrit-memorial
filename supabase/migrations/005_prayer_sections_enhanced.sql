-- Enhanced prayer sections table to support detailed prayer content with verses
-- Add columns for section_id, source_url, verses, and verification_status

-- Add new columns to prayer_section table
ALTER TABLE prayer_section 
  ADD COLUMN section_id TEXT NOT NULL DEFAULT '',
  ADD COLUMN source_url TEXT,
  ADD COLUMN verses JSONB,
  ADD COLUMN verification_status TEXT NOT NULL DEFAULT 'pending_family_verification' 
    CHECK (verification_status IN ('pending_family_verification', 'verified', 'rejected')),
  ADD COLUMN verified_by UUID REFERENCES auth.users(id),
  ADD COLUMN verified_at TIMESTAMPTZ;

-- Create index for section_id lookups
CREATE INDEX idx_prayer_section_id ON prayer_section(memorial_id, section_id);

-- Create index for verification status
CREATE INDEX idx_prayer_verification_status ON prayer_section(memorial_id, verification_status);

-- Migrate existing is_verified boolean to new verification_status
UPDATE prayer_section 
SET verification_status = CASE 
  WHEN is_verified = true THEN 'verified'
  ELSE 'pending_family_verification'
END;

-- Backfill unique section_id values for existing rows with empty string
-- This ensures the unique constraint can be added successfully
UPDATE prayer_section 
SET section_id = 'section-' || id::text
WHERE section_id = '';

-- Add unique constraint on section_id per memorial
ALTER TABLE prayer_section 
  ADD CONSTRAINT unique_section_per_memorial UNIQUE(memorial_id, section_id);

-- Add comment explaining the verification_status field
COMMENT ON COLUMN prayer_section.verification_status IS 'Status of prayer section: pending_family_verification (default), verified (approved by admin), rejected';

-- Add database support for SHOW_PENDING_SECTIONS_PUBLICLY config
-- This allows RLS policies to respect the setting, not just client-side filtering

-- Create app_config table for site-wide settings
CREATE TABLE IF NOT EXISTS app_config (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  description TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_by UUID REFERENCES auth.users(id)
);

-- Enable RLS on app_config
ALTER TABLE app_config ENABLE ROW LEVEL SECURITY;

-- app_config is readable by everyone, writable only by super_admins
CREATE POLICY "Config is publicly readable"
  ON app_config FOR SELECT
  USING (true);

CREATE POLICY "Config writable by super admins only"
  ON app_config FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_membership
      WHERE user_id = auth.uid()
        AND role = 'super_admin'
    )
  );

-- Insert default config
INSERT INTO app_config (key, value, description)
VALUES (
  'show_pending_prayers_publicly',
  'false'::jsonb,
  'Whether to show pending prayer sections to public (not just admins)'
)
ON CONFLICT (key) DO NOTHING;

-- Helper function to check if prayer section should be visible
CREATE OR REPLACE FUNCTION should_show_prayer_section(
  p_is_verified BOOLEAN,
  p_verification_status TEXT,
  p_user_id UUID
)
RETURNS BOOLEAN AS $$
DECLARE
  show_pending BOOLEAN;
  is_admin BOOLEAN;
BEGIN
  -- Always show verified sections
  IF p_is_verified THEN
    RETURN true;
  END IF;
  
  -- Never show rejected sections to public
  IF p_verification_status = 'rejected' THEN
    -- Only admins can see rejected sections
    IF p_user_id IS NULL THEN
      RETURN false;
    END IF;
    
    SELECT EXISTS (
      SELECT 1 FROM user_membership
      WHERE user_id = p_user_id
        AND role IN ('content_manager', 'super_admin')
    ) INTO is_admin;
    
    RETURN is_admin;
  END IF;
  
  -- For pending sections, check the config
  SELECT (value::text::boolean) INTO show_pending
  FROM app_config
  WHERE key = 'show_pending_prayers_publicly';
  
  -- If config says show pending, then show
  IF show_pending THEN
    RETURN true;
  END IF;
  
  -- Otherwise, only show to admins
  IF p_user_id IS NULL THEN
    RETURN false;
  END IF;
  
  SELECT EXISTS (
    SELECT 1 FROM user_membership
    WHERE user_id = p_user_id
      AND role IN ('content_manager', 'super_admin')
  ) INTO is_admin;
  
  RETURN is_admin;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE
SET search_path = public, pg_temp;

-- Update prayer_section SELECT policy to use the helper
DROP POLICY IF EXISTS "Verified prayers are publicly readable" ON prayer_section;
DROP POLICY IF EXISTS "All prayers readable by admins" ON prayer_section;
DROP POLICY IF EXISTS "Prayer sections are publicly readable" ON prayer_section;

CREATE POLICY "Prayer sections visibility"
  ON prayer_section FOR SELECT
  USING (
    should_show_prayer_section(
      is_verified,
      verification_status,
      auth.uid()
    )
  );

-- Add updated_at trigger for app_config
CREATE OR REPLACE FUNCTION update_app_config_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  NEW.updated_by = auth.uid();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER app_config_updated_at
  BEFORE UPDATE ON app_config
  FOR EACH ROW
  EXECUTE FUNCTION update_app_config_updated_at();

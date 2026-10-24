-- Fix user_membership RLS to avoid recursion
-- Replace policies that query user_membership with SECURITY DEFINER helpers

-- Drop existing policies on user_membership
DROP POLICY IF EXISTS "Memberships readable by user or admins" ON user_membership;
DROP POLICY IF EXISTS "Memberships writable by super admins" ON user_membership;

-- Create SECURITY DEFINER helpers that bypass RLS
-- These functions will not trigger RLS when they query user_membership

CREATE OR REPLACE FUNCTION can_read_membership(
  p_user_id UUID,
  p_membership_user_id UUID,
  p_memorial_id UUID
)
RETURNS BOOLEAN AS $$
BEGIN
  -- User can read their own membership
  IF p_user_id = p_membership_user_id THEN
    RETURN true;
  END IF;
  
  -- Super admins can read any membership for their memorial
  RETURN EXISTS (
    SELECT 1 FROM user_membership
    WHERE user_id = p_user_id
      AND memorial_id = p_memorial_id
      AND role = 'super_admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE
SET search_path = public, pg_temp;

CREATE OR REPLACE FUNCTION can_write_membership(
  p_user_id UUID,
  p_memorial_id UUID
)
RETURNS BOOLEAN AS $$
BEGIN
  -- Only super admins can write memberships
  RETURN EXISTS (
    SELECT 1 FROM user_membership
    WHERE user_id = p_user_id
      AND memorial_id = p_memorial_id
      AND role = 'super_admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE
SET search_path = public, pg_temp;

-- Create new policies using the SECURITY DEFINER helpers
CREATE POLICY "Memberships readable by user or admins"
  ON user_membership FOR SELECT
  USING (can_read_membership(auth.uid(), user_id, memorial_id));

CREATE POLICY "Memberships writable by super admins"
  ON user_membership FOR ALL
  USING (can_write_membership(auth.uid(), memorial_id));

-- Verify policies are correct
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'user_membership'
    AND policyname = 'Memberships readable by user or admins'
  ) THEN
    RAISE EXCEPTION 'user_membership SELECT policy not created';
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'user_membership'
    AND policyname = 'Memberships writable by super admins'
  ) THEN
    RAISE EXCEPTION 'user_membership ALL policy not created';
  END IF;
END $$;

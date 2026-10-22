-- Fix approval_record and audit_log RLS policies
-- Issue: INSERT policies use USING instead of WITH CHECK
-- This allows any authenticated user to insert before the check runs

-- Fix approval_record INSERT policy
-- Use actual policy name from database
DROP POLICY IF EXISTS "Approval records insertable by admins" ON approval_record;

CREATE POLICY "Approval records insertable by admins"
  ON approval_record FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_membership
      WHERE user_id = auth.uid()
        AND role IN ('content_manager', 'super_admin')
    )
  );

-- Fix audit_log INSERT policy
-- Use actual policy name from database  
DROP POLICY IF EXISTS "Audit log insertable by authenticated users" ON audit_log;

CREATE POLICY "Audit log insertable by super admins only"
  ON audit_log FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_membership
      WHERE user_id = auth.uid()
        AND role = 'super_admin'
    )
  );

-- Verify policies are correct
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'approval_record'
    AND policyname = 'Approval records insertable by admins'
  ) THEN
    RAISE EXCEPTION 'approval_record INSERT policy not created';
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'audit_log'
    AND policyname = 'Audit log insertable by super admins only'
  ) THEN
    RAISE EXCEPTION 'audit_log INSERT policy not created';
  END IF;
END $$;

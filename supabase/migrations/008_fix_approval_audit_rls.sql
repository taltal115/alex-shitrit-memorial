-- Fix approval_record and audit_log RLS policies
-- Issue: INSERT policies use USING instead of WITH CHECK
-- This allows any authenticated user to insert before the check runs

-- Fix approval_record INSERT policy
DROP POLICY IF EXISTS "approval_record_insert" ON approval_record;

CREATE POLICY "approval_record_insert"
  ON approval_record FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_membership
      WHERE user_id = auth.uid()
        AND role IN ('content_manager', 'super_admin')
    )
  );

-- Fix audit_log INSERT policy  
DROP POLICY IF EXISTS "audit_log_insert" ON audit_log;

CREATE POLICY "audit_log_insert"
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
    AND policyname = 'approval_record_insert'
  ) THEN
    RAISE EXCEPTION 'approval_record_insert policy not created';
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'audit_log'
    AND policyname = 'audit_log_insert'
  ) THEN
    RAISE EXCEPTION 'audit_log_insert policy not created';
  END IF;
END $$;

-- Stub auth schema for migration testing
-- This allows migrations to run without full Supabase Auth

CREATE SCHEMA IF NOT EXISTS auth;

-- Create minimal users table
CREATE TABLE IF NOT EXISTS auth.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Stub auth.uid() function
CREATE OR REPLACE FUNCTION auth.uid()
RETURNS UUID AS $$
  SELECT '00000000-0000-0000-0000-000000000000'::UUID;
$$ LANGUAGE sql STABLE;

-- Create a test user
INSERT INTO auth.users (id, email) 
VALUES ('00000000-0000-0000-0000-000000000000', 'test@example.com')
ON CONFLICT (id) DO NOTHING;

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Memorial table: core information about the deceased
CREATE TABLE memorial (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  hebrew_name TEXT NOT NULL,
  english_name TEXT NOT NULL,
  hebrew_death_date_day INTEGER,
  hebrew_death_date_month TEXT,
  hebrew_death_date_year INTEGER,
  gregorian_death_date DATE NOT NULL,
  death_date_verified BOOLEAN NOT NULL DEFAULT FALSE,
  portrait_url TEXT,
  quote TEXT,
  intro_text TEXT
);

-- Timeline events: life story chapters and milestones
CREATE TABLE timeline_event (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  memorial_id UUID NOT NULL REFERENCES memorial(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  date_hebrew TEXT,
  date_gregorian DATE,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_published BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE INDEX idx_timeline_event_memorial ON timeline_event(memorial_id);
CREATE INDEX idx_timeline_event_sort ON timeline_event(memorial_id, sort_order);

-- Stories: memories shared by family and friends
CREATE TABLE story (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  memorial_id UUID NOT NULL REFERENCES memorial(id) ON DELETE CASCADE,
  author_name TEXT NOT NULL,
  author_relation TEXT NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  approval_status TEXT NOT NULL DEFAULT 'pending' CHECK (approval_status IN ('pending', 'approved', 'rejected')),
  submitted_by UUID REFERENCES auth.users(id),
  approved_by UUID REFERENCES auth.users(id),
  approved_at TIMESTAMPTZ
);

CREATE INDEX idx_story_memorial ON story(memorial_id);
CREATE INDEX idx_story_status ON story(memorial_id, approval_status);

-- Albums: photo/video collections by category
CREATE TABLE album (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  memorial_id UUID NOT NULL REFERENCES memorial(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_published BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE INDEX idx_album_memorial ON album(memorial_id);
CREATE INDEX idx_album_sort ON album(memorial_id, sort_order);

-- Media assets: photos, videos, audio recordings
CREATE TABLE media_asset (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  memorial_id UUID NOT NULL REFERENCES memorial(id) ON DELETE CASCADE,
  album_id UUID REFERENCES album(id) ON DELETE SET NULL,
  story_id UUID REFERENCES story(id) ON DELETE SET NULL,
  file_path TEXT NOT NULL,
  file_type TEXT NOT NULL CHECK (file_type IN ('image', 'video', 'audio')),
  file_size BIGINT NOT NULL,
  caption TEXT,
  date_taken DATE,
  people_tagged TEXT[],
  approval_status TEXT NOT NULL DEFAULT 'pending' CHECK (approval_status IN ('pending', 'approved', 'rejected')),
  uploaded_by UUID REFERENCES auth.users(id),
  approved_by UUID REFERENCES auth.users(id),
  approved_at TIMESTAMPTZ
);

CREATE INDEX idx_media_memorial ON media_asset(memorial_id);
CREATE INDEX idx_media_album ON media_asset(album_id);
CREATE INDEX idx_media_story ON media_asset(story_id);
CREATE INDEX idx_media_status ON media_asset(memorial_id, approval_status);

-- User profiles: extended user information
CREATE TABLE user_profile (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  email TEXT NOT NULL UNIQUE,
  display_name TEXT,
  relation_to_deceased TEXT,
  avatar_url TEXT
);

-- User memberships: roles and permissions per memorial
CREATE TABLE user_membership (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  memorial_id UUID NOT NULL REFERENCES memorial(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('visitor', 'registered', 'content_manager', 'super_admin')),
  granted_by UUID REFERENCES auth.users(id),
  granted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, memorial_id)
);

CREATE INDEX idx_membership_user ON user_membership(user_id);
CREATE INDEX idx_membership_memorial ON user_membership(memorial_id);

-- Prayer sections: verified prayer texts
CREATE TABLE prayer_section (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  memorial_id UUID NOT NULL REFERENCES memorial(id) ON DELETE CASCADE,
  section_order INTEGER NOT NULL,
  title TEXT NOT NULL,
  hebrew_text TEXT NOT NULL,
  notes TEXT,
  is_verified BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE INDEX idx_prayer_memorial ON prayer_section(memorial_id);
CREATE INDEX idx_prayer_order ON prayer_section(memorial_id, section_order);

-- Memorial schedule: yearly azkara event details
CREATE TABLE memorial_schedule (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  memorial_id UUID NOT NULL REFERENCES memorial(id) ON DELETE CASCADE,
  year INTEGER NOT NULL,
  hebrew_date_day INTEGER NOT NULL,
  hebrew_date_month TEXT NOT NULL,
  hebrew_date_year INTEGER NOT NULL,
  gregorian_date DATE NOT NULL,
  gathering_time TEXT,
  prayers_time TEXT,
  grave_visit_time TEXT,
  meal_time TEXT,
  location_notes TEXT,
  UNIQUE(memorial_id, year)
);

CREATE INDEX idx_schedule_memorial ON memorial_schedule(memorial_id);
CREATE INDEX idx_schedule_year ON memorial_schedule(memorial_id, year);

-- Approval records: audit trail for content moderation
CREATE TABLE approval_record (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  content_type TEXT NOT NULL CHECK (content_type IN ('story', 'media_asset')),
  content_id UUID NOT NULL,
  previous_status TEXT NOT NULL,
  new_status TEXT NOT NULL,
  approved_by UUID NOT NULL REFERENCES auth.users(id),
  notes TEXT
);

CREATE INDEX idx_approval_content ON approval_record(content_type, content_id);
CREATE INDEX idx_approval_user ON approval_record(approved_by);

-- Audit log: all admin actions
CREATE TABLE audit_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id TEXT NOT NULL,
  changes JSONB,
  ip_address TEXT
);

CREATE INDEX idx_audit_user ON audit_log(user_id);
CREATE INDEX idx_audit_resource ON audit_log(resource_type, resource_id);
CREATE INDEX idx_audit_created ON audit_log(created_at DESC);

-- Consent records: track user consent for content usage
CREATE TABLE consent_record (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  content_type TEXT NOT NULL,
  content_id UUID NOT NULL,
  consent_given BOOLEAN NOT NULL,
  consent_details JSONB
);

CREATE INDEX idx_consent_user ON consent_record(user_id);
CREATE INDEX idx_consent_content ON consent_record(content_type, content_id);

-- Update timestamp trigger function
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add update triggers
CREATE TRIGGER update_memorial_updated_at BEFORE UPDATE ON memorial
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_timeline_event_updated_at BEFORE UPDATE ON timeline_event
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_story_updated_at BEFORE UPDATE ON story
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_album_updated_at BEFORE UPDATE ON album
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_media_asset_updated_at BEFORE UPDATE ON media_asset
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_user_profile_updated_at BEFORE UPDATE ON user_profile
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_user_membership_updated_at BEFORE UPDATE ON user_membership
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_prayer_section_updated_at BEFORE UPDATE ON prayer_section
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_memorial_schedule_updated_at BEFORE UPDATE ON memorial_schedule
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_consent_record_updated_at BEFORE UPDATE ON consent_record
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

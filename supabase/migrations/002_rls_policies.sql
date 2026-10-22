-- Enable Row Level Security on all tables
ALTER TABLE memorial ENABLE ROW LEVEL SECURITY;
ALTER TABLE timeline_event ENABLE ROW LEVEL SECURITY;
ALTER TABLE story ENABLE ROW LEVEL SECURITY;
ALTER TABLE album ENABLE ROW LEVEL SECURITY;
ALTER TABLE media_asset ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profile ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_membership ENABLE ROW LEVEL SECURITY;
ALTER TABLE prayer_section ENABLE ROW LEVEL SECURITY;
ALTER TABLE memorial_schedule ENABLE ROW LEVEL SECURITY;
ALTER TABLE approval_record ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE consent_record ENABLE ROW LEVEL SECURITY;

-- Helper function to check user role
CREATE OR REPLACE FUNCTION get_user_role(user_uuid UUID, memorial_uuid UUID)
RETURNS TEXT AS $$
  SELECT role FROM user_membership
  WHERE user_id = user_uuid AND memorial_id = memorial_uuid
  LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER;

-- Helper function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin(user_uuid UUID, memorial_uuid UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM user_membership
    WHERE user_id = user_uuid
      AND memorial_id = memorial_uuid
      AND role IN ('content_manager', 'super_admin')
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- Memorial policies: public read, admin write
CREATE POLICY "Memorial is publicly readable"
  ON memorial FOR SELECT
  USING (true);

CREATE POLICY "Memorial is writable by super admins"
  ON memorial FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_membership
      WHERE user_id = auth.uid()
        AND memorial_id = memorial.id
        AND role = 'super_admin'
    )
  );

-- Timeline event policies: public read if published, admin write
CREATE POLICY "Published timeline events are publicly readable"
  ON timeline_event FOR SELECT
  USING (is_published = true);

CREATE POLICY "All timeline events readable by admins"
  ON timeline_event FOR SELECT
  USING (is_admin(auth.uid(), memorial_id));

CREATE POLICY "Timeline events writable by content managers"
  ON timeline_event FOR ALL
  USING (is_admin(auth.uid(), memorial_id));

-- Story policies: public read if approved, registered users can submit
CREATE POLICY "Approved stories are publicly readable"
  ON story FOR SELECT
  USING (approval_status = 'approved');

CREATE POLICY "Users can view their own submissions"
  ON story FOR SELECT
  USING (submitted_by = auth.uid());

CREATE POLICY "All stories readable by admins"
  ON story FOR SELECT
  USING (is_admin(auth.uid(), memorial_id));

CREATE POLICY "Registered users can submit stories"
  ON story FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL
    AND submitted_by = auth.uid()
    AND approval_status = 'pending'
  );

CREATE POLICY "Users can update their pending stories"
  ON story FOR UPDATE
  USING (submitted_by = auth.uid() AND approval_status = 'pending')
  WITH CHECK (submitted_by = auth.uid());

CREATE POLICY "Content managers can moderate stories"
  ON story FOR UPDATE
  USING (is_admin(auth.uid(), memorial_id));

-- Album policies: public read if published, admin write
CREATE POLICY "Published albums are publicly readable"
  ON album FOR SELECT
  USING (is_published = true);

CREATE POLICY "All albums readable by admins"
  ON album FOR SELECT
  USING (is_admin(auth.uid(), memorial_id));

CREATE POLICY "Albums writable by content managers"
  ON album FOR ALL
  USING (is_admin(auth.uid(), memorial_id));

-- Media asset policies: public read if approved, registered users can upload
CREATE POLICY "Approved media in published albums is publicly readable"
  ON media_asset FOR SELECT
  USING (
    approval_status = 'approved'
    AND (
      album_id IS NULL
      OR EXISTS (
        SELECT 1 FROM album
        WHERE album.id = media_asset.album_id
          AND album.is_published = true
      )
    )
  );

CREATE POLICY "Users can view their own uploads"
  ON media_asset FOR SELECT
  USING (uploaded_by = auth.uid());

CREATE POLICY "All media readable by admins"
  ON media_asset FOR SELECT
  USING (is_admin(auth.uid(), memorial_id));

CREATE POLICY "Registered users can upload media"
  ON media_asset FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL
    AND uploaded_by = auth.uid()
    AND approval_status = 'pending'
  );

CREATE POLICY "Content managers can moderate media"
  ON media_asset FOR UPDATE
  USING (is_admin(auth.uid(), memorial_id));

CREATE POLICY "Content managers can delete media"
  ON media_asset FOR DELETE
  USING (is_admin(auth.uid(), memorial_id));

-- User profile policies: users can read all, write own
CREATE POLICY "User profiles are publicly readable"
  ON user_profile FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own profile"
  ON user_profile FOR INSERT
  WITH CHECK (id = auth.uid());

CREATE POLICY "Users can update their own profile"
  ON user_profile FOR UPDATE
  USING (id = auth.uid());

-- User membership policies: admins only
CREATE POLICY "Memberships readable by user or admins"
  ON user_membership FOR SELECT
  USING (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM user_membership um
      WHERE um.user_id = auth.uid()
        AND um.memorial_id = user_membership.memorial_id
        AND um.role = 'super_admin'
    )
  );

CREATE POLICY "Memberships writable by super admins"
  ON user_membership FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_membership
      WHERE user_id = auth.uid()
        AND memorial_id = user_membership.memorial_id
        AND role = 'super_admin'
    )
  );

-- Prayer section policies: public read if verified, admin write
CREATE POLICY "Verified prayers are publicly readable"
  ON prayer_section FOR SELECT
  USING (is_verified = true);

CREATE POLICY "All prayers readable by admins"
  ON prayer_section FOR SELECT
  USING (is_admin(auth.uid(), memorial_id));

CREATE POLICY "Prayers writable by super admins"
  ON prayer_section FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_membership
      WHERE user_id = auth.uid()
        AND memorial_id = prayer_section.memorial_id
        AND role = 'super_admin'
    )
  );

-- Memorial schedule policies: public read, admin write
CREATE POLICY "Memorial schedule is publicly readable"
  ON memorial_schedule FOR SELECT
  USING (true);

CREATE POLICY "Schedule writable by content managers"
  ON memorial_schedule FOR ALL
  USING (is_admin(auth.uid(), memorial_id));

-- Approval record policies: admin only
CREATE POLICY "Approval records readable by admins"
  ON approval_record FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_membership um
      INNER JOIN story s ON (s.memorial_id = um.memorial_id AND s.id::text = approval_record.content_id::text)
      OR
      EXISTS (
        SELECT 1 FROM media_asset m
        WHERE m.memorial_id = um.memorial_id AND m.id::text = approval_record.content_id::text
      )
      WHERE um.user_id = auth.uid() AND um.role IN ('content_manager', 'super_admin')
    )
  );

CREATE POLICY "Approval records insertable by admins"
  ON approval_record FOR INSERT
  WITH CHECK (approved_by = auth.uid());

-- Audit log policies: admin read only
CREATE POLICY "Audit log readable by super admins"
  ON audit_log FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_membership
      WHERE user_id = auth.uid()
        AND role = 'super_admin'
    )
  );

CREATE POLICY "Audit log insertable by authenticated users"
  ON audit_log FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Consent record policies: user and admin access
CREATE POLICY "Users can view their own consent records"
  ON consent_record FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Super admins can view all consent records"
  ON consent_record FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_membership
      WHERE user_id = auth.uid()
        AND role = 'super_admin'
    )
  );

CREATE POLICY "Users can manage their own consent"
  ON consent_record FOR ALL
  USING (user_id = auth.uid());

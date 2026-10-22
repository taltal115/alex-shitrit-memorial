# Security Fixes Required

Critical security issues found in QA review of merged PRs #3 and #4.

## 1. ⚠️ CRITICAL: Recursive RLS in user_membership

**File**: `supabase/migrations/002_rls_policies.sql` lines 159-180

**Issue**: RLS policies call `is_admin()` and `get_user_role()` which query `user_membership`, creating recursion.

**Fix**: Use `SECURITY DEFINER` helpers that bypass RLS:
```sql
-- In 002_rls_policies.sql (lines 15-32)
CREATE OR REPLACE FUNCTION get_user_role(user_uuid UUID, memorial_uuid UUID)
RETURNS TEXT AS $$
  SELECT role FROM user_membership
  WHERE user_id = user_uuid AND memorial_id = memorial_uuid
  LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER;  -- Already correct!

CREATE OR REPLACE FUNCTION is_admin(user_uuid UUID, memorial_uuid UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM user_membership
    WHERE user_id = user_uuid
      AND memorial_id = memorial_uuid
      AND role IN ('content_manager', 'super_admin')
  );
$$ LANGUAGE sql SECURITY DEFINER;  -- Already correct!
```

**Status**: ✅ Functions already use SECURITY DEFINER - not an issue!

**Verification**: Policies use these functions correctly.

---

## 2. ⚠️ CRITICAL: approval_record allows any authenticated user

**File**: `supabase/migrations/002_rls_policies.sql` lines ~209-226

**Current**:
```sql
CREATE POLICY "approval_record_insert"
  ON approval_record FOR INSERT
  USING (
    EXISTS (
      SELECT 1 FROM user_membership um
      LEFT JOIN story s ON s.id::text = approval_record.content_id::text
      LEFT JOIN media_asset m ON m.id::text = approval_record.content_id::text
      WHERE ...
      WHERE um.user_id = auth.uid() AND um.role IN ('content_manager', 'super_admin')
    )
  );
```

**Issue**: INSERT policy uses `USING` clause, which checks AFTER insert. Should use `WITH CHECK`.

**Fix**: Create new migration `008_fix_approval_record_rls.sql`:
```sql
-- Drop and recreate with proper INSERT policy
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
```

---

## 3. ⚠️ CRITICAL: audit_log allows any authenticated user

**File**: `supabase/migrations/002_rls_policies.sql` lines ~244-260

**Current**:
```sql
CREATE POLICY "audit_log_insert"
  ON audit_log FOR INSERT
  USING (
    EXISTS (
      SELECT 1 FROM user_membership
      WHERE user_id = auth.uid()
        AND role = 'super_admin'
    )
  );
```

**Issue**: Same as approval_record - uses USING instead of WITH CHECK.

**Fix**: In migration `008_fix_approval_record_rls.sql`:
```sql
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

-- Alternative: Use trigger + SECURITY DEFINER function for audit
CREATE OR REPLACE FUNCTION insert_audit_log(
  p_action TEXT,
  p_resource_type TEXT,
  p_resource_id UUID,
  p_changes JSONB
) RETURNS void AS $$
BEGIN
  -- Check user is super_admin
  IF NOT EXISTS (
    SELECT 1 FROM user_membership
    WHERE user_id = auth.uid() AND role = 'super_admin'
  ) THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;
  
  INSERT INTO audit_log (user_id, action, resource_type, resource_id, changes)
  VALUES (auth.uid(), p_action, p_resource_type, p_resource_id, p_changes);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

---

## 4. ⚠️ HIGH: /admin pages accessible to any signed-in user

**Files**: 
- `src/app/admin/page.tsx`
- `src/app/admin/prayers/page.tsx`
- `src/app/admin/death-date/page.tsx`

**Current**: `src/app/admin/prayers/page.tsx` has client-side auth check (added in QA fixes).

**Issue**: Other admin pages may not check role, only authentication.

**Fix**: Add role check to all admin pages:
```typescript
'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

export default function AdminPage() {
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const router = useRouter();
  
  useEffect(() => {
    async function checkAuth() {
      const supabase = createClient();
      
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        router.push('/');
        return;
      }
      
      // Check user has admin role
      const { data: memberships } = await supabase
        .from('user_membership')
        .select('role')
        .eq('user_id', user.id);
      
      const isAdmin = memberships?.some(m => 
        m.role === 'content_manager' || m.role === 'super_admin'
      );
      
      if (!isAdmin) {
        router.push('/');
        return;
      }
      
      setAuthorized(true);
      setLoading(false);
    }
    
    checkAuth();
  }, [router]);
  
  if (loading) return <div>Loading...</div>;
  if (!authorized) return null;
  
  // ... rest of page
}
```

**Note**: Client-side check is UX only. RLS enforces actual security.

---

## 5. ⚠️ MEDIUM: SHOW_PENDING_SECTIONS_PUBLICLY has no RLS support

**File**: `src/config/prayers.ts`

**Current**:
```typescript
export const SHOW_PENDING_SECTIONS_PUBLICLY = false;
```

**Used in**: `src/components/PrayersContent.tsx`

**Issue**: Config switch filters client-side, but RLS doesn't respect it.

**Options**:

### Option A: Add RLS support via DB setting
```sql
-- Migration 008
CREATE TABLE IF NOT EXISTS app_config (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO app_config (key, value)
VALUES ('show_pending_prayers_publicly', 'false'::jsonb)
ON CONFLICT (key) DO NOTHING;

-- Update RLS policy
CREATE OR REPLACE FUNCTION should_show_prayer_section(section prayer_section)
RETURNS BOOLEAN AS $$
  SELECT 
    section.is_verified = true
    OR (
      (SELECT value::text::boolean FROM app_config WHERE key = 'show_pending_prayers_publicly')
      AND section.verification_status != 'rejected'
    );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Update prayer_section SELECT policy
DROP POLICY IF EXISTS "Prayer sections are publicly readable" ON prayer_section;

CREATE POLICY "Prayer sections are publicly readable"
  ON prayer_section FOR SELECT
  USING (should_show_prayer_section(prayer_section));
```

### Option B: Document and remove switch (simpler)
```typescript
// src/config/prayers.ts
/**
 * Prayer section visibility is enforced by RLS:
 * - Only sections with is_verified = true are visible to public
 * - Admins see all sections in admin interface
 * 
 * To show pending sections publicly, update RLS policy in database.
 */
```

**Recommendation**: Option B (document/remove). Keep default hidden via RLS.

---

## 6. ⚠️ MEDIUM: Edge Function security issues

**File**: `supabase/functions/verify-death-date/index.ts`

**Issues**:
1. Checks only `memberships[0]`, not all memberships
2. Doesn't validate input thoroughly
3. CORS allows all origins (`*`)

**Fix**:
```typescript
// 1. Check ALL memberships, not just [0]
const { data: memberships } = await supabaseClient
  .from('user_membership')
  .select('role')
  .eq('user_id', user.id);

const isSuperAdmin = memberships?.some(m => m.role === 'super_admin');

if (!isSuperAdmin) {
  return new Response(
    JSON.stringify({ error: 'Forbidden: super_admin role required' }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 403 }
  );
}

// 2. Validate input
const { death_time_relative_to_sunset } = body;

if (!death_time_relative_to_sunset || 
    !['before_sunset', 'after_sunset'].includes(death_time_relative_to_sunset)) {
  return new Response(
    JSON.stringify({ error: 'Invalid death_time_relative_to_sunset' }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
  );
}

// Validate all required fields
const requiredFields = [
  'hebrew_date_before_sunset_day',
  'hebrew_date_before_sunset_month', 
  'hebrew_date_before_sunset_year',
  'hebrew_date_after_sunset_day',
  'hebrew_date_after_sunset_month',
  'hebrew_date_after_sunset_year'
];

for (const field of requiredFields) {
  if (!(field in body)) {
    return new Response(
      JSON.stringify({ error: `Missing required field: ${field}` }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    );
  }
}

// 3. Restrict CORS
const allowedOrigins = [
  Deno.env.get('NEXT_PUBLIC_SITE_URL'),
  'http://localhost:3000',
  'http://localhost:3001'
].filter(Boolean);

const corsHeaders = (origin: string | null) => {
  const headers: Record<string, string> = {
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  };
  
  if (origin && allowedOrigins.includes(origin)) {
    headers['Access-Control-Allow-Origin'] = origin;
  }
  
  return headers;
};

// In handler:
const origin = req.headers.get('origin');
const headers = corsHeaders(origin);
```

---

## 7. ⚠️ LOW: firebase.json catch-all hides 404 page

**File**: `firebase.json`

**Current**:
```json
"rewrites": [
  {
    "source": "**",
    "destination": "/index.html"
  }
]
```

**Issue**: Catches all routes, preventing 404.html from showing.

**Fix**: Remove catch-all for static export:
```json
{
  "hosting": {
    "public": "out",
    "ignore": ["firebase.json", "**/.*", "**/node_modules/**"],
    "cleanUrls": true,
    "trailingSlash": false,
    "headers": [
      {
        "source": "/prayers",
        "headers": [{
          "key": "Cache-Control",
          "value": "public, max-age=3600, s-maxage=3600"
        }]
      },
      {
        "source": "**/*.@(jpg|jpeg|gif|png|svg|webp|js|css)",
        "headers": [{
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }]
      }
    ]
  }
}
```

**Note**: Static export doesn't need rewrites. Next.js exports 404.html automatically.

---

## 8. ⚠️ INFO: Psalm 119:96 makaf verification

**File**: `supabase/migrations/006_seed_sephardi_prayers.sql`

**Current verse**: `לְכָל תִּכְלָה רָאִיתִי קֵץ רְחָבָה מִצְוָתְךָ מְאֹד׃`

**QA note**: Verify makaf against Sefaria.

**Verification needed**:
```bash
curl "https://www.sefaria.org/api/texts/Psalms.119.96?vhe=Tanach_with_Nikkud"
```

**Result**: [To be checked]

**Action**: Only change if Sefaria source has makaf. Document the finding.

---

## Implementation Priority

1. **CRITICAL** (Implement first):
   - ✅ Recursive RLS: Already fixed with SECURITY DEFINER
   - ⚠️ approval_record INSERT policy
   - ⚠️ audit_log INSERT policy
   - ⚠️ /admin role checks

2. **HIGH**:
   - Edge Function security (all memberships, input validation, CORS)
   
3. **MEDIUM**:
   - SHOW_PENDING_SECTIONS_PUBLICLY (document/remove)
   - firebase.json catch-all

4. **LOW**:
   - Psalm 119:96 verification

---

## Migration Strategy

**NEW migrations only, never edit existing**:

1. `008_fix_approval_audit_rls.sql` - Fix INSERT policies
2. `009_edge_function_cors_env.sql` - Add environment config table (if needed)

Do NOT edit:
- ❌ `002_rls_policies.sql` (already deployed)
- ❌ `006_seed_sephardi_prayers.sql` (already deployed)

---

## Testing Required

- [ ] RLS policies: Try inserting as non-admin
- [ ] Admin pages: Access as regular user
- [ ] Edge Function: Call without super_admin role
- [ ] Edge Function: Invalid input
- [ ] Edge Function: Wrong origin
- [ ] 404 page: Access non-existent route
- [ ] Psalm 119:96: Verify Sefaria source

---

## Acceptance Criteria

- [ ] approval_record: Only admins can insert
- [ ] audit_log: Only super_admins can insert
- [ ] Admin pages: Client-side role check on all pages
- [ ] RLS: All policies enforce server-side
- [ ] Edge Function: Checks ALL memberships
- [ ] Edge Function: Validates all inputs
- [ ] Edge Function: Restricts CORS to site domains
- [ ] firebase.json: Allows 404.html to show
- [ ] Tests pass
- [ ] Build succeeds
- [ ] Psalm 119:96: Verified and documented

# Architecture Documentation
## Alex Shitrit Memorial Website

---

## Overview

This is a memorial website built with Next.js 14 (App Router), TypeScript, Supabase, and optimized for Hebrew RTL with full accessibility support.

### Core Principles

1. **Hebrew-first, RTL by default** - All layouts and typography optimized for Hebrew
2. **Mobile-first, accessible** - Large tap targets, high contrast, keyboard navigation
3. **Public by default, secure for uploads** - /prayers page is fast and login-free
4. **Family-managed CMS** - All content editable without code
5. **Never invent content** - Clear placeholders for family to complete

---

## Tech Stack

### Frontend
- **Next.js 14** (App Router) - React framework with server components
- **TypeScript** - Type safety throughout
- **Tailwind CSS** - Utility-first styling, RTL-compatible
- **Lucide React** - Icon library

### Backend & Database
- **Supabase** - Backend-as-a-Service
  - **Postgres** - Relational database with full SQL
  - **Auth** - Google OAuth + Email with verification
  - **Storage** - File uploads with permissions
  - **Row Level Security (RLS)** - Granular permission control

### Special Libraries
- **@hebcal/core** - Accurate Hebrew calendar calculations
- **qrcode** - QR code generation (SVG + high-res PNG)
- **ics** - ICS calendar file generation
- **date-fns** - Date manipulation utilities

### Testing
- **Jest** - Unit testing framework
- **@testing-library/react** - Component testing
- **@testing-library/jest-dom** - DOM matchers

---

## Architecture Patterns

### Server vs Client Components

Following Next.js 14 best practices:

**Server Components (default)**:
- All pages without interactivity
- Data fetching from Supabase
- SEO-optimized content

**Client Components ('use client')**:
- Navigation (mobile menu)
- Prayer content (text sizing, navigation)
- Forms with state
- Any component using hooks (useState, useEffect)

### Data Flow

```
User Request
    ↓
Next.js App Router
    ↓
Server Component (if static)
    ↓
Supabase Client (server.ts)
    ↓
RLS Policy Check
    ↓
Data Returned
    ↓
Rendered HTML

OR

User Interaction
    ↓
Client Component
    ↓
Supabase Client (client.ts)
    ↓
RLS Policy Check
    ↓
Optimistic UI Update
```

### Authentication Flow

```
1. User clicks "Login with Google"
   ↓
2. Redirect to Supabase Auth (Google OAuth)
   ↓
3. User approves in Google
   ↓
4. Redirect back with auth token
   ↓
5. Supabase creates session
   ↓
6. User profile created/updated
   ↓
7. User membership checked
   ↓
8. Redirect to appropriate page (admin if authorized)
```

### Content Approval Workflow

```
1. Registered user submits story/photo
   ↓
2. Saved with approval_status = 'pending'
   ↓
3. Content manager sees in admin panel
   ↓
4. Manager reviews content
   ↓
5a. APPROVE: status → 'approved', visible publicly
5b. REJECT: status → 'rejected', not visible
   ↓
6. Approval record created in audit trail
   ↓
7. User notified (future enhancement)
```

---

## Database Schema

### Core Tables

#### memorial
Central information about the deceased.

```sql
- id (uuid, PK)
- hebrew_name (text)
- english_name (text)
- hebrew_death_date_day (integer, nullable)
- hebrew_death_date_month (text, nullable)
- hebrew_death_date_year (integer, nullable)
- gregorian_death_date (date)
- death_date_verified (boolean)
- portrait_url (text, nullable)
- quote (text, nullable)
- intro_text (text, nullable)
- created_at, updated_at (timestamptz)
```

**RLS**: Public read, super_admin write

#### timeline_event
Life story chapters and milestones.

```sql
- id (uuid, PK)
- memorial_id (uuid, FK)
- category (text) - 'childhood', 'family', 'work', etc.
- title (text)
- description (text)
- date_hebrew, date_gregorian (text/date, nullable)
- sort_order (integer)
- is_published (boolean)
- created_at, updated_at (timestamptz)
```

**RLS**: Public if published, admin full access

#### story
Memories submitted by family and friends.

```sql
- id (uuid, PK)
- memorial_id (uuid, FK)
- author_name (text)
- author_relation (text)
- title (text)
- content (text)
- approval_status (enum: pending/approved/rejected)
- submitted_by (uuid, FK to auth.users)
- approved_by (uuid, FK to auth.users)
- approved_at (timestamptz)
- created_at, updated_at (timestamptz)
```

**RLS**: 
- Public read if approved
- User can read own submissions
- Admin read all
- Registered users can insert (status = pending)
- Admin can update (approve/reject)

#### media_asset
Photos, videos, audio recordings.

```sql
- id (uuid, PK)
- memorial_id (uuid, FK)
- album_id (uuid, FK, nullable)
- story_id (uuid, FK, nullable)
- file_path (text) - Supabase Storage path
- file_type (enum: image/video/audio)
- file_size (bigint)
- caption (text)
- date_taken (date)
- people_tagged (text[])
- approval_status (enum: pending/approved/rejected)
- uploaded_by, approved_by (uuid)
- created_at, updated_at (timestamptz)
```

**RLS**: Similar to story (approved publicly visible, pending only by uploader/admin)

#### user_membership
Roles and permissions per memorial.

```sql
- id (uuid, PK)
- user_id (uuid, FK to auth.users)
- memorial_id (uuid, FK)
- role (enum: visitor/registered/content_manager/super_admin)
- granted_by (uuid)
- granted_at (timestamptz)
- UNIQUE(user_id, memorial_id)
```

**RLS**: User can read own membership, super_admin can manage

#### prayer_section
Verified prayer texts.

```sql
- id (uuid, PK)
- memorial_id (uuid, FK)
- section_order (integer)
- title (text)
- hebrew_text (text)
- notes (text)
- is_verified (boolean)
- created_at, updated_at (timestamptz)
```

**RLS**: Public if verified, admin full access

#### memorial_schedule
Yearly azkara event details.

```sql
- id (uuid, PK)
- memorial_id (uuid, FK)
- year (integer)
- hebrew_date_day, hebrew_date_month, hebrew_date_year (integer/text)
- gregorian_date (date)
- gathering_time, prayers_time, grave_visit_time, meal_time (text)
- location_notes (text)
- UNIQUE(memorial_id, year)
```

**RLS**: Public read, admin write

#### audit_log
All admin actions tracked.

```sql
- id (uuid, PK)
- user_id (uuid, FK)
- action (text)
- resource_type (text)
- resource_id (text)
- changes (jsonb)
- ip_address (text)
- created_at (timestamptz)
```

**RLS**: Super admins only

---

## Security Model

### Authentication

- **Google OAuth**: Primary method, handled by Supabase
- **Email + Password**: Backup method with email verification
- **Session Management**: JWT tokens in httpOnly cookies
- **No password storage**: All handled by Supabase

### Authorization (RLS)

Every table has Row Level Security enabled with policies:

**Public Content**:
```sql
CREATE POLICY "public_read_approved" ON story
FOR SELECT USING (approval_status = 'approved');
```

**User Content**:
```sql
CREATE POLICY "users_read_own" ON story
FOR SELECT USING (submitted_by = auth.uid());
```

**Admin Functions**:
```sql
CREATE FUNCTION is_admin(user_uuid UUID, memorial_uuid UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM user_membership
    WHERE user_id = user_uuid AND memorial_id = memorial_uuid
      AND role IN ('content_manager', 'super_admin')
  );
$$ LANGUAGE sql SECURITY DEFINER;
```

### Upload Security

1. **File Type Validation**: Only images, videos, audio allowed
2. **Size Limits**: Enforced at client and Supabase Storage
3. **Virus Scanning**: (Future: integrate Supabase Storage scanning)
4. **Path Sanitization**: Prevent directory traversal
5. **Approval Required**: Uploads not public until approved

### Rate Limiting

- Public forms (memory submission): Rate limited by IP
- Auth endpoints: Handled by Supabase (built-in protection)
- API routes: (Future: implement per-user rate limiting)

---

## Hebrew Date Calculations

### Critical Requirements

1. **Source of Truth**: Hebrew date stored in memorial table
2. **Annual Calculation**: Use @hebcal/core to convert to Gregorian each year
3. **Leap Year Handling**: Automatic via Hebcal
4. **Never Simple Math**: NEVER just add 12 months
5. **Sunset Consideration**: Hebrew day starts at sunset

### Implementation

```typescript
// utils/hebrew-dates.ts

import { HDate } from '@hebcal/core';

export function getAzkaraDateForYear(
  hebrewDeathDate: HebrewDate,
  gregorianYear: number
): AzkaraDate {
  const hd = new HDate(
    hebrewDeathDate.day,
    hebrewDeathDate.month,
    hebrewDeathDate.year
  );
  
  // Get yahrzeit (azkara) for target year
  const yahrzeit = hd.onOrAfter(gregorianYear, 1, 1);
  const gregorianDate = yahrzeit.greg();
  
  return {
    hebrewDate: { ... },
    gregorianDate,
    weekday: gregorianDate.toLocaleDateString('en', { weekday: 'long' }),
    daysUntil: calculateDaysUntil(gregorianDate),
  };
}
```

### Verification Process

**Known**: Gregorian death date = October 27, 2020  
**Unknown**: Time of death relative to sunset

**Admin UI Must**:
1. Show both candidate Hebrew dates
2. Explain the sunset rule
3. Require explicit selection
4. Mark as verified only after confirmation

**After Verification**:
- Hebrew date stored in memorial table
- Used for all future azkara calculations
- Displayed as verified in UI

---

## Halachic Times

### Cemetery Location

- Stored as latitude/longitude in env vars
- Default: Jerusalem area (31.7683, 35.2137)
- Timezone: Asia/Jerusalem (handles DST)

### Calculation

```typescript
import { Location, Zmanim, HDate } from '@hebcal/core';

export function getHalachicTimes(
  date: Date,
  latitude: number,
  longitude: number
): HalachicTimes {
  const location = new Location(latitude, longitude, false, 'Asia/Jerusalem');
  const hdate = new HDate(date);
  const zmanim = new Zmanim(hdate, latitude, longitude);
  
  return {
    sunset: zmanim.sunset(),
    tzeit: zmanim.tzeit(),
    location: { latitude, longitude, timezone: 'Asia/Jerusalem' },
  };
}
```

### Separation of Concerns

**Halachic Times** (auto-calculated):
- Sunset
- Tzeit hakochavim (nightfall)
- Displayed for reference

**Family Event Times** (admin-entered):
- Gathering time
- Prayer time
- Grave visit time
- Meal time

These are **separate** - family chooses event times based on convenience, not halachic requirements.

---

## QR Code Generation

### Requirements

1. Points to `/prayers` page
2. Stable, permanent URL
3. High contrast for outdoor scanning
4. Multiple formats: SVG (web) + PNG (print)

### Implementation

```typescript
// utils/qr.ts

import QRCode from 'qrcode';

export async function generateQRCodeSVG(url: string): Promise<string> {
  return await QRCode.toString(url, {
    type: 'svg',
    errorCorrectionLevel: 'H',
    margin: 2,
    width: 400,
    color: {
      dark: '#242521',  // Site text color
      light: '#F4F0E8', // Site background color
    },
  });
}

export async function generateQRCodePNG(url: string): Promise<string> {
  return await QRCode.toDataURL(url, {
    errorCorrectionLevel: 'H',
    margin: 2,
    width: 2000, // High-res for engraving
    color: {
      dark: '#242521FF',
      light: '#F4F0E8FF',
    },
  });
}
```

### Usage

- **Web**: Display SVG on admin page
- **Print**: Download high-res PNG
- **Engraving**: Use PNG or vector conversion
- **Caption**: "לקריאת התפילות ולהנצחת זכרו — סרקו כאן"

---

## Calendar Integration

### ICS File Generation

```typescript
import { createEvents } from 'ics';

export function generateICSFile(
  azkara: AzkaraDate,
  memorialName: string,
  eventDetails?: { location, description, startTime }
): string {
  const event = {
    start: [year, month, day, hour, minute],
    end: [year, month, day, hour+2, minute],
    title: `אזכרה - ${memorialName}`,
    description: eventDetails?.description,
    location: eventDetails?.location,
    status: 'CONFIRMED',
  };
  
  const { value } = createEvents([event]);
  return value;
}
```

### Google Calendar URL

```typescript
export function generateGoogleCalendarUrl(
  azkara: AzkaraDate,
  memorialName: string
): string {
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: `אזכרה - ${memorialName}`,
    dates: `${startISO}/${endISO}`,
    details: description,
    location: location,
  });
  
  return `https://calendar.google.com/calendar/render?${params}`;
}
```

### Apple Calendar

Uses the ICS file served via API endpoint or data URL.

---

## Backup & Export Strategy

### Database Backup

**Automatic** (Supabase Pro):
- Daily automatic backups
- Point-in-time recovery (7 days)

**Manual**:
```sql
-- Export full database
pg_dump -h db.xxx.supabase.co -U postgres -d postgres > backup.sql
```

**Admin UI**:
- Export button generates JSON dump of all tables
- Includes metadata and timestamps
- Downloadable as `backup_YYYY-MM-DD.json`

### Storage Backup

**Manual**:
```bash
# Download entire bucket
supabase storage download media --all
```

**Admin UI**:
- Generate ZIP of all media
- Includes folder structure
- File naming preserved

### Full Export

Admin "Backup & Export" page provides:
1. **Database JSON**: All content tables
2. **Media ZIP**: All uploaded files
3. **Combined Package**: DB + Media in one archive

This ensures **portability** - family can migrate to another platform if needed.

---

## Performance Optimization

### /prayers Page (QR Target)

**Critical Requirements**:
- Fast load (<2s)
- No authentication required
- Minimal JavaScript
- Cached aggressively

**Implementation**:
```typescript
// src/app/prayers/page.tsx
export const metadata = { ... };

// Server component - no JS needed for initial render
export default function PrayersPage() {
  return (
    <>
      <Navigation />
      <PrayersContent /> {/* Client component for interactivity */}
      <Footer />
    </>
  );
}

// next.config.js
async headers() {
  return [
    {
      source: '/prayers',
      headers: [
        {
          key: 'Cache-Control',
          value: 'public, max-age=3600, s-maxage=3600',
        },
      ],
    },
  ];
}
```

### Image Optimization

- Next.js Image component for automatic optimization
- Supabase Storage CDN
- Lazy loading for gallery
- WebP format with PNG fallback

### Database Queries

- Indexes on foreign keys and frequently queried columns
- Compound indexes for common filters (memorial_id + approval_status)
- Limit results with pagination
- Select only needed columns

---

## Accessibility (WCAG 2.1 AA)

### Keyboard Navigation

- All interactive elements focusable
- Visible focus indicators
- Logical tab order
- Skip links (future enhancement)

### Screen Readers

- Semantic HTML (header, nav, main, article, aside, footer)
- ARIA labels where needed
- Alt text for all images (user-provided)
- Form labels properly associated

### Visual

- Minimum contrast ratio: 4.5:1 (text)
- Minimum contrast ratio: 3:1 (UI components)
- Text resizable up to 200% (especially /prayers)
- Large tap targets (44x44px minimum)

### Content

- Clear language (Hebrew, appropriate for all ages)
- Consistent navigation
- Error messages descriptive
- Form validation helpful

---

## Mobile-First Design

### Breakpoints

```css
/* Tailwind defaults used */
sm: 640px   /* Small tablets */
md: 768px   /* Tablets */
lg: 1024px  /* Laptops */
xl: 1280px  /* Desktops */
```

### Mobile Optimizations

1. **Navigation**: Hamburger menu on mobile
2. **Typography**: Larger base size on mobile (16px → 18px)
3. **Tap Targets**: Minimum 44x44px
4. **Images**: Responsive, different sizes per breakpoint
5. **Forms**: Full-width on mobile, stacked fields
6. **Tables**: Horizontal scroll or card layout

### Testing

- Chrome DevTools device emulation
- Real device testing (iOS Safari, Android Chrome)
- Landscape and portrait orientations

---

## Monitoring & Analytics

### Error Tracking

(Future enhancement)
- Sentry or similar for error reporting
- Track failed uploads, auth errors
- Alert on critical issues

### Usage Analytics

**Privacy-First**:
- No Google Analytics (invasive)
- Consider: Plausible, Fathom, or Supabase Analytics
- Aggregate data only, no personal tracking
- Clear opt-out if implemented

### Admin Dashboard Metrics

- Total stories submitted
- Stories pending approval
- Media uploads (count, total size)
- Recent user registrations
- Audit log summary

---

## Future Enhancements

### Phase 2 (Post-MVP)

1. **Email Notifications**:
   - Story approved/rejected
   - New story submission (to admins)
   - Azkara reminders

2. **Search**:
   - Full-text search across stories
   - Filter gallery by people, dates
   - Timeline search

3. **Voice Recordings**:
   - Upload audio memories
   - Embedded player
   - Transcription (optional)

4. **Private Archive**:
   - Family-only content section
   - Restricted by role

5. **Multi-Language**:
   - English version of key pages
   - Language switcher

6. **Advanced Media**:
   - Video transcoding
   - Image auto-tagging (faces)
   - Slideshow generator

### Phase 3 (Long-term)

1. **Mobile App**: React Native version
2. **Offline Mode**: Service worker for /prayers
3. **AI Features**: Auto-generate timeline from stories
4. **Community**: Forums or discussion boards
5. **Yahrzeit Notifications**: SMS/WhatsApp reminders

---

## Development Workflow

### Local Development

```bash
# Start dev server
npm run dev

# Run tests
npm test

# Type check
npm run type-check

# Lint
npm run lint
```

### Git Workflow

1. Feature branch from `main`
2. Commit with clear messages
3. Push to remote
4. Create PR
5. Review (if team)
6. Merge to `main`
7. Auto-deploy (Vercel)

### Environment-Specific Config

- **Development**: `.env.local` (gitignored)
- **Preview**: Vercel preview env vars
- **Production**: Vercel production env vars

---

## Troubleshooting

### Common Issues

**Supabase connection fails**:
- Check env vars (URL, anon key)
- Verify network (firewall, VPN)
- Check Supabase project status

**RLS policies blocking queries**:
- Test query in Supabase SQL Editor
- Check user role in user_membership
- Verify RLS policy functions (is_admin, etc.)

**Hebrew text renders LTR**:
- Verify `dir="rtl"` on <html>
- Check Tailwind config (no LTR overrides)
- Test with actual Hebrew text (not Latin placeholders)

**Images not loading**:
- Check Supabase Storage bucket permissions
- Verify file_path in database matches Storage
- Check next.config.js image domains

**Tests failing**:
- Check if Hebcal library loaded correctly
- Verify test data uses valid Hebrew months
- Check date calculations for timezone issues

---

## Conclusion

This architecture prioritizes:

1. **Accuracy**: Hebrew dates calculated correctly, never approximated
2. **Security**: RLS on all data, content approval workflow
3. **Accessibility**: WCAG AA compliant, mobile-first, RTL
4. **Family Control**: CMS for all content, no code required
5. **Respect**: Never invent biographical or religious content
6. **Portability**: Full backup/export ensures data ownership

The result is a dignified, functional, and maintainable memorial website that honors Alex Shitrit's memory while empowering the family to manage and preserve his legacy.

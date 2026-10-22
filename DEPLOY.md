# Deployment Guide

Complete checklist for deploying the Alex Shitrit Memorial Website to Firebase Hosting (free) + Supabase.

**Architecture**: Static HTML on Firebase Hosting + Supabase (database, auth, storage, functions)  
**Cost**: $0/month (only domain ~$10-30/year)

---

## Prerequisites

### 1. Required Software

**Node.js 20+**:
```bash
node --version
```

If not installed, download from [nodejs.org](https://nodejs.org/)

**Firebase CLI**:
```bash
npm install -g firebase-tools
```

**Supabase CLI** (for Edge Function deployment):
```bash
npm install -g supabase
```

### 2. Required Accounts

- **Supabase account**: Sign up at [supabase.com](https://supabase.com)
- **Firebase account**: Sign up at [firebase.google.com](https://firebase.google.com)
- **Google Cloud account**: For OAuth (uses same Google account as Firebase)

---

## Part 1: Supabase Setup

### 1. Create Supabase Project

1. Go to [supabase.com/dashboard](https://supabase.com/dashboard)
2. Click **New Project**
3. Enter:
   - **Name**: `alex-shitrit-memorial`
   - **Database Password**: Generate strong password (save it!)
   - **Region**: Choose closest to your users
4. Wait 2-3 minutes for project to initialize

### 2. Run Database Migrations

Get your project's database password (from step 1), then:

```bash
cd /path/to/alex-shitrit-memorial
```

```bash
supabase login
```

```bash
supabase link --project-ref YOUR_PROJECT_REF
```

(Find `YOUR_PROJECT_REF` in Supabase dashboard → Project Settings → General → Reference ID)

Run migrations **in order**:

```bash
supabase db push
```

This runs all 6 migrations:
1. `001_initial_schema.sql` - Tables
2. `002_rls_policies.sql` - Security
3. `003_seed_data.sql` - Placeholder data
4. `004_death_date_verification.sql` - Hebrew date fields
5. `005_prayer_sections_enhanced.sql` - Enhanced prayer schema
6. `006_seed_sephardi_prayers.sql` - Sephardi prayer content

**Verify migrations ran**:

Go to Supabase dashboard → SQL Editor → Run:
```sql
SELECT * FROM memorial;
```

Should return 1 row with placeholder data.

### 3. Deploy Edge Function

The death-date verification requires a server-side function:

```bash
supabase functions deploy verify-death-date
```

**Verify**:

Go to Supabase dashboard → Edge Functions → Should show `verify-death-date` with status "Active"

---

## Part 2: Authentication Setup

### 1. Google OAuth - Create Client ID

1. Go to [console.cloud.google.com](https://console.cloud.google.com)
2. Select your Firebase project (or create new one)
3. Navigate to **APIs & Services** → **Credentials**
4. Click **Create Credentials** → **OAuth 2.0 Client ID**
5. If prompted, configure OAuth consent screen:
   - User Type: **External**
   - App name: `Alex Shitrit Memorial`
   - Support email: Your email
   - Save
6. Create OAuth Client ID:
   - Application type: **Web application**
   - Name: `Memorial Site Auth`
   - Authorized redirect URIs - add BOTH:
     - `http://localhost:3000/auth/callback` (for local dev)
     - `https://YOUR-DOMAIN.com/auth/callback` (for production)
   - Click **Create**
7. **Save** the Client ID and Client Secret

### 2. Configure Supabase Google Provider

1. Go to Supabase dashboard → **Authentication** → **Providers**
2. Find **Google** provider
3. Enable it
4. Enter:
   - **Client ID**: From step 1
   - **Client Secret**: From step 1
5. Note the **Callback URL** shown: `https://YOUR-PROJECT.supabase.co/auth/v1/callback`
6. Go back to Google Cloud Console → Edit your OAuth Client
7. Add the Supabase callback URL to **Authorized redirect URIs**
8. Save

### 3. Enable Email Authentication

In Supabase dashboard → **Authentication** → **Providers**:
1. **Email** provider should be enabled by default
2. If not, enable it
3. Configure email templates (optional):
   - Confirmation email
   - Password reset email

---

## Part 3: Create First Admin User

### 1. Sign Up

1. Start local dev server:

```bash
npm run dev
```

2. Open `http://localhost:3000`
3. Click admin area / sign in
4. Sign up with Google or email
5. Complete sign-up flow

### 2. Get Your User ID

1. Go to Supabase dashboard → **Authentication** → **Users**
2. Find your user in the list
3. Click to view details
4. Copy the **User ID** (UUID format: `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`)

### 3. Grant Super Admin Role

Go to Supabase dashboard → **SQL Editor** → New query:

```sql
INSERT INTO user_membership (user_id, memorial_id, role)
SELECT 'YOUR_USER_ID_HERE', m.id, 'super_admin'
FROM memorial m
WHERE m.english_name = 'Alex Shitrit';
```

Replace `YOUR_USER_ID_HERE` with your actual User ID, then click **Run**.

### 4. Verify Admin Access

Refresh `http://localhost:3000` → You should now see admin options.

---

## Part 4: Environment Variables

### 1. Create `.env.local`

```bash
cp .env.example .env.local
```

### 2. Fill In Values

Edit `.env.local`:

```env
# Supabase Configuration
# From: Supabase dashboard → Project Settings → API
NEXT_PUBLIC_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

# Not used in static export, but keep for compatibility
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# Site Configuration
# Localhost for dev, your domain for production
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Hebrew Date Configuration
# Default values until family verifies via admin UI
NEXT_PUBLIC_DEATH_DATE_HEBREW_DAY=9
NEXT_PUBLIC_DEATH_DATE_HEBREW_MONTH=Cheshvan
NEXT_PUBLIC_DEATH_DATE_HEBREW_YEAR=5781

# Cemetery Location (for calculating halachic times)
# Default: Jerusalem
NEXT_PUBLIC_CEMETERY_LATITUDE=31.7683
NEXT_PUBLIC_CEMETERY_LONGITUDE=35.2137
NEXT_PUBLIC_CEMETERY_TIMEZONE=Asia/Jerusalem
```

**Where to find values**:

| Variable | Where to find it |
|----------|------------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase dashboard → Settings → API → Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase dashboard → Settings → API → Project API keys → `anon` `public` |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase dashboard → Settings → API → Project API keys → `service_role` (click "Reveal") |

---

## Part 5: Build and Deploy

### 1. Install Dependencies

```bash
npm install
```

### 2. Run Tests

```bash
npm test
```

### 3. Build Static Site

```bash
npm run build
```

This creates `out/` directory with static HTML files.

### 4. Test Build Locally

```bash
npx serve out
```

Open `http://localhost:3000` and verify:
- Home page loads
- `/prayers` page works (no auth required)
- `/admin` requires sign-in
- Mobile width (resize browser to 375px)

Press Ctrl+C to stop server.

### 5. Firebase Setup

**Login**:
```bash
firebase login
```

**Initialize** (if not done):
```bash
firebase init hosting
```

Select:
- Use existing project or create new one
- Public directory: `out`
- Single-page app: **No**
- Set up automatic builds: **No**

**Deploy**:
```bash
firebase deploy --only hosting
```

You'll get a URL like: `https://alex-shitrit-memorial.web.app`

---

## Part 6: Custom Domain

### 1. Purchase Domain

Buy a domain (e.g., `alexshitrit.com`) from any registrar:
- Google Domains
- Namecheap
- GoDaddy
- etc.

### 2. Add Domain to Firebase

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project
3. Go to **Hosting** (left sidebar)
4. Click **Add custom domain**
5. Enter your domain: `alexshitrit.com`
6. Click **Continue**

### 3. Verify Ownership

Firebase shows a **TXT record** to add to your DNS:

1. Go to your domain registrar's DNS settings
2. Add TXT record:
   - **Name**: `@` or your domain
   - **Value**: (copy from Firebase)
3. Wait a few minutes, then click **Verify** in Firebase

### 4. Point Domain to Firebase

Firebase shows **A records** to add:

In your DNS settings, add:
```
Type  Name  Value
A     @     151.101.1.195
A     @     151.101.65.195
```

Wait for DNS propagation (5 minutes to 48 hours, usually <1 hour).

### 5. SSL Certificate

Firebase automatically provisions SSL certificate (free, auto-renews).

Check status in Firebase Console → Hosting → Your domain.

When status shows **Connected**, your site is live at `https://alexshitrit.com`

### 6. Update Environment Variables

Update `.env.local`:

```env
NEXT_PUBLIC_SITE_URL=https://alexshitrit.com
```

Rebuild and redeploy:

```bash
npm run build
```

```bash
firebase deploy --only hosting
```

### 7. Update Google OAuth Redirect

1. Go to [Google Cloud Console](https://console.cloud.google.com) → Credentials
2. Edit your OAuth Client ID
3. Add to Authorized redirect URIs:
   ```
   https://alexshitrit.com/auth/callback
   ```
4. Save

---

## Part 7: Generate QR Code

**ONLY after domain is final!**

### Option A: Online Generator

1. Go to [qr-code-generator.com](https://www.qr-code-generator.com/)
2. Enter URL: `https://alexshitrit.com/prayers`
3. Download **PNG** at **high resolution** (300+ DPI for printing)
4. Save as `prayers-qr-code.png`

### Option B: Node Script (if implemented)

```bash
node scripts/generate-qr.js https://alexshitrit.com/prayers
```

### Print QR Code

- For web: Use PNG or SVG
- For print/engraving: Use high-res PNG (300+ DPI)
- Add Hebrew caption: "לקריאת התפילות — סרקו כאן"

---

## Part 8: Automated Deployment (Optional)

### GitHub Action for Auto-Deploy

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Firebase Hosting

on:
  push:
    branches: [ main ]

jobs:
  build_and_deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run tests
        run: npm test
      
      - name: Build
        run: npm run build
        env:
          NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.NEXT_PUBLIC_SUPABASE_URL }}
          NEXT_PUBLIC_SUPABASE_ANON_KEY: ${{ secrets.NEXT_PUBLIC_SUPABASE_ANON_KEY }}
          NEXT_PUBLIC_SITE_URL: https://alexshitrit.com
          NEXT_PUBLIC_DEATH_DATE_HEBREW_DAY: 9
          NEXT_PUBLIC_DEATH_DATE_HEBREW_MONTH: Cheshvan
          NEXT_PUBLIC_DEATH_DATE_HEBREW_YEAR: 5781
          NEXT_PUBLIC_CEMETERY_LATITUDE: 31.7683
          NEXT_PUBLIC_CEMETERY_LONGITUDE: 35.2137
          NEXT_PUBLIC_CEMETERY_TIMEZONE: Asia/Jerusalem
      
      - name: Deploy to Firebase
        uses: FirebaseExtended/action-hosting-deploy@v0
        with:
          repoToken: ${{ secrets.GITHUB_TOKEN }}
          firebaseServiceAccount: ${{ secrets.FIREBASE_SERVICE_ACCOUNT }}
          channelId: live
          projectId: alex-shitrit-memorial
```

### Add GitHub Secrets

1. Go to your GitHub repo → **Settings** → **Secrets and variables** → **Actions**
2. Click **New repository secret**
3. Add:
   - `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anon key
   - `FIREBASE_SERVICE_ACCOUNT`: Firebase service account JSON

**Get Firebase service account**:

```bash
firebase login:ci
```

Copy the token, then create JSON:
```json
{
  "type": "service_account",
  "project_id": "alex-shitrit-memorial",
  "private_key_id": "...",
  "private_key": "...",
  "client_email": "...",
  "client_id": "...",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "..."
}
```

Or use the simpler token approach - just add `FIREBASE_TOKEN` secret with the token from `firebase login:ci`.

---

## Part 9: Updates and Maintenance

### Deploying Updates

**Manual deployment**:

```bash
git pull origin main
```

```bash
npm install
```

```bash
npm test
```

```bash
npm run build
```

```bash
firebase deploy --only hosting
```

**Auto deployment**: If GitHub Action is set up, just push to `main`:

```bash
git push origin main
```

### Database Migrations

**Create new migration**:

```bash
supabase migration new migration_name
```

Edit the file in `supabase/migrations/`, then:

```bash
supabase db push
```

**View migration status**:

```bash
supabase migration list
```

### Rollback Deployment

**Hosting rollback** (if new version has issues):

1. Go to Firebase Console → **Hosting**
2. Click **Release history**
3. Find previous working version
4. Click **⋮** → **Rollback**

**Database rollback** (careful!):

Supabase doesn't have automatic rollback. You must:
1. Write a reverse migration manually
2. Test in local environment first
3. Run via `supabase db push`

---

## Part 10: Troubleshooting

### Build Fails

**TypeScript errors**:
```bash
npm run type-check
```

Fix errors in your code.

**Missing dependencies**:
```bash
rm -rf node_modules package-lock.json
```

```bash
npm install
```

### Auth Not Working

**Google OAuth redirect error**:
- Verify redirect URIs in Google Cloud Console include:
  - `http://localhost:3000/auth/callback` (dev)
  - `https://YOUR-DOMAIN.com/auth/callback` (prod)
  - `https://YOUR-PROJECT.supabase.co/auth/v1/callback` (Supabase)

**User can't sign in**:
- Check Supabase dashboard → Authentication → Users
- Verify user exists
- Check email confirmation status

### Admin Access Issues

**User sees "Access Denied"**:
```sql
-- Verify user has super_admin role
SELECT um.*, u.email 
FROM user_membership um
JOIN auth.users u ON u.id = um.user_id
WHERE um.role = 'super_admin';
```

If no results, grant admin role (see Part 3, step 3).

### Edge Function Errors

**View logs**:
```bash
supabase functions logs verify-death-date
```

**Common issues**:
- Auth token not passed: Check component passes `Authorization` header
- CORS error: Edge Function includes CORS headers
- Permission denied: User not super_admin

**Redeploy function**:
```bash
supabase functions deploy verify-death-date
```

### Custom Domain Not Working

**DNS not resolving**:
```bash
dig alexshitrit.com
```

Should show Firebase IP addresses (151.101.x.x).

**SSL pending**: Wait up to 24 hours for certificate provisioning.

**Redirect loops**: Clear browser cache and cookies.

### Firebase Deploy Fails

**Not logged in**:
```bash
firebase logout
```

```bash
firebase login
```

**Wrong project**:
```bash
firebase use alex-shitrit-memorial
```

**Quota exceeded** (rare on Spark plan):
- Check Firebase Console → Usage
- Contact Firebase support to increase quota

### Database Connection Issues

**Can't connect to Supabase**:
- Verify `NEXT_PUBLIC_SUPABASE_URL` is correct
- Check Supabase project status in dashboard
- Verify API keys are correct

**RLS blocking queries**:
- Queries fail silently if RLS denies access
- Check user has proper role in `user_membership`
- Verify RLS policies in `002_rls_policies.sql`

### Getting Help

1. Check Supabase logs: Dashboard → Logs
2. Check Firebase logs: Console → Hosting → Release history
3. Check browser console for client errors (F12)
4. Review migration files for schema issues

---

## Quick Reference

### Essential Commands

```bash
# Development
npm run dev                    # Start dev server
npm test                       # Run tests
npm run build                  # Build for production

# Supabase
supabase db push               # Run migrations
supabase functions deploy      # Deploy Edge Function
supabase functions logs        # View function logs

# Firebase
firebase login                 # Authenticate
firebase deploy --only hosting # Deploy static site
firebase hosting:channel:deploy preview  # Preview deploy

# Verification
node --version                 # Check Node version (need 20+)
firebase projects:list         # List Firebase projects
supabase projects list         # List Supabase projects
```

### File Locations

- Migrations: `supabase/migrations/*.sql`
- Edge Functions: `supabase/functions/*/index.ts`
- Environment variables: `.env.local` (not committed)
- Static build output: `out/` (generated)
- Firebase config: `firebase.json`

### Important URLs

- Supabase Dashboard: `https://supabase.com/dashboard/project/YOUR-PROJECT-REF`
- Firebase Console: `https://console.firebase.google.com/project/YOUR-PROJECT-ID`
- Google Cloud Console: `https://console.cloud.google.com`
- Production site: `https://YOUR-DOMAIN.com`
- Prayers QR page: `https://YOUR-DOMAIN.com/prayers`

---

## Summary

**Total setup time**: 1-2 hours (including DNS propagation)

**Monthly cost**: $0 (only domain ~$1-3/month)

**What you get**:
- ✅ Fast static site on global CDN
- ✅ Free SSL certificate (auto-renewed)
- ✅ Postgres database with 500MB free
- ✅ Google OAuth login
- ✅ Image storage (1GB free)
- ✅ Admin interface for content management
- ✅ Prayer sections with family verification workflow
- ✅ Hebrew date calculations
- ✅ QR code access to prayers page

**Next steps after deployment**:
1. Update placeholder content via admin interface
2. Upload family photos to gallery
3. Have family verify prayer texts
4. Confirm Hebrew death date (before/after sunset)
5. Print QR code for cemetery/home display

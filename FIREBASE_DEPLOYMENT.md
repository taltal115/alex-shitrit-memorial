# Firebase Hosting Deployment Guide

Complete step-by-step guide for deploying the Alex Shitrit Memorial Website to Firebase Hosting as a static site.

---

## Architecture Overview

This project uses:

- **Firebase Hosting** (Spark Plan - FREE): Static HTML/CSS/JS hosting
- **Supabase**: Database, authentication, storage, and Edge Functions
- **Next.js Static Export**: Pre-rendered static HTML pages

**Key Benefits**:

- ✅ **Free hosting** (only pay for domain)
- ✅ **Fast global CDN**
- ✅ **Auto SSL certificates**
- ✅ **Zero maintenance**
- ✅ **No server costs**

---

## Prerequisites

- Google account with Firebase access
- Supabase project already set up (see main README)
- Firebase CLI installed: `npm install -g firebase-tools`
- Domain name (optional but recommended)

---



## Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click **Add Project**
3. Enter project name: `alex-shitrit-memorial` (or your preference)
4. Disable Google Analytics (optional for this project)
5. Click **Create Project**

**Note**: Stay on the **Spark Plan (FREE)** - no upgrade needed!

---



## Step 2: Configure Environment Variables



### 2.1 Update `.env.local`

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

# Site Configuration
NEXT_PUBLIC_SITE_URL=https://alexshitrit.com  # Your custom domain

# Hebrew Date Configuration (set via admin UI after first verification)
NEXT_PUBLIC_DEATH_DATE_HEBREW_DAY=9
NEXT_PUBLIC_DEATH_DATE_HEBREW_MONTH=Cheshvan
NEXT_PUBLIC_DEATH_DATE_HEBREW_YEAR=5781

# Cemetery Location (for halachic times calculation)
NEXT_PUBLIC_CEMETERY_LATITUDE=31.7683
NEXT_PUBLIC_CEMETERY_LONGITUDE=35.2137
NEXT_PUBLIC_CEMETERY_TIMEZONE=Asia/Jerusalem
```

**Important**: All environment variables must be `NEXT_PUBLIC_`* for static export.

---



## Step 3: Deploy Supabase Edge Function

The death-date verification functionality requires a server-side function:

### 3.1 Install Supabase CLI

```bash
npm install -g supabase
```



### 3.2 Link Project

```bash
supabase login
supabase link --project-ref your-project-ref
```



### 3.3 Deploy Edge Function

```bash
supabase functions deploy verify-death-date
```



### 3.4 Set Environment Variables

In Supabase Dashboard → **Settings** → **Functions**:

- No additional env vars needed (uses project URL and keys automatically)

---



## Step 4: Build Static Site



### 4.1 Install Dependencies

```bash
npm install
```



### 4.2 Run Tests

```bash
npm test
npm run lint
```



### 4.3 Build for Production

```bash
npm run build
```

This creates an `out/` directory with static HTML files.

### 4.4 Test Locally

```bash
npx serve out
```

Open `http://localhost:3000` and verify:

- ✅ Home page loads
- ✅ `/prayers` page displays correctly
- ✅ `/admin/prayers` requires auth
- ✅ Mobile 375px width works

---



## Step 5: Deploy to Firebase Hosting



### 5.1 Login to Firebase

```bash
firebase login
```



### 5.2 Initialize Project

```bash
firebase init hosting
```

Select:

- Use an existing project: `alex-shitrit-memorial`
- Public directory: `out`
- Configure as single-page app: **No**
- Set up automatic builds with GitHub: **No** (we'll deploy manually)
- Overwrite `out/index.html`: **No**



### 5.3 Deploy

```bash
firebase deploy --only hosting
```

You'll get a URL like: `https://alex-shitrit-memorial.web.app`

---



## Step 6: Add Custom Domain



### 6.1 Purchase Domain

Purchase a domain like `alexshitrit.com` from:

- Google Domains
- Namecheap
- GoDaddy
- Any registrar

**CRITICAL**: The `/prayers` URL must remain stable for the QR code!

### 6.2 Add Domain to Firebase

1. In Firebase Console → **Hosting**
2. Click **Add custom domain**
3. Enter domain: `alexshitrit.com`
4. Follow DNS verification steps:
  - Add TXT record to verify ownership
  - Add A records to point to Firebase:
    ```
    A     @     151.101.1.195
    A     @     151.101.65.195
    ```
  - Wait for DNS propagation (up to 48 hours, usually < 1 hour)



### 6.3 Add WWW Subdomain (Optional)

1. Click **Add custom domain** again
2. Enter: `www.alexshitrit.com`
3. Choose: Redirect to `alexshitrit.com`



### 6.4 Update Site URL

After domain is active:

1. Update `.env.local`:
  ```env
   NEXT_PUBLIC_SITE_URL=https://alexshitrit.com
  ```
2. Rebuild and redeploy:
  ```bash
   npm run build
   firebase deploy --only hosting
  ```

---



## Step 7: Generate QR Code

**CRITICAL**: The `/prayers` page must remain accessible at a stable URL.

### 7.1 Stable QR URL

Once custom domain is set up:

- QR URL: `https://alexshitrit.com/prayers`



### 7.2 Generate QR Code

Option A: Use admin interface (when implemented)

Option B: Use online tool:

1. Go to [qr-code-generator.com](https://www.qr-code-generator.com/)
2. Enter URL: `https://alexshitrit.com/prayers`
3. Download high-res PNG (300+ DPI for printing)



### 7.3 Test QR Code

1. Print or display QR code
2. Scan with phone
3. Verify `/prayers` page loads correctly
4. Test text size controls work

---



## Step 8: Ongoing Deployment Workflow



### 8.1 Make Changes

```bash
# Create feature branch
git checkout -b my-feature

# Make changes
# ... edit files ...

# Test locally
npm test
npm run dev

# Build
npm run build
npx serve out  # Test production build
```



### 8.2 Deploy to Production

```bash
# Deploy to Firebase
firebase deploy --only hosting

# Or with preview channel first
firebase hosting:channel:deploy preview-feature
# Review at: https://alex-shitrit-memorial--preview-feature-XXXXX.web.app
# Then deploy to main if OK:
firebase deploy --only hosting
```

---



## Costs



### Firebase Hosting (Spark Plan - FREE)

- **Storage**: 10GB (more than enough)
- **Bandwidth**: 360MB/day (~10GB/month)
- **Custom domain**: FREE
- **SSL certificate**: FREE, auto-renewed

**Expected usage for memorial site**:

- Storage: ~100MB (with images)
- Bandwidth: 1-5GB/month (unless viral)

**Cost**: **$0/month** ✅

### Supabase (Free Tier)

- **Database**: 500MB
- **Storage**: 1GB
- **Bandwidth**: 2GB/month
- **Auth**: Unlimited users
- **Edge Functions**: 500K invocations/month

**Expected usage**:

- Database: ~50MB
- Storage: ~500MB (memorial images)
- Bandwidth: 1-2GB/month
- Edge Functions: <1000 invocations/month

**Cost**: **$0/month** (within free tier) ✅

**If you exceed free tier**:

- Supabase Pro: $25/month (8GB DB, 100GB storage, 50GB bandwidth)



### Domain

- **Purchase**: $10-30/year (one-time)
- **Renewal**: $10-30/year (annual)



### Total Expected Cost

- **Monthly**: **$0**
- **Annual**: **$10-30** (domain only)

---



## Security Checklist

- [x] All sensitive data in Supabase (not in static files)
- [x] RLS policies enforce all permissions
- [x] Auth handled by Supabase (not client-side only)
- [x] Admin verification uses RLS + Edge Function
- [x] HTTPS enforced (Firebase auto-redirects)
- [x] No secrets in client code (all `NEXT_PUBLIC_*` vars are safe to expose)
- [x] Edge Function validates auth before updates

---



## Deployment Checklist

- [ ] Firebase project created (Spark plan - FREE)
- [ ] Supabase Edge Function deployed
- [ ] Environment variables configured
- [ ] Static build successful (`npm run build`)
- [ ] Initial deployment to Firebase Hosting
- [ ] Custom domain added and verified
- [ ] SSL certificate active (auto)
- [ ] QR code generated with stable URL
- [ ] Test all pages:
  - [ ] Home page
  - [ ] `/prayers` (public)
  - [ ] `/admin/prayers` (requires auth)
  - [ ] `/life-story`
  - [ ] `/gallery`
  - [ ] `/memories`
  - [ ] `/legacy`
- [ ] Verify mobile 375px width
- [ ] Verify azkara date calculation
- [ ] Test auth flow (Google + Email)
- [ ] Test prayer section admin workflow

---



## Troubleshooting



### Build Fails

```bash
# Check TypeScript errors
npm run type-check

# Check for server-side code (not allowed in static export)
# Look for: getServerSideProps, API routes, server components
```



### Page Not Found (404)

Firebase Hosting serves exact file paths. For Next.js:

- `/` → `index.html` ✅
- `/prayers` → `prayers.html` ✅
- `/prayers/` → `prayers/index.html` ✅

Check `firebase.json` `cleanUrls` and `trailingSlash` settings.

### Environment Variables Not Working

In static export, all vars must be `NEXT_PUBLIC_*` and baked in at build time:

```bash
# Rebuild to pick up new env vars
npm run build
firebase deploy --only hosting
```



### Edge Function Not Working

```bash
# Check logs
supabase functions logs verify-death-date

# Test locally
supabase functions serve verify-death-date
```



### Custom Domain Not Working

1. Verify DNS records:
  ```bash
   dig alexshitrit.com
   dig www.alexshitrit.com
  ```
2. Check Firebase Console → **Hosting** → domain status
3. DNS propagation can take 24-48 hours
4. Clear browser cache

---



## Monitoring



### Firebase Hosting

Firebase Console → **Hosting** → **Usage**:

- Bandwidth usage
- Storage usage
- Request count



### Supabase

Supabase Dashboard → **Reports**:

- Database size
- Storage usage
- Bandwidth
- Edge Function invocations

Set up alerts if approaching limits.

---



## Backup Strategy



### 1. Database Backup

```bash
# Manual backup via Supabase CLI
supabase db dump > backup-$(date +%Y%m%d).sql
```

Or in Supabase Dashboard → **Database** → **Backups** (Pro plan)

### 2. Storage Backup

Download media assets from Supabase Storage dashboard.

### 3. Code Backup

GitHub repository is the source of truth:

```bash
git push origin main
```



### 4. Automate Backups

Create a cron job or GitHub Action to:

- Export database monthly
- Download storage bucket monthly
- Store in Google Drive or S3

---



## Performance Tips



### 1. Image Optimization

Already handled by Next.js Image component (unoptimized for static export, but properly sized).

### 2. Caching

Configured in `firebase.json`:

- Static assets (JS, CSS, images): 1 year cache
- HTML pages: No cache (fresh on every visit)
- `/prayers` page: 1 hour cache



### 3. Lazy Loading

Images already lazy-load via Next.js Image.

### 4. Minimize Bundle Size

```bash
# Analyze bundle
npm run build

# Check .next/analyze/ for bundle report
```

---



## Advanced: CI/CD with GitHub Actions

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
          node-version: '18'
      
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
      
      - name: Deploy to Firebase
        uses: FirebaseExtended/action-hosting-deploy@v0
        with:
          repoToken: ${{ secrets.GITHUB_TOKEN }}
          firebaseServiceAccount: ${{ secrets.FIREBASE_SERVICE_ACCOUNT }}
          channelId: live
          projectId: alex-shitrit-memorial
```

Add secrets in GitHub repo → **Settings** → **Secrets and variables** → **Actions**.

---



## Support

- [Firebase Hosting Docs](https://firebase.google.com/docs/hosting)
- [Next.js Static Export](https://nextjs.org/docs/app/building-your-application/deploying/static-exports)
- [Supabase Edge Functions](https://supabase.com/docs/guides/functions)
- [Firebase Pricing](https://firebase.google.com/pricing)

---

**Status**: Ready for deployment. Total running cost: **$0/month** (+ domain).
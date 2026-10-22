# Firebase App Hosting Deployment Guide

Complete step-by-step guide for deploying the Alex Shitrit Memorial Website to Firebase App Hosting.

---

## Prerequisites

- Google account with Firebase access
- GitHub repository access
- Supabase project already set up (see main README)
- Firebase CLI installed: `npm install -g firebase-tools`

---

## Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click **Add Project**
3. Enter project name: `alex-shitrit-memorial` (or your preference)
4. Disable Google Analytics (optional for this project)
5. Click **Create Project**

---

## Step 2: Upgrade to Blaze Plan

**REQUIRED**: Firebase App Hosting requires the Blaze (pay-as-you-go) plan.

1. In Firebase Console, click **Upgrade** in the left sidebar
2. Select **Blaze Plan**
3. Add payment method (credit card required)
4. Set a budget alert (recommended: $50/month)

### Expected Costs

**Firebase App Hosting**:
- First 2,000,000 invocations/month: FREE
- After that: $0.40 per 1 million invocations
- Minimum instances (0): No idle cost when scaled to zero
- Storage: ~$0.026/GB/month

**Typical Memorial Site Costs**:
- **Low traffic** (few hundred visitors/month): $0-5/month
- **Medium traffic** (thousands of visitors/month): $10-30/month
- **High traffic** (tens of thousands): $50-100/month

**Combined with Supabase**:
- Supabase Free: $0/month (500MB DB, 1GB storage)
- Supabase Pro: $25/month (8GB DB, 100GB storage)

**Total Expected**: $25-60/month for moderate usage

---

## Step 3: Update Firebase Configuration

### 3.1 Update `.firebaserc`

```bash
# Edit .firebaserc
{
  "projects": {
    "default": "alex-shitrit-memorial"  # Your Firebase project ID
  }
}
```

### 3.2 Review `apphosting.yaml`

The `apphosting.yaml` is already configured. You'll add secrets in the next step.

---

## Step 4: Set Up Cloud Secret Manager

Firebase App Hosting uses Google Cloud Secret Manager for sensitive values.

### 4.1 Enable Secret Manager API

1. Go to [Cloud Console](https://console.cloud.google.com/)
2. Select your Firebase project
3. Navigate to **APIs & Services > Library**
4. Search for "Secret Manager API"
5. Click **Enable**

### 4.2 Create Secrets

Create three secrets for Supabase:

```bash
# Install gcloud CLI if needed
# https://cloud.google.com/sdk/docs/install

# Authenticate
gcloud auth login

# Set project
gcloud config set project alex-shitrit-memorial

# Create SUPABASE_URL secret
echo -n "https://your-project.supabase.co" | \
  gcloud secrets create SUPABASE_URL --data-file=-

# Create SUPABASE_ANON_KEY secret
echo -n "your-anon-key-here" | \
  gcloud secrets create SUPABASE_ANON_KEY --data-file=-

# Create SUPABASE_SERVICE_ROLE_KEY secret
echo -n "your-service-role-key-here" | \
  gcloud secrets create SUPABASE_SERVICE_ROLE_KEY --data-file=-
```

**Alternative**: Use Cloud Console UI:
1. Go to [Secret Manager](https://console.cloud.google.com/security/secret-manager)
2. Click **Create Secret**
3. Name: `SUPABASE_URL`, Value: your Supabase URL
4. Repeat for `SUPABASE_ANON_KEY` and `SUPABASE_SERVICE_ROLE_KEY`

### 4.3 Grant Access to App Hosting

```bash
# Get the App Hosting service account email
# Format: firebase-app-hosting-compute@YOUR_PROJECT_ID.iam.gserviceaccount.com

# Grant access to each secret
gcloud secrets add-iam-policy-binding SUPABASE_URL \
  --member="serviceAccount:firebase-app-hosting-compute@alex-shitrit-memorial.iam.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"

gcloud secrets add-iam-policy-binding SUPABASE_ANON_KEY \
  --member="serviceAccount:firebase-app-hosting-compute@alex-shitrit-memorial.iam.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"

gcloud secrets add-iam-policy-binding SUPABASE_SERVICE_ROLE_KEY \
  --member="serviceAccount:firebase-app-hosting-compute@alex-shitrit-memorial.iam.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"
```

---

## Step 5: Connect GitHub Repository

### 5.1 Enable App Hosting

1. In Firebase Console, go to **App Hosting** (left sidebar)
2. Click **Get Started**
3. Click **Connect GitHub**
4. Authorize Firebase to access your GitHub account
5. Select repository: `taltal115/alex-shitrit-memorial`
6. Select branch: `main` (or your default branch)
7. Click **Next**

### 5.2 Configure Build

1. Root directory: `/` (leave default)
2. Build command: `npm run build` (auto-detected)
3. Output directory: `.next` (auto-detected)
4. Click **Next**

### 5.3 Review and Deploy

1. Review configuration
2. Click **Deploy**
3. Wait for initial deployment (5-10 minutes)

---

## Step 6: Update Site URL

After deployment completes:

1. Note the Firebase-provided URL: `https://alex-shitrit-memorial-XXXXX.web.app`
2. Update `apphosting.yaml`:

```yaml
env:
  - variable: NEXT_PUBLIC_SITE_URL
    value: https://alex-shitrit-memorial-XXXXX.web.app
```

3. Commit and push to trigger redeployment

---

## Step 7: Add Custom Domain

### 7.1 Purchase Domain

Purchase a domain like `alexshitrit.com` from:
- Google Domains
- Namecheap
- GoDaddy
- Any registrar

**CRITICAL**: The `/prayers` URL must remain stable for the QR code!

### 7.2 Add Domain to Firebase

1. In Firebase Console → **Hosting**
2. Click **Add custom domain**
3. Enter domain: `alexshitrit.com`
4. Follow DNS verification steps:
   - Add TXT record to verify ownership
   - Add A records to point to Firebase
   - Wait for DNS propagation (up to 48 hours, usually < 1 hour)

### 7.3 Add WWW Subdomain (Optional)

1. Click **Add custom domain** again
2. Enter: `www.alexshitrit.com`
3. Choose: Redirect to `alexshitrit.com`

### 7.4 Update Site URL

After domain is active:

```yaml
env:
  - variable: NEXT_PUBLIC_SITE_URL
    value: https://alexshitrit.com
```

Commit and push to redeploy.

---

## Step 8: Ensure QR Code Stability

**CRITICAL**: The `/prayers` page must remain accessible at a stable URL.

### Option A: Custom Domain (Recommended)

Once custom domain is set up:
- QR URL: `https://alexshitrit.com/prayers`
- This URL will remain stable even if you change hosting

### Option B: Firebase Default Domain

- QR URL: `https://alex-shitrit-memorial-XXXXX.web.app/prayers`
- Less ideal (longer URL, Firebase-specific)

### Update QR Code

1. Go to admin area
2. Generate new QR code with stable URL
3. Download high-res PNG
4. Print/engrave new QR code if needed

---

## Step 9: Set Up Automatic Deployments

Firebase App Hosting auto-deploys when you push to the connected branch.

### 9.1 Configure Branch

Main branch is already configured. For preview deployments:

1. In Firebase Console → **App Hosting**
2. Click **Settings**
3. Enable **Preview channels** for pull requests
4. Every PR will get a unique preview URL

### 9.2 Deployment Workflow

```bash
# Make changes locally
git checkout -b my-feature-branch
# ... make changes ...
git add .
git commit -m "feat: my feature"
git push origin my-feature-branch

# Create PR → Firebase creates preview deployment
# Review → Merge → Auto-deploys to production
```

---

## Step 10: Monitoring and Logs

### 10.1 View Deployments

Firebase Console → **App Hosting** → **Deployments**

### 10.2 View Logs

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login
firebase login

# View logs
firebase apphosting:logs --project alex-shitrit-memorial
```

Or in Cloud Console → **Cloud Run** → Select service → **Logs**

### 10.3 Set Up Alerts

1. Cloud Console → **Monitoring** → **Alerting**
2. Create alerts for:
   - High error rate
   - High latency
   - Budget exceeded

---

## Troubleshooting

### Build Fails

Check build logs in Firebase Console:
1. **App Hosting** → **Deployments** → Click failed deployment
2. Review error messages
3. Common issues:
   - Missing environment variables
   - TypeScript errors
   - Missing dependencies

### Secrets Not Working

```bash
# Verify secret exists
gcloud secrets list

# Check secret version
gcloud secrets versions access latest --secret="SUPABASE_URL"

# Verify IAM permissions
gcloud secrets get-iam-policy SUPABASE_URL
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

### High Costs

1. Check Cloud Console → **Billing** → **Reports**
2. Identify cost drivers:
   - Invocations (should be low for memorial site)
   - Bandwidth (optimize images)
   - Minimum instances (keep at 0)
3. Set budget alerts

---

## Alternative: Keep Backend on Supabase

This project uses **Supabase** for backend (database, auth, storage).

### Why Supabase?

✅ **Better for this use case**:
- Postgres with full SQL
- Real-time updates
- Built-in Auth with Google OAuth
- Storage with automatic image optimization
- Row Level Security
- Generous free tier

### Alternative: Firebase Backend

If you want to use Firebase for backend:

**Pros**:
- Single vendor (simplicity)
- Integrated with Firebase Auth
- Firestore real-time updates

**Cons**:
- NoSQL (less flexible than SQL for relational data)
- More expensive at scale
- No built-in storage optimization
- Migration effort required

**Recommendation**: **Keep Supabase** unless you have a strong reason to migrate.

---

## Cost Optimization Tips

1. **Keep minInstances at 0** - Scale to zero when idle
2. **Optimize images** - Use Next.js Image optimization
3. **Cache aggressively** - Static pages cached at edge
4. **Monitor usage** - Set up budget alerts
5. **Use preview channels** - Test before deploying to prod

---

## Security Checklist

- [x] Secrets stored in Cloud Secret Manager (not in code)
- [x] Service account permissions restricted
- [x] Custom domain with SSL (auto-configured)
- [x] Supabase RLS policies active
- [x] Environment variables not exposed client-side
- [x] Budget alerts configured

---

## Deployment Checklist

- [ ] Firebase project created (Blaze plan)
- [ ] Secrets created in Secret Manager
- [ ] IAM permissions granted
- [ ] GitHub repository connected
- [ ] Initial deployment successful
- [ ] Site URL updated in apphosting.yaml
- [ ] Custom domain added and verified
- [ ] QR code regenerated with stable URL
- [ ] Monitoring and alerts configured
- [ ] Test all pages (especially /prayers)
- [ ] Verify azkara date calculation
- [ ] Test auth flow (Google + Email)
- [ ] Test admin area
- [ ] Test content moderation workflow

---

## Support

- [Firebase App Hosting Docs](https://firebase.google.com/docs/app-hosting)
- [Next.js on Firebase](https://firebase.google.com/docs/hosting/frameworks/nextjs)
- [Cloud Secret Manager](https://cloud.google.com/secret-manager/docs)
- [Firebase Pricing](https://firebase.google.com/pricing)

---

**Status**: Ready for deployment once Supabase is configured.

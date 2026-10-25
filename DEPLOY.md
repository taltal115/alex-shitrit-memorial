# Deployment Guide

The site is Firebase only.

- **Firebase Hosting** serves the static Next.js export.
- **Firebase Authentication** signs admins in with Google or email.
- **Cloud Firestore** stores prayers, the memorial record, roles, and the audit log.
- **Cloud Storage** is reserved for family media.

## 1. Web app config

In the Firebase console for `alex-shitrit-memorial`:

1. Project settings → Your apps → add a Web app if one does not exist.
2. Copy the config into `.env.local` (see `.env.example`).
3. Authentication → Sign-in method → enable Google and Email/Password.
4. Authentication → Settings → Authorized domains: `localhost` and `alex-shitrit-memorial.web.app`.

The first admin is the allowlisted Google account in `src/config/admins.ts` and `firestore.rules`. Add another family email in both places, then redeploy the rules.

## 2. Rules

```bash
firebase deploy --only firestore:rules,storage
```

## 3. Build and publish the site

```bash
npm install
npm run build
firebase deploy --only hosting
```

The public URL is https://alex-shitrit-memorial.web.app

Until the web config is in `.env.local`, the prayers page uses the bundled texts and the admin screens open without a live database. After the keys are set, rebuild and deploy so the browser can reach Firestore.

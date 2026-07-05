# Perfecting The Saints IJN Foundation Website

## Current Status

The public website is ready to build and deploy as a modern static website.

The admin page is included for local editing, testing, backups, and content preparation. It is protected with a passcode gate, but it is still a front-end-only admin. A front-end-only admin cannot be made fully hacker-proof because all browser code is visible to visitors.

## Safe Deployment Recommendation

For the public launch:

1. Deploy the public website to Netlify.
2. Configure Supabase and add the environment variables below in Netlify.
3. Run `supabase_setup.sql` in the Supabase SQL Editor.
4. Create an admin user in Supabase Authentication.
5. Use `/admin` to log in with the Supabase admin email and password.

## Supabase and media uploads

This project only stores uploaded images and videos persistently when Supabase is configured.

- If Supabase is not configured, the admin still loads, but uploaded media is stored as browser-only data URLs and will not be available after you close or redeploy the site.
- For real deployment with uploaded media, use Supabase Storage and the correct environment values.

## Local Admin Passcode

The local admin passcode is controlled by:

```bash
VITE_ADMIN_PASSCODE=PTS-IJN-2026
```

This fallback is only used when Supabase is not configured or the provided Supabase values are placeholders.

## Production Environment

Use these production settings in Netlify:

```bash
VITE_ENABLE_LOCAL_ADMIN=true
VITE_SUPABASE_URL=<your-supabase-url>
VITE_SUPABASE_ANON_KEY=<your-supabase-anon-public-key>
```

Then configure Supabase Storage and Authentication so `/admin` works with your real login and uploaded media is saved off-browser.

## Netlify environment setup

1. Open your Netlify site settings.
2. Navigate to "Build & deploy" → "Environment".
3. Add these variables:

   - `VITE_ENABLE_LOCAL_ADMIN=true`
   - `VITE_SUPABASE_URL=<your-supabase-url>`
   - `VITE_SUPABASE_ANON_KEY=<your-supabase-anon-public-key>`
   - `VITE_ADMIN_PASSCODE=PTS-IJN-2026` (or a stronger custom passcode)

4. Redeploy the site.

## Commands

Install dependencies:

```bash
npm install
```

Run locally:

```bash
npm run dev
```

Build for deployment:

```bash
npm run build
```

Preview the production build:

```bash
npm run preview
```

## Commands

Install dependencies:

```bash
npm install
```

Run locally:

```bash
npm run dev
```

Build for deployment:

```bash
npm run build
```

Preview the production build:

```bash
npm run preview
```

## Hosting Security

Security headers have been added for:

- Netlify-compatible hosts: `public/_headers`
- Vercel: `vercel.json`

These headers help protect against clickjacking, unsafe browser permissions, MIME sniffing, and overly broad content loading.

## Media Upload Warning

The admin now uploads media to Supabase Storage when Supabase is configured.

The project target is now 2GB per media file, but 2GB uploads require backend/cloud storage. Do not upload large videos into browser storage.

For production media management, use cloud storage such as:

- Supabase Storage
- Firebase Storage
- Cloudinary
- Uploadcare
- Your web host's file storage

Recommended path for this project:

1. Run `supabase_setup.sql`.
2. Add the Supabase environment variables to Netlify.
3. Redeploy.
4. Log in at `/admin`.
5. Upload founder photos, gallery images, and videos.
6. Click `Save Changes`.

For very large files, use Supabase resumable uploads or S3-compatible uploads instead of sending the file through Netlify.

## Before Launch Checklist

1. Add final founder and co-founder photos.
2. Add final donation account details.
3. Add real social media URLs.
4. Add real announcements.
5. Export a backup from the admin.
6. Build successfully with `npm run build`.
7. Deploy with Supabase environment variables added in Netlify.
8. Test the deployed public site on phone and desktop.
9. Confirm `/admin` requires your Supabase email/password.

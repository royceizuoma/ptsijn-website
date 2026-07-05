# Perfecting The Saints IJN Foundation Website

## Current Status

This project now runs as a static Vite website with a local admin workflow.

The admin page is for local content updates, file path preparation, and backups. It is protected by a browser passcode stored in `VITE_ADMIN_PASSCODE`.

## Deployment Recommendation

For a Netlify deployment:

1. Deploy the static website.
2. Set `VITE_ENABLE_LOCAL_ADMIN=true` in Netlify.
3. Set `VITE_ADMIN_PASSCODE` to a strong passcode.
4. Deploy the site.
5. Open `/admin` and use the passcode to unlock editing.

## Local static media workflow

This admin stores content in `localStorage`. Uploaded media files are not uploaded to a remote service during runtime.

- Files added in the admin are recorded as static references like `/media/<category>/<filename>`.
- To make images or video files live, copy them into `public/media/<category>/` locally and redeploy the site.
- `public/media/leaders/` is the folder for founder/co-founder photos.

## Admin passcode

Use this environment variable for local admin access:

```bash
VITE_ADMIN_PASSCODE=PTS-IJN-2026
```

If you do not set `VITE_ADMIN_PASSCODE`, the site uses the default passcode above.

## Recommended Netlify environment variables

```bash
VITE_ENABLE_LOCAL_ADMIN=true
VITE_ADMIN_PASSCODE=your-strong-passcode
```

Then redeploy the site.

## Netlify environment setup

1. Open your Netlify site settings.
2. Navigate to "Build & deploy" → "Environment".
3. Add these variables:

   - `VITE_ENABLE_LOCAL_ADMIN=true`
   - `VITE_ADMIN_PASSCODE=<your-passcode>`

4. Redeploy.

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

## Hosting security

Security headers are configured in `public/_headers` and `vercel.json`.

## Media upload guidance

This admin creates metadata references for local static media. It does not upload files at runtime.

Recommended workflow:

1. Choose images or videos in `/admin` to generate paths.
2. Copy the selected files into `public/media/<category>/` locally.
3. Save changes in the admin.
4. Redeploy the site.

For leader photos, use `public/media/leaders/`.

## Before launch checklist

1. Add final founder and co-founder photos.
2. Add donation account details.
3. Add real social media URLs.
4. Add announcements.
5. Export a backup from the admin.
6. Run `npm run build` successfully.
7. Deploy to Netlify.
8. Confirm `/admin` opens with the passcode.

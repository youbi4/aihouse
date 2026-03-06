# UHBC Auth Project

## Overview
A static HTML/CSS/JavaScript authentication UI (login, register, forgot password) for UHBC. Uses Supabase for auth. Migrated from Vercel to Replit.

## Structure
- `index.html` — login + register + forgot-password UI
- `homepage.html` — post-login homepage
- `script.js` — auth logic using Supabase JS client
- `homepage.js` / `js/auth.js` — homepage and shared auth helpers
- `styles.css` / `homepage.css` / `css/` — stylesheets
- `assets/` — SVG logos and background image
- `server.js` — Node.js static file server (port 5000)
- `vercel.json` — legacy Vercel config (headers only, kept for reference)

## Running
The app is served by `server.js` on port 5000 via the "Start application" workflow.

```
node server.js
```

## Security
- CSP header applied server-side: allows scripts from `self`, `cdn.jsdelivr.net`, and `unpkg.com`
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: SAMEORIGIN`

## Supabase
The Supabase URL and anon key are embedded in `script.js` and `js/auth.js`. The anon key is safe to expose client-side (it's a public key), but make sure Supabase Row Level Security (RLS) is enabled on all tables.

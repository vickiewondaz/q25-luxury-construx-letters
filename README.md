# Q25 Luxury Construx — Official Letter App

Production-ready, responsive web app for writing and exporting official company letters on authentic letterhead. Glassmorphism + Apple HIG design, white/black/gold palette, Nunito Sans typography, live A4 preview, PDF export with embedded fonts and signature.

**Company:** Q25 LUXURY CONSTRUX — RC 8786514  
**Owner:** Olalekan Sanusi — CEO

## Features

- **Secure Login:** Supabase Auth (email + password). Roles: Admin (CEO) and Staff. Demo mode works without Supabase (local storage).
- **Letter Editor:** Date (auto-filled), auto-generated reference `Q25/2026/001`, recipient name/title/address, subject, salutation, rich-text body (bold/italic/underline, bullets, numbered, alignment), closing line.
- **Live A4 Preview:** Real letterhead behind text. Page 1 uses `letter1.png`, all later pages use `letter2.png`. Content flows automatically, respects header/footer safe zones. Adjustable margins (sensible defaults: P1 top 155, bottom 110, P2 top 68, bottom 78).
- **Auto Sign-off:** 
  ```
  Yours sincerely,
  [signature]
  Olalekan Sanusi
  CEO
  ```
  Kept together (never orphaned), toggle on/off.
- **Export:** PDF (A4, selectable text, letterhead + fonts + signature embedded via pdf-lib, lazy-loaded), Print, Web Share API.
- **Templates:** Save current letter as template, reuse.
- **Archive:** Auto-save drafts every 1.2s with Saved/Unsaved indicator, frosted card list newest first, search by recipient/subject/reference, filter by status/date/year, open to view/edit (drafts only), duplicate, re-download PDF, finalised locked, soft delete with Trash (restore within 30 days), export CSV or ZIP of PDFs.
- **Security:** Supabase RLS on every table, public anon key only in browser, HTTPS.

## Tech

- React + Vite
- Supabase (Postgres, Auth, Storage)
- pdf-lib for PDF (lazy), jszip + file-saver for backup (lazy)
- Nunito Sans WOFF2 bundled locally + TTF for PDF embedding
- Glassmorphism, Apple HIG, responsive (sidebar desktop, iOS bottom tab mobile), light/dark mode

## Setup — Supabase (Free Plan)

1. Create project at supabase.com
2. SQL Editor → run `supabase/schema.sql` (included). It creates:
   - `profiles` (id, email, role)
   - `letters` (id, user_id, reference_no unique, status draft/final/sent, recipient fields, subject, body, letter_date, signature_applied, pdf_url, is_deleted, timestamps)
   - `templates`
   - Indexes on reference_no, recipient, subject, letter_date
   - Function `generate_reference_no()` → `Q25/YYYY/NNN` sequential
   - RLS enabled, policies for own letters + admin all
   - Trigger for new user → profile with role (admin if email contains ceo)
3. Storage → create bucket `letter-pdfs` (private). Add policies (commented in schema.sql) or set via dashboard: allow authenticated upload/select/update/delete where bucket_id = 'letter-pdfs'.
4. Auth → enable Email provider.
5. Get URL and anon key from Project Settings → API.

## Local Dev

```bash
npm install
cp .env.example .env
# edit .env with your Supabase URL and anon key
npm run dev
# open http://localhost:5173
```

Without Supabase env, app runs in demo localStorage mode — great for offline testing.

## Deploy (Static Site, HTTPS)

### Vercel
- Push to GitHub, import in Vercel, add env vars `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, deploy.
- Custom domain → Vercel gives HTTPS auto.

### Netlify / Cloudflare Pages
- Build command: `npm run build`
- Publish dir: `dist`
- Env vars same.
- `_redirects` file included for SPA routing.

Fonts and letterhead PNGs are cached via browser cache (hashed assets). PDF libs are lazy-loaded.

## File Structure

```
public/
  letter1.png (page1 background)
  letter2.png (continuation)
  sign.png (CEO signature)
  logo.png (branding, favicon, OG image)
  fonts/ NunitoSans-*.woff2 + .ttf
src/
  App.jsx (all UI, editor, preview, archive)
  supabase/client.js + schema.sql
supabase/schema.sql (run once)
```

## Usage Flow

1. Login (admin = CEO can finalise & sign)
2. Compose → see live preview on real letterhead
3. Auto-save → archive
4. Export PDF → ends with CEO name, position, signature automatically
5. Archive → search, duplicate, backup CSV/ZIP

## Design Notes

- Colors: white, black, gold #C9A227–#D4AF37 only. Gold for buttons/active.
- Glass: `backdrop-filter: blur(24px) saturate(180%)`, 1px translucent border, 20-28px radius, soft shadows.
- Typography: Nunito Sans 500 body, 700 headings, 800 titles, bundled WOFF2 via @font-face, embedded in PDF.
- Animations: spring cubic-bezier(0.16,1,0.3,1), iOS tab bar.

## License

Internal use for Q25 Luxury Construx.

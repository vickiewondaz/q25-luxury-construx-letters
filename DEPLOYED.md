# Deployed 🚀

**Netlify Production:** https://q25-luxury-construx-letters.netlify.app
**Admin:** https://app.netlify.com/projects/q25-luxury-construx-letters
**Project ID:** 3299d4f5-c29d-44fd-acc4-e85a894aa03d

## GitHub - Push Instructions

Repo is already initialized locally with 1 commit.

### Option A - Create new repo on GitHub (web)
1. Go to https://github.com/new
2. Name: `q25-luxury-construx-letters`
3. Don't init with README
4. Then run:

```bash
cd /home/user/q25-letter-app
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/q25-luxury-construx-letters.git
git push -u origin main
```

### Option B - If you have a Personal Access Token
Provide your GitHub token and repo URL, I can push for you:

```bash
git remote add origin https://<token>@github.com/username/repo.git
git push -u origin main
```

### Current local log
```
8944480 feat: Q25 Luxury Construx official letter app - glassmorphism, live A4 preview, PDF export, Supabase RLS, archive, templates
```

## Netlify - Already Deployed

Deployed via CLI with your token `nfp_chk...`.

- Build command: `npm run build`
- Publish: `dist`
- Redirects: SPA `/* -> /index.html`
- HTTPS: auto enabled
- Custom domain: Netlify dashboard → Domain settings → Add custom domain

To redeploy:
```bash
export NETLIFY_AUTH_TOKEN=nfp_...
npx netlify deploy --dir=dist --prod
```

Or connect GitHub repo to Netlify for auto-deploys:
Netlify Dashboard → Add new site → Import from GitHub → select repo → build settings already in netlify.toml

## Supabase Env Vars (optional)

In Netlify dashboard → Site settings → Environment variables, add:
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```
Then redeploy. Without them, app runs in demo localStorage mode.

## What's Live

- Glassmorphism UI, white/black/gold, Nunito Sans
- Live A4 preview with real letterheads (Page1 letter1.png, rest letter2.png)
- PDF export with embedded fonts + signature
- Archive, templates, trash, CSV/ZIP backup
- Secure login (Supabase Auth or demo)

RC 8786514 — Q25 Luxury Construx

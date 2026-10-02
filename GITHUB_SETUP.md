# Create GitHub Repo — Step by Step

Repo name: **q25-luxury-construx-letters**

## Option 1: Via GitHub Website (easiest, no token needed for creation)

1. Go to https://github.com/new
2. Repository name: `q25-luxury-construx-letters`
3. Description: `Official letter app for Q25 Luxury Construx - glassmorphism, live A4 preview, PDF export`
4. Visibility: Private (or Public)
5. **Do NOT** check "Add a README", .gitignore, license — we already have them
6. Click **Create repository**
7. On next page, copy the HTTPS URL, e.g. `https://github.com/YOUR_USERNAME/q25-luxury-construx-letters.git`

8. Then in your terminal (or in this workspace, I already did steps 1-3):

```bash
cd /home/user/q25-letter-app
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/q25-luxury-construx-letters.git
git push -u origin main
```

If it asks for username/password, use:
- Username: your GitHub username
- Password: a Personal Access Token (see Option 2)

## Option 2: Create Personal Access Token (to let me push for you)

1. Go to https://github.com/settings/tokens
2. Click **Generate new token → Fine-grained** (or Classic)
3. For Fine-grained:
   - Name: `q25-deploy`
   - Expiration: 7 days
   - Repository access: All repositories (or Only select → you can select after creation)
   - Permissions → Repository → Contents: Read and write
4. For Classic:
   - Check `repo` scope
5. Generate and copy token (starts with `ghp_` or `github_pat_`)

6. Paste it here in chat, I'll run:

```bash
git remote add origin https://<TOKEN>@github.com/USERNAME/q25-luxury-construx-letters.git
git push -u origin main
```

After push, you can delete the token.

## Option 3: GitHub CLI (if installed)

```bash
gh auth login
gh repo create q25-luxury-construx-letters --private --source=. --remote=origin --push
```

## Current Local Repo Status

```
Branch: master (will rename to main on push)
Commits:
4c80e1f chore: add netlify deploy config and deployed info
8944480 feat: Q25 Luxury Construx official letter app - glassmorphism, live A4 preview, PDF export, Supabase RLS, archive, templates
Files: 28 files, ready
```

## After Push → Connect to Netlify for Auto-Deploys

1. Netlify Dashboard: https://app.netlify.com/projects/q25-luxury-construx-letters
2. Site settings → Build & deploy → Link repository
3. Choose GitHub repo `q25-luxury-construx-letters`
4. Build command: `npm run build`, Publish: `dist` (already in netlify.toml)
5. Add env vars if using Supabase:
   - VITE_SUPABASE_URL
   - VITE_SUPABASE_ANON_KEY
6. Deploy

## Download Zip (if you want manual upload)

The workspace folder `/home/user/q25-letter-app` is ready. You can download as zip from Arena file explorer, or I can create a zip file for you.

---

**Live Netlify:** https://q25-luxury-construx-letters.netlify.app

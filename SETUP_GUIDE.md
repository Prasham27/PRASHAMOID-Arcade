# Setup Guide — PRASHAMOID ARCADE

Everything you need to deploy + light up the optional features.

## 1. Deploy as-is (no creds needed)

Push to GitHub → import on Vercel → done. The site builds with zero env vars. Leaderboard runs in-memory + browser-local, contact form returns "OFFLINE", admin route shows "OFFLINE". Everything else works.

## 2. Enable the global leaderboard (Supabase, free tier)

1. Sign up at https://supabase.com (free; no card needed)
2. Create a new project. Wait ~1 min for it to provision.
3. **SQL Editor → New query** — paste + Run:

   ```sql
   create table public.arcade_scores (
     id uuid primary key default gen_random_uuid(),
     name text not null check (char_length(name) = 3),
     score int not null check (score >= 0),
     ip_hash text not null,
     created_at timestamptz default now()
   );
   create index on public.arcade_scores (score desc);
   create index on public.arcade_scores (created_at desc);
   alter table public.arcade_scores enable row level security;
   -- No anon policies — only the service role can read/write.
   ```

4. **Settings → API** — copy:
   - `Project URL` → `SUPABASE_URL`
   - `service_role` key (the secret one, NOT anon) → `SUPABASE_SERVICE_ROLE_KEY`
5. Add both to your Vercel project → Settings → Environment Variables → Production. Redeploy.

After redeploy, `/scores` shows "★ GLOBAL" instead of "◆ LOCAL ONLY". The first real submission also overwrites the lowest seeded score.

## 3. Enable the admin panel

Add to Vercel env vars:

```
ADMIN_USERNAME=your_username
ADMIN_PASSWORD=your_password_here_use_something_long
ADMIN_SESSION_SECRET=any_long_random_string_at_least_32_chars
```

Recommendation: use the **same values as your Batman admin** so you only remember one set. To generate a session secret:

```bash
openssl rand -hex 32
# or
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

After redeploy, hit `/admin` → log in → see visitor analytics.

## 4. Enable the contact form (Resend, free 100 emails/day)

1. Sign up at https://resend.com (free; no card)
2. Either add + verify a custom domain, OR skip — Resend gives you `onboarding@resend.dev` as a no-config sender
3. **API Keys → Create API Key** — copy
4. Add to Vercel env vars:

   ```
   RESEND_API_KEY=re_xxx
   CONTACT_TO_EMAIL=your.real.email@gmail.com
   ```

Redeploy. Messages now reach your inbox.

## 5. (Optional) Boost GitHub rate limit

The unauthenticated API allows 60 req/hour shared across all visitors. To lift to 5000:

1. github.com → Settings → Developer settings → Personal access tokens → **Fine-grained tokens**
2. Generate new token: **no scopes needed** (public-only access is the default)
3. Add to Vercel: `GITHUB_TOKEN=ghp_xxx`

## What if I skip everything?

Everything still works:
- Leaderboard saves to memory + browser localStorage; survives a single session but vanishes on Vercel cold start (~15 min idle)
- Contact form returns "OFFLINE" — nobody reaches you
- Admin route returns "OFFLINE"
- GitHub stats may rate-limit if you get a viral spike

Add credentials incrementally as you need them.

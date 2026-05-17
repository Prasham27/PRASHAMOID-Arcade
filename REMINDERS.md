# REMINDERS — things you (Prasham) need to do yourself

These are user-action items that I (Claude) can't do for you. Cross them off as you go.

## Before the public ship

- [ ] **Supabase project** for the global leaderboard. See `SETUP_GUIDE.md §2`. Copy the SQL exactly — the table + indexes + RLS are all required. Without this the leaderboard is local-only.
- [ ] **Vercel env vars** — add the ones you want lit up (`SETUP_GUIDE.md §2-5`). At minimum: `ADMIN_USERNAME`, `ADMIN_PASSWORD`, `ADMIN_SESSION_SECRET` (use the same values as your Batman site so you only remember one).
- [ ] **`NEXT_PUBLIC_SITE_URL`** — set this in Vercel to your final deployed URL once you know it. Used by OG image, sitemap, robots.
- [ ] **Resend** — only needed if you want the contact form to actually email you. Otherwise visitors see "OFFLINE" when they hit submit.

## After deploy — verify by clicking through

- [ ] `/` — INSERT COIN landing, click anywhere → /arcade
- [ ] `/arcade` — all 5 cabinets render, hover floats, click goes to cabinet detail
- [ ] `/cabinet/detective-atpg` — game manual + high scores + tags + next/prev nav
- [ ] `/inventory` — skill power-ups with sprites, heart-rating levels
- [ ] `/levels` — XP-bar timeline of experience
- [ ] `/play` — PRASHAMOID actually plays (A/D rotate, W thrust, SPACE fire)
- [ ] `/scores` — leaderboard shows top 10, GitHub stats below
- [ ] `/comms` — form submits (will say "OFFLINE" without Resend)
- [ ] `/achievements` — 5 cards, unlocked ones colored
- [ ] Backtick (`) key — toggles CRT effect on/off
- [ ] **Konami code** anywhere — ↑↑↓↓←→←→ B A → pink flash → `/dev` becomes accessible
- [ ] `/admin` — login works with your env-var creds (or shows "OFFLINE" if not set)
- [ ] Mobile — visit `/play` on phone, should see DESKTOP ONLY screen; everything else stacks cleanly

## Content polish (later)

- [ ] Real LinkedIn URL in `content/data.ts` — currently a placeholder
- [ ] Update project descriptions if anything's out of date (DETECTive metrics, Gilt Funds writeup, etc.)
- [ ] Optional: add favicon (currently using next/font defaults)

## What I deliberately didn't ship

- No chiptune audio (PDF said don't auto-play)
- No 8-neon-at-once screens (PDF said pick 2 dominant per screen — current site uses pink/cyan/yellow/green but never all four on the same surface)
- No barrel CRT distortion (perf budget; can add later via SVG filter)
- No Arcade Attendant chat — easy to add later via Gemini; currently stubbed as a future achievement target

# PRASHAMOID ARCADE

A 1980s coin-op arcade portfolio for Prasham (B.Tech ICT @ DAU). Built with Next.js 14, TypeScript strict, Tailwind, Framer Motion, Supabase (optional), and a hand-rolled canvas mini-game.

## What's in it

- **/** — INSERT COIN landing (click anywhere or press any key)
- **/arcade** — Cabinet floor (one cabinet per project)
- **/cabinet/[id]** — Project detail styled as a game manual
- **/inventory** — Skills as power-ups with pixel-sprite icons
- **/levels** — Experience as XP-bar progression
- **/play** — PRASHAMOID, a playable Asteroids-variant on canvas
- **/scores** — Top-10 leaderboard + GitHub stats
- **/comms** — Contact form ("PRESS START")
- **/achievements** — Trophy wall (5 achievements)
- **/dev** — Hidden, unlocks after Konami code
- **/admin** — Operator analytics terminal

## Quick start

```bash
npm install
cp .env.example .env.local   # fill in what you have
npm run dev
```

All env vars are **optional** — the site builds and runs without any of them. Features auto-light-up as you add keys:

| Feature | Env vars needed |
|---|---|
| Global high-score leaderboard | `SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY` |
| Contact form actually sends mail | `RESEND_API_KEY` + `CONTACT_TO_EMAIL` |
| Admin panel | `ADMIN_USERNAME` + `ADMIN_PASSWORD` + `ADMIN_SESSION_SECRET` |
| GitHub stats (lifts 60→5000 req/hr) | `GITHUB_TOKEN` |

Without any of them: leaderboard is in-memory + browser-local, contact form returns "OFFLINE", admin route shows "OFFLINE", GitHub uses unauthenticated public API (60 req/hr).

## Easter eggs

- Press **`** (backtick) to toggle CRT effect on/off
- Enter the **Konami code** (↑ ↑ ↓ ↓ ← → ← → B A) anywhere to unlock `/dev`
- Visit every cabinet to unlock COMPLETIONIST

## Stack

- Next.js 14 App Router · TypeScript strict
- Tailwind CSS + CSS variables
- Framer Motion (sparingly)
- Zustand (game state only)
- Supabase (optional, server-side)
- @google/generative-ai (optional, for future assistant)

## Routes the world sees

`/`, `/arcade`, `/cabinet/[id]`, `/inventory`, `/levels`, `/play`, `/scores`, `/comms`, `/achievements`

## Routes that need credentials or are hidden

`/admin` (creds), `/dev` (Konami)

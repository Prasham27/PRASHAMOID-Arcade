import { NextResponse } from 'next/server';
import crypto from 'node:crypto';
import { getSupabase, isSupabaseConfigured } from '@/lib/supabase';
import { SEED_SCORES, type SeedScore } from '@/lib/seed-scores';

export const runtime = 'nodejs';

// In-memory fallback when Supabase isn't configured.
const inMemoryScores: SeedScore[] = [];
const lastSubmitByIp = new Map<string, number>();
const SUBMIT_INTERVAL_MS = 60 * 1000;

function getIp(req: Request): string {
  return (
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    req.headers.get('x-real-ip') ??
    'unknown'
  );
}

function hashIp(ip: string): string {
  const salt = new Date().toISOString().slice(0, 10);
  return crypto.createHash('sha256').update(ip + salt).digest('hex').slice(0, 32);
}

function clampScore(s: number, currentFloor: number): number {
  const cap = Math.max(50_000, currentFloor * 5);
  return Math.min(Math.max(0, Math.floor(s)), cap);
}

export async function GET(): Promise<Response> {
  if (isSupabaseConfigured()) {
    const sb = getSupabase();
    if (sb) {
      const { data, error } = await sb
        .from('arcade_scores')
        .select('name, score, created_at')
        .order('score', { ascending: false })
        .limit(10);
      if (!error && data) {
        const merged = mergeWithSeeds(
          data.map((d) => ({
            name: d.name,
            score: d.score,
            created_at: d.created_at,
          })),
        );
        return NextResponse.json({ scores: merged, mode: 'global' });
      }
    }
  }
  // Fallback
  const merged = mergeWithSeeds(inMemoryScores);
  return NextResponse.json({ scores: merged, mode: 'local' });
}

interface PostBody {
  name?: string;
  score?: number;
}

export async function POST(req: Request): Promise<Response> {
  const ip = getIp(req);
  const last = lastSubmitByIp.get(ip) ?? 0;
  if (Date.now() - last < SUBMIT_INTERVAL_MS) {
    return NextResponse.json(
      { error: 'Slow down — one score per minute.' },
      { status: 429 },
    );
  }

  let body: PostBody;
  try {
    body = (await req.json()) as PostBody;
  } catch {
    return NextResponse.json({ error: 'Invalid body' }, { status: 400 });
  }
  const name = String(body.name ?? '').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 3);
  if (name.length !== 3) {
    return NextResponse.json({ error: 'Name must be 3 letters' }, { status: 400 });
  }
  const scoreNum = Number(body.score);
  if (!Number.isFinite(scoreNum) || scoreNum < 0) {
    return NextResponse.json({ error: 'Invalid score' }, { status: 400 });
  }

  if (isSupabaseConfigured()) {
    const sb = getSupabase();
    if (sb) {
      // Compute current floor for clamp
      const { data: top } = await sb
        .from('arcade_scores')
        .select('score')
        .order('score', { ascending: false })
        .limit(10);
      const floor = top && top.length === 10 ? top[top.length - 1].score : 1000;
      const score = clampScore(scoreNum, floor);
      const { error } = await sb.from('arcade_scores').insert({
        name,
        score,
        ip_hash: hashIp(ip),
      });
      if (error) {
        // Fall through to local on error
      } else {
        lastSubmitByIp.set(ip, Date.now());
        const { data: ranked } = await sb
          .from('arcade_scores')
          .select('score')
          .order('score', { ascending: false })
          .limit(11);
        const rank = ranked
          ? ranked.findIndex((r) => r.score <= score) + 1
          : null;
        return NextResponse.json({
          ok: true,
          rank: rank && rank > 0 ? rank : null,
          mode: 'global',
        });
      }
    }
  }

  // In-memory fallback
  const sortedIM = [...inMemoryScores].sort((a, b) => b.score - a.score);
  const floor = sortedIM.length >= 10 ? sortedIM[9].score : 1000;
  const score = clampScore(scoreNum, floor);
  inMemoryScores.push({ name, score, created_at: new Date().toISOString() });
  inMemoryScores.sort((a, b) => b.score - a.score);
  if (inMemoryScores.length > 50) inMemoryScores.length = 50;
  lastSubmitByIp.set(ip, Date.now());
  const idx = inMemoryScores.findIndex((s) => s.name === name && s.score === score);
  return NextResponse.json({
    ok: true,
    rank: idx + 1,
    mode: 'local',
  });
}

function mergeWithSeeds(real: SeedScore[]): SeedScore[] {
  if (real.length >= 10) {
    return real
      .sort((a, b) => b.score - a.score)
      .slice(0, 10)
      .map((r) => ({ ...r, seed: false }));
  }
  // Pad with seeds, sort, dedupe
  const all = [
    ...real.map((r) => ({ ...r, seed: false })),
    ...SEED_SCORES.filter(
      (s) => !real.some((r) => r.name === s.name && r.score === s.score),
    ),
  ]
    .sort((a, b) => b.score - a.score)
    .slice(0, 10);
  return all;
}

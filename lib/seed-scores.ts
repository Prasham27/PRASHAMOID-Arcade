// Seed leaderboard so an empty board doesn't look broken. Used by the in-memory
// fallback AND merged into the global view if the global has < 10 entries.

export interface SeedScore {
  name: string;
  score: number;
  created_at: string;
  seed?: boolean;
}

const NOW = Date.now();
const days = (n: number) => new Date(NOW - n * 86400_000).toISOString();

export const SEED_SCORES: SeedScore[] = [
  { name: 'PSM', score: 8400, created_at: days(7), seed: true },
  { name: 'JET', score: 6620, created_at: days(6), seed: true },
  { name: 'SAG', score: 5480, created_at: days(5), seed: true },
  { name: 'ION', score: 4710, created_at: days(4), seed: true },
  { name: 'NEO', score: 4220, created_at: days(3), seed: true },
  { name: 'ATM', score: 3580, created_at: days(3), seed: true },
  { name: 'XOR', score: 2940, created_at: days(2), seed: true },
  { name: 'BIT', score: 2200, created_at: days(2), seed: true },
  { name: 'AAA', score: 1540, created_at: days(1), seed: true },
  { name: 'ZZZ', score: 880, created_at: days(1), seed: true },
];

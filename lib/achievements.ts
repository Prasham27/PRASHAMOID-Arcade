export type AchievementId =
  | 'BOOTED_UP'
  | 'ALL_CABINETS_VISITED'
  | 'GAME_PLAYED'
  | 'HIGH_SCORE'
  | 'KONAMI_UNLOCKED';

export interface Achievement {
  id: AchievementId;
  name: string;
  description: string;
  rarity: 'common' | 'rare' | 'legendary';
}

export const ACHIEVEMENTS: Record<AchievementId, Achievement> = {
  BOOTED_UP: {
    id: 'BOOTED_UP',
    name: 'INSERT COIN',
    description: 'Powered on the cabinet for the first time.',
    rarity: 'common',
  },
  ALL_CABINETS_VISITED: {
    id: 'ALL_CABINETS_VISITED',
    name: 'COMPLETIONIST',
    description: 'Walked every cabinet on the arcade floor.',
    rarity: 'rare',
  },
  GAME_PLAYED: {
    id: 'GAME_PLAYED',
    name: 'PILOT',
    description: 'Flew at least one PRASHAMOID run to game-over.',
    rarity: 'common',
  },
  HIGH_SCORE: {
    id: 'HIGH_SCORE',
    name: 'TOP TEN',
    description: 'Made it onto the global leaderboard.',
    rarity: 'rare',
  },
  KONAMI_UNLOCKED: {
    id: 'KONAMI_UNLOCKED',
    name: 'CHEATER',
    description: 'Entered the secret arcade-operator code.',
    rarity: 'legendary',
  },
};

export const STORAGE_KEY = 'arcade.achievements';
// Bumped from 'arcade.visited' → '.v2' after renaming SectionId values
// (old stored ids like 'about' would never satisfy the new schema).
export const CABINETS_VISITED_KEY = 'arcade.visited.v2';

export function readUnlocked(): Set<AchievementId> {
  if (typeof window === 'undefined') return new Set();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return new Set();
    const arr = JSON.parse(raw) as AchievementId[];
    return new Set(arr);
  } catch {
    return new Set();
  }
}

export function writeUnlocked(set: Set<AchievementId>): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify([...set]));
  } catch {
    /* ignore quota errors */
  }
}

export function unlock(
  id: AchievementId,
): { newlyUnlocked: boolean; achievement: Achievement } {
  const set = readUnlocked();
  const newlyUnlocked = !set.has(id);
  if (newlyUnlocked) {
    set.add(id);
    writeUnlocked(set);
  }
  return { newlyUnlocked, achievement: ACHIEVEMENTS[id] };
}

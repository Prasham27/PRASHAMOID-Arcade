'use client';

import { useEffect, useState } from 'react';
import {
  ACHIEVEMENTS,
  type AchievementId,
  readUnlocked,
} from '@/lib/achievements';
import { PixelText } from '@/components/effects/PixelText';

const rarityColor = {
  common: 'border-cyan text-cyan phosphor-cyan',
  rare: 'border-yellow text-yellow phosphor-yellow',
  legendary: 'border-pink text-pink phosphor-pink',
};

export default function AchievementsPage() {
  const [unlocked, setUnlocked] = useState<Set<AchievementId>>(new Set());

  useEffect(() => {
    setUnlocked(readUnlocked());
  }, []);

  const list = Object.values(ACHIEVEMENTS);
  const unlockedCount = list.filter((a) => unlocked.has(a.id)).length;

  return (
    <div className="mx-auto max-w-4xl px-6 pb-24 pt-12 md:px-10 md:pt-16">
      <header className="mb-10">
        <p className="font-pixel text-[10px] tracking-widest text-text-muted">
          TROPHY WALL //
        </p>
        <h1 className="mt-3 font-pixel text-2xl text-yellow phosphor-yellow md:text-4xl">
          ACHIEVEMENTS
        </h1>
        <p className="mt-4 font-body text-base text-text-dim md:text-lg">
          {unlockedCount} of {list.length} unlocked.
        </p>
      </header>

      <ul className="grid gap-4 sm:grid-cols-2">
        {list.map((a) => {
          const isUnlocked = unlocked.has(a.id);
          const palette = rarityColor[a.rarity];
          return (
            <li
              key={a.id}
              className={`border-2 p-4 ${
                isUnlocked ? palette : 'border-border'
              } ${!isUnlocked ? 'opacity-50' : ''}`}
            >
              <PixelText
                size="xs"
                color={
                  !isUnlocked
                    ? 'text-dim'
                    : a.rarity === 'common'
                      ? 'cyan'
                      : a.rarity === 'rare'
                        ? 'yellow'
                        : 'pink'
                }
              >
                ★ {isUnlocked ? 'UNLOCKED' : 'LOCKED'}
              </PixelText>
              <p className="mt-2 font-pixel text-sm text-text">{a.name}</p>
              <p className="mt-2 font-body text-base text-text-dim">
                {isUnlocked ? a.description : '???'}
              </p>
              <p className="mt-3 font-pixel text-[9px] tracking-widest text-text-muted">
                RARITY // {a.rarity.toUpperCase()}
              </p>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

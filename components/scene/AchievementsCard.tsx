'use client';

import { useEffect, useState } from 'react';
import {
  ACHIEVEMENTS,
  readUnlocked,
  STORAGE_KEY,
  type AchievementId,
} from '@/lib/achievements';

const TOTAL = Object.keys(ACHIEVEMENTS).length;

/** Bottom-right HUD: "X / N UNLOCKED" with progress bar. Hidden under 1500px. */
export function AchievementsCard() {
  const [unlocked, setUnlocked] = useState<Set<AchievementId>>(new Set());

  useEffect(() => {
    setUnlocked(readUnlocked());
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) setUnlocked(readUnlocked());
    };
    window.addEventListener('storage', onStorage);
    // Also re-poll occasionally — same-tab unlocks won't fire storage events.
    const t = window.setInterval(() => setUnlocked(readUnlocked()), 1500);
    return () => {
      window.removeEventListener('storage', onStorage);
      window.clearInterval(t);
    };
  }, []);

  const count = unlocked.size;
  const pct = Math.round((count / TOTAL) * 100);

  return (
    <div
      className="pointer-events-none fixed right-3 bottom-3 z-40 hidden min-[1500px]:block"
      style={{ width: 200 }}
    >
      <div
        className="relative border-2 border-yellow p-2 font-pixel"
        style={{
          background:
            'linear-gradient(180deg, rgba(28,4,41,0.92) 0%, rgba(11,0,20,0.92) 100%)',
          boxShadow:
            '0 0 14px rgba(255,230,0,0.4), 0 0 28px rgba(255,230,0,0.15), inset 0 0 0 1px rgba(255,230,0,0.25)',
        }}
      >
        <CornerTicks color="#ffe600" />

        <div
          className="text-[10px] tracking-widest text-yellow"
          style={{
            textShadow: '0 0 4px #ffe600, 0 0 10px rgba(255,230,0,0.4)',
          }}
        >
          ACHIEVEMENTS
        </div>
        <div className="mt-1 flex items-baseline justify-between">
          <span
            className="text-[14px] tracking-widest text-text"
            style={{ lineHeight: '14px' }}
          >
            {count} / {TOTAL}
          </span>
          <span className="text-[8px] tracking-widest text-text-muted">
            UNLOCKED
          </span>
        </div>
        <div
          className="relative mt-2 border border-yellow"
          style={{
            height: 6,
            background: '#04000a',
            boxShadow: 'inset 0 0 4px rgba(0,0,0,0.8)',
          }}
        >
          <div
            className="absolute left-0 top-0 h-full"
            style={{
              width: `${pct}%`,
              background:
                'linear-gradient(90deg, #ffe600 0%, #39ff14 100%)',
              boxShadow:
                '0 0 6px #ffe600, inset 0 -1px 0 rgba(0,0,0,0.4)',
              transition: 'width 200ms ease-out',
            }}
          />
        </div>
      </div>
    </div>
  );
}

function CornerTicks({ color }: { color: string }) {
  const tick = (
    style: React.CSSProperties,
  ): React.CSSProperties => ({
    position: 'absolute',
    width: 4,
    height: 4,
    background: color,
    boxShadow: `0 0 4px ${color}`,
    ...style,
  });
  return (
    <>
      <span style={tick({ left: -2, top: -2 })} />
      <span style={tick({ right: -2, top: -2 })} />
      <span style={tick({ left: -2, bottom: -2 })} />
      <span style={tick({ right: -2, bottom: -2 })} />
    </>
  );
}

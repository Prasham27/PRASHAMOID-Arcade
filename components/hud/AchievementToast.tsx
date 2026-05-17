'use client';

import { useEffect } from 'react';
import type { Achievement } from '@/lib/achievements';

export interface AchievementToastProps {
  achievement: Achievement;
  onDismiss: () => void;
  /** auto-dismiss after N ms (default 4000) */
  durationMs?: number;
}

const rarityColor: Record<Achievement['rarity'], { border: string; text: string }> = {
  common: { border: 'border-cyan', text: 'text-cyan phosphor-cyan' },
  rare: { border: 'border-yellow', text: 'text-yellow phosphor-yellow' },
  legendary: { border: 'border-pink', text: 'text-pink phosphor-pink' },
};

export function AchievementToast({
  achievement,
  onDismiss,
  durationMs = 4000,
}: AchievementToastProps) {
  useEffect(() => {
    const t = window.setTimeout(onDismiss, durationMs);
    return () => window.clearTimeout(t);
  }, [durationMs, onDismiss]);

  const palette = rarityColor[achievement.rarity];

  return (
    <div
      role="status"
      aria-live="polite"
      className={`pointer-events-auto border-2 bg-bg-2/95 p-4 backdrop-blur-sm ${palette.border}`}
      style={{ minWidth: 280 }}
    >
      <p className={`font-pixel text-[10px] tracking-widest ${palette.text}`}>
        ★ ACHIEVEMENT UNLOCKED //
      </p>
      <p className="mt-2 font-pixel text-sm text-text">{achievement.name}</p>
      <p className="mt-2 font-body text-xs leading-relaxed text-text-dim">
        {achievement.description}
      </p>
      <p className="mt-2 font-pixel text-[9px] tracking-widest text-text-muted">
        RARITY // {achievement.rarity.toUpperCase()}
      </p>
    </div>
  );
}

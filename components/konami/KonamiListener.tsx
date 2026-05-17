'use client';

import { useEffect } from 'react';
import { KONAMI_SEQUENCE, KONAMI_UNLOCKED_KEY, matchesKonami } from '@/lib/konami';
import { unlock } from '@/lib/achievements';
import { useAchievementBus } from './achievementBus';

/** Listens for the Konami code anywhere in the document. On match:
 *   - sets localStorage[arcade.konami] = '1' (unlocks /dev for the session)
 *   - emits a screen flash event + unlocks KONAMI_UNLOCKED achievement
 */
export function KonamiListener() {
  const { push } = useAchievementBus();

  useEffect(() => {
    const buffer: string[] = [];
    const onKey = (e: KeyboardEvent) => {
      // Use e.code so it's layout-independent for the arrow / letter keys
      buffer.push(e.code);
      if (buffer.length > KONAMI_SEQUENCE.length) buffer.shift();
      if (matchesKonami(buffer)) {
        try {
          window.localStorage.setItem(KONAMI_UNLOCKED_KEY, '1');
        } catch {
          /* ignore */
        }
        // Brief screen flash
        const flash = document.createElement('div');
        flash.style.cssText =
          'position:fixed;inset:0;background:#ff2c9f;opacity:0.35;z-index:99999;pointer-events:none;transition:opacity 400ms linear;';
        document.body.appendChild(flash);
        requestAnimationFrame(() => {
          flash.style.opacity = '0';
        });
        window.setTimeout(() => flash.remove(), 500);

        const { newlyUnlocked, achievement } = unlock('KONAMI_UNLOCKED');
        if (newlyUnlocked) push(achievement);
        // Clear buffer so it can re-trigger after a fresh entry
        buffer.length = 0;
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [push]);

  return null;
}

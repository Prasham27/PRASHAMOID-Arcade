'use client';

import { useEffect } from 'react';
import { CABINETS_VISITED_KEY, unlock } from '@/lib/achievements';
import { useAchievementBus } from '@/components/konami/achievementBus';
import { content } from '@/content/data';

interface Props {
  id: string;
}

/** Adds this cabinet's id to the visited set; fires
 *  ALL_CABINETS_VISITED if the player has now seen every cabinet.
 */
export function VisitTracker({ id }: Props) {
  const push = useAchievementBus((s) => s.push);
  useEffect(() => {
    let set: Set<string>;
    try {
      const raw = window.localStorage.getItem(CABINETS_VISITED_KEY);
      set = raw ? new Set(JSON.parse(raw) as string[]) : new Set();
    } catch {
      set = new Set();
    }
    if (set.has(id)) return;
    set.add(id);
    try {
      window.localStorage.setItem(
        CABINETS_VISITED_KEY,
        JSON.stringify([...set]),
      );
    } catch {
      /* ignore */
    }

    const allIds = content.projects.map((p) => p.id);
    if (allIds.every((projectId) => set.has(projectId))) {
      const { newlyUnlocked, achievement } = unlock('ALL_CABINETS_VISITED');
      if (newlyUnlocked) push(achievement);
    }
  }, [id, push]);

  return null;
}

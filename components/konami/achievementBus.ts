'use client';

import { create } from 'zustand';
import type { Achievement } from '@/lib/achievements';

interface State {
  queue: Achievement[];
  push: (a: Achievement) => void;
  shift: () => void;
}

export const useAchievementBus = create<State>((set) => ({
  queue: [],
  push: (a) =>
    set((s) => {
      // De-dupe: if same id already queued, no-op
      if (s.queue.some((q) => q.id === a.id)) return s;
      return { queue: [...s.queue, a] };
    }),
  shift: () =>
    set((s) => ({
      queue: s.queue.slice(1),
    })),
}));

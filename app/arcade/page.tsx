'use client';

import Link from 'next/link';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { CABINETS_VISITED_KEY, unlock } from '@/lib/achievements';
import { useAchievementBus } from '@/components/konami/achievementBus';
import {
  ArcadeRoom,
  SCENE_WIDTH,
  SECTION_CABINETS,
  type SectionId,
} from '@/components/scene/ArcadeRoom';
import { cn } from '@/lib/cn';

/** Mobile-fallback config: same 5 sections + a "PLAY THE GAME" tile. */
const SECTION_TILE_COLOR = {
  pink: 'border-pink text-pink phosphor-pink',
  cyan: 'border-cyan text-cyan phosphor-cyan',
  yellow: 'border-yellow text-yellow phosphor-yellow',
  green: 'border-green text-green phosphor-green',
} as const;

const SECTION_DESCRIPTIONS: Record<SectionId, string> = {
  about: 'Who I am, what I work on, where to find me.',
  projects: 'GNN ATPG, gilt funds, polar codes, PODEM and more.',
  experience: 'Education, open-source contributions, coursework.',
  skills: 'Languages, ML stack, hardware, theory — rated.',
  contact: 'Drop a coin. Send a signal.',
};

export default function ArcadeFloorPage() {
  const [visited, setVisited] = useState<Set<SectionId>>(new Set());
  const [isDesktop, setIsDesktop] = useState<boolean | null>(null);
  const [reduced, setReduced] = useState(false);
  const push = useAchievementBus((s) => s.push);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(CABINETS_VISITED_KEY);
      if (raw) setVisited(new Set(JSON.parse(raw) as SectionId[]));
    } catch {
      /* ignore */
    }
  }, []);

  // Responsive: desktop only when viewport >= 1280px AND fine pointer
  useEffect(() => {
    const wide = window.matchMedia('(min-width: 1280px)');
    const fine = window.matchMedia('(pointer: fine)');
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const apply = () => {
      setIsDesktop(wide.matches && fine.matches);
      setReduced(motion.matches);
    };
    apply();
    wide.addEventListener('change', apply);
    fine.addEventListener('change', apply);
    motion.addEventListener('change', apply);
    return () => {
      wide.removeEventListener('change', apply);
      fine.removeEventListener('change', apply);
      motion.removeEventListener('change', apply);
    };
  }, []);

  const recordVisit = useCallback((id: SectionId) => {
    setVisited((prev) => {
      if (prev.has(id)) return prev;
      const next = new Set(prev);
      next.add(id);
      try {
        window.localStorage.setItem(
          CABINETS_VISITED_KEY,
          JSON.stringify([...next]),
        );
      } catch {
        /* ignore */
      }
      return next;
    });
  }, []);

  // Achievement: all 5 section cabinets visited
  useEffect(() => {
    if (visited.size < SECTION_CABINETS.length) return;
    const allVisited = SECTION_CABINETS.every((c) => visited.has(c.id));
    if (allVisited) {
      const { newlyUnlocked, achievement } = unlock('ALL_CABINETS_VISITED');
      if (newlyUnlocked) push(achievement);
    }
  }, [visited, push]);

  // Initial render (SSR): output something neutral; hydrate then decide.
  if (isDesktop === null) {
    return (
      <div className="mx-auto max-w-6xl px-6 pb-24 pt-12 md:px-10 md:pt-16">
        <header className="mb-10 text-center">
          <p className="font-pixel text-[10px] tracking-widest text-text-muted">
            ARCADE FLOOR //
          </p>
          <h1 className="mt-3 font-pixel text-2xl text-pink phosphor-pink md:text-4xl">
            BOOTING SCENE...
          </h1>
        </header>
      </div>
    );
  }

  if (isDesktop) {
    return (
      <div className="relative pb-12 pt-4">
        <div className="mb-3 px-6 text-center md:px-10">
          <p className="font-pixel text-[10px] tracking-widest text-text-muted">
            ARCADE FLOOR //
          </p>
          <p className="mt-1 font-body text-sm text-text-dim">
            Walk into a cabinet. Visit all five sections to unlock COMPLETIONIST.
          </p>
        </div>
        <div
          className="w-full overflow-x-auto"
          style={{ scrollbarGutter: 'stable' }}
        >
          <div style={{ width: SCENE_WIDTH, margin: '0 auto' }}>
            <ArcadeRoom onCabinetActivate={recordVisit} reduced={reduced} />
          </div>
        </div>
      </div>
    );
  }

  // Mobile / narrow fallback — themed-section grid
  return (
    <div className="mx-auto max-w-5xl px-6 pb-24 pt-12 md:px-10 md:pt-16">
      <header className="mb-10 text-center">
        <p className="font-pixel text-[10px] tracking-widest text-text-muted">
          ARCADE FLOOR //
        </p>
        <h1 className="mt-3 font-pixel text-2xl text-pink phosphor-pink md:text-4xl">
          SELECT YOUR CABINET
        </h1>
        <p className="mx-auto mt-4 max-w-2xl font-body text-base leading-relaxed text-text-dim md:text-lg">
          Each cabinet opens a section of the portfolio. Visit all five to unlock COMPLETIONIST.
        </p>
      </header>

      <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {SECTION_CABINETS.map((c) => {
          const cls = SECTION_TILE_COLOR[c.accent];
          const isVisited = visited.has(c.id);
          return (
            <li key={c.id}>
              <Link
                href={c.route}
                onClick={() => recordVisit(c.id)}
                className={cn(
                  'group block h-full border-2 bg-bg-2 p-4 transition-transform duration-100 hover:-translate-y-1',
                  cls,
                )}
              >
                <div className="flex items-baseline justify-between">
                  <span className="font-pixel text-[12px] tracking-widest">
                    {c.label}
                  </span>
                  <span
                    className={cn(
                      'font-pixel text-[9px] tracking-widest',
                      isVisited
                        ? 'text-green phosphor-green'
                        : 'text-yellow phosphor-yellow animate-blink',
                    )}
                  >
                    {isVisited ? '★ CLEARED' : '◆ PLAY'}
                  </span>
                </div>
                <div
                  className="mt-3 border-2 border-border bg-bg p-3"
                  style={{
                    boxShadow: `inset 0 0 10px rgba(0,0,0,0.7)`,
                  }}
                >
                  <p className="font-body text-sm leading-relaxed text-text-dim">
                    {SECTION_DESCRIPTIONS[c.id]}
                  </p>
                </div>
              </Link>
            </li>
          );
        })}

        {/* Plus a play tile for the PRASHAMOID mini-game */}
        <li>
          <Link
            href="/play"
            className={cn(
              'group block h-full border-2 bg-bg-2 p-4 transition-transform duration-100 hover:-translate-y-1',
              SECTION_TILE_COLOR.pink,
            )}
          >
            <div className="flex items-baseline justify-between">
              <span className="font-pixel text-[12px] tracking-widest">
                PRASHAMOID
              </span>
              <span className="font-pixel text-[9px] tracking-widest text-yellow phosphor-yellow animate-blink">
                ★ MINI-GAME
              </span>
            </div>
            <div className="mt-3 border-2 border-border bg-bg p-3">
              <p className="font-body text-sm leading-relaxed text-text-dim">
                Asteroids-style arcade game. Real game-over, real leaderboard.
              </p>
            </div>
          </Link>
        </li>
      </ul>

      <div className="mt-12 border-2 border-border bg-bg-2 p-5 text-center">
        <p className="font-pixel text-[10px] tracking-widest text-text-muted">
          TIP //
        </p>
        <p className="mt-2 font-body text-base text-text-dim">
          Open on a wider screen (1280px+) for the full arcade scene. Konami:
          ↑ ↑ ↓ ↓ ← → ← → B A
        </p>
      </div>
    </div>
  );
}

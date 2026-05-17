'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Cabinet } from '@/components/cabinet/Cabinet';
import { content } from '@/content/data';
import { CABINETS_VISITED_KEY, unlock } from '@/lib/achievements';
import { useAchievementBus } from '@/components/konami/achievementBus';
import { PixelText } from '@/components/effects/PixelText';
import { ArcadeRoom, SCENE_WIDTH } from '@/components/scene/ArcadeRoom';
import type { CabinetAccent } from '@/components/scene/SceneCabinet';

const accentByCategory: Record<string, CabinetAccent> = {
  ml: 'pink',
  finance: 'cyan',
  systems: 'yellow',
  vlsi: 'green',
  'open-source': 'cyan',
};

// 5 evenly-spaced cabinets along the back wall of the scene (in scene coords)
const BACKWALL_XS = [140, 340, 540, 740, 940];

export default function ArcadeFloorPage() {
  const [visited, setVisited] = useState<Set<string>>(new Set());
  const [isDesktop, setIsDesktop] = useState<boolean | null>(null);
  const [reduced, setReduced] = useState(false);
  const push = useAchievementBus((s) => s.push);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(CABINETS_VISITED_KEY);
      if (raw) setVisited(new Set(JSON.parse(raw) as string[]));
    } catch {
      /* ignore */
    }
  }, []);

  // Responsive: desktop only when viewport >= 900px AND not coarse pointer
  useEffect(() => {
    const wide = window.matchMedia('(min-width: 900px)');
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

  // Per-project info shared by both layouts
  const projects = useMemo(
    () =>
      content.projects.map((p) => {
        const accent: CabinetAccent =
          accentByCategory[p.category] ?? 'pink';
        const metric =
          p.metrics?.[0]?.value ??
          (p.stack[0] ? p.stack[0].toUpperCase() : 'PRESS START');
        const labelLong = p.name.toUpperCase().slice(0, 18);
        const labelShort = p.name.toUpperCase().slice(0, 12);
        const frames = [
          <PixelText key="f1" size="md" color={accent} glow>
            {labelShort}
          </PixelText>,
          <PixelText key="f2" size="md" color={accent} glow>
            {metric}
          </PixelText>,
          <PixelText
            key="f3"
            size="sm"
            color="yellow"
            glow
            className="animate-blink"
          >
            INSERT COIN
          </PixelText>,
        ];
        const richFrames = [
          frames[0],
          <PixelText key="rf2" size="lg" color={accent} glow>
            {metric}
          </PixelText>,
          <div key="rf3" className="flex flex-col items-center gap-1">
            <PixelText size="xs" color="text-dim">
              STACK //
            </PixelText>
            <PixelText size="md" color={accent} glow>
              {p.stack.slice(0, 2).join(' + ').toUpperCase()}
            </PixelText>
          </div>,
        ];
        return {
          id: p.id,
          name: labelLong,
          shortLabel: labelShort,
          tagline: p.tagline,
          accent,
          frames,
          richFrames,
        };
      }),
    [],
  );

  const recordVisit = useCallback(
    (id: string) => {
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
    },
    [],
  );

  // Achievement: all-cabinets-visited
  useEffect(() => {
    if (visited.size === 0) return;
    if (projects.every((c) => visited.has(c.id))) {
      const { newlyUnlocked, achievement } = unlock('ALL_CABINETS_VISITED');
      if (newlyUnlocked) push(achievement);
    }
  }, [visited, projects, push]);

  // Build scene config for the immersive desktop view
  const sceneCabinets = useMemo(
    () =>
      projects.map((p, i) => ({
        id: p.id,
        label: p.shortLabel,
        accent: p.accent,
        frames: p.frames,
        x: BACKWALL_XS[i] ?? 140 + i * 200,
      })),
    [projects],
  );

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
      <div className="relative pb-12 pt-6">
        <div className="mb-4 px-6 text-center md:px-10">
          <p className="font-pixel text-[10px] tracking-widest text-text-muted">
            ARCADE FLOOR //
          </p>
          <p className="mt-1 font-body text-sm text-text-dim">
            Walk into a cabinet. Visit all five to unlock COMPLETIONIST.
          </p>
        </div>
        <div className="w-full overflow-x-auto" style={{ scrollbarGutter: 'stable' }}>
          <div style={{ width: SCENE_WIDTH, margin: '0 auto' }}>
            <ArcadeRoom
              projectCabinets={sceneCabinets}
              onCabinetActivate={recordVisit}
              reduced={reduced}
            />
          </div>
        </div>
      </div>
    );
  }

  // Mobile / narrow fallback — original grid layout, preserved
  return (
    <div className="mx-auto max-w-6xl px-6 pb-24 pt-12 md:px-10 md:pt-16">
      <header className="mb-10 text-center">
        <p className="font-pixel text-[10px] tracking-widest text-text-muted">
          ARCADE FLOOR //
        </p>
        <h1 className="mt-3 font-pixel text-2xl text-pink phosphor-pink md:text-4xl">
          SELECT YOUR CABINET
        </h1>
        <p className="mt-4 max-w-2xl mx-auto font-body text-base leading-relaxed text-text-dim md:text-lg">
          Each cabinet is a project. Walk up, read the marquee, drop a quarter,
          press [PLAY]. Visiting all of them unlocks COMPLETIONIST.
        </p>
      </header>

      <ul className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {projects.map((c) => (
          <li key={c.id}>
            <Cabinet
              id={c.id}
              name={c.name}
              tagline={c.tagline}
              accentColor={c.accent}
              demoFrames={c.richFrames}
              href={`/cabinet/${c.id}`}
              visited={visited.has(c.id)}
            />
          </li>
        ))}
      </ul>

      <div className="mt-12 border-2 border-border bg-bg-2 p-5 text-center">
        <p className="font-pixel text-[10px] tracking-widest text-text-muted">
          TIP //
        </p>
        <p className="mt-2 font-body text-base text-text-dim">
          Open this on a wider screen for the full arcade scene. Konami:
          ↑ ↑ ↓ ↓ ← → ← → B A
        </p>
      </div>
    </div>
  );
}

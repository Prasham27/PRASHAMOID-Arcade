'use client';

import { useEffect, useMemo, useState } from 'react';
import { Cabinet } from '@/components/cabinet/Cabinet';
import { content } from '@/content/data';
import { CABINETS_VISITED_KEY, unlock } from '@/lib/achievements';
import { useAchievementBus } from '@/components/konami/achievementBus';
import { PixelText } from '@/components/effects/PixelText';

const accentByCategory: Record<string, 'pink' | 'cyan' | 'yellow' | 'green'> = {
  ml: 'pink',
  finance: 'cyan',
  systems: 'yellow',
  vlsi: 'green',
  'open-source': 'cyan',
};

export default function ArcadeFloorPage() {
  const [visited, setVisited] = useState<Set<string>>(new Set());
  const push = useAchievementBus((s) => s.push);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(CABINETS_VISITED_KEY);
      if (raw) setVisited(new Set(JSON.parse(raw) as string[]));
    } catch {
      /* ignore */
    }
  }, []);

  const cabinets = useMemo(
    () =>
      content.projects.map((p) => {
        const color = accentByCategory[p.category] ?? 'pink';
        const metric =
          p.metrics?.[0]?.value ??
          (p.stack[0] ? p.stack[0].toUpperCase() : '★★★★');
        const frames = [
          <PixelText key="f1" size="md" color={color} glow>
            {p.name.toUpperCase().slice(0, 14)}
          </PixelText>,
          <PixelText key="f2" size="lg" color={color} glow>
            {metric}
          </PixelText>,
          <div key="f3" className="flex flex-col items-center gap-1">
            <PixelText size="xs" color="text-dim">
              STACK //
            </PixelText>
            <PixelText size="md" color={color} glow>
              {p.stack.slice(0, 2).join(' + ').toUpperCase()}
            </PixelText>
          </div>,
        ];
        return {
          id: p.id,
          name: p.name.toUpperCase().slice(0, 18),
          tagline: p.tagline,
          color,
          frames,
          href: `/cabinet/${p.id}`,
        };
      }),
    [],
  );

  // ALL_CABINETS_VISITED detection — based on visits already recorded
  useEffect(() => {
    if (visited.size === 0) return;
    if (cabinets.every((c) => visited.has(c.id))) {
      const { newlyUnlocked, achievement } = unlock('ALL_CABINETS_VISITED');
      if (newlyUnlocked) push(achievement);
    }
  }, [visited, cabinets, push]);

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
        {cabinets.map((c) => (
          <li key={c.id}>
            <Cabinet
              id={c.id}
              name={c.name}
              tagline={c.tagline}
              accentColor={c.color}
              demoFrames={c.frames}
              href={c.href}
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
          Look for the secret behind the cabinets. ↑ ↑ ↓ ↓ ← → ← → B A
        </p>
      </div>
    </div>
  );
}

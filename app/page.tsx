'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { unlock } from '@/lib/achievements';
import { useAchievementBus } from '@/components/konami/achievementBus';

const COINED_KEY = 'arcade.coined';

export default function InsertCoinPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const push = useAchievementBus((s) => s.push);

  useEffect(() => {
    setReady(true);
  }, []);

  const enter = useCallback(() => {
    try {
      window.localStorage.setItem(COINED_KEY, '1');
    } catch {
      /* ignore */
    }
    const { newlyUnlocked, achievement } = unlock('BOOTED_UP');
    if (newlyUnlocked) push(achievement);
    router.push('/arcade');
  }, [router, push]);

  // Any key / click enters
  useEffect(() => {
    if (!ready) return;
    const onKey = (e: KeyboardEvent) => {
      // Ignore the konami / settings keys
      if (['`', '~'].includes(e.key)) return;
      enter();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [enter, ready]);

  return (
    <button
      type="button"
      onClick={enter}
      aria-label="Insert coin to start"
      className="relative flex min-h-screen w-full cursor-pointer flex-col items-center justify-center overflow-hidden bg-bg p-6 text-center"
    >
      {/* Bg grid */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-30"
        style={{
          backgroundImage:
            'linear-gradient(rgba(54,16,82,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(54,16,82,0.5) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
          maskImage:
            'radial-gradient(ellipse at center, black 30%, transparent 70%)',
        }}
      />

      <p className="relative font-pixel text-xs tracking-[0.5em] text-text-muted">
        ◆ PRASHAMOID ARCADE ◆
      </p>
      <h1 className="relative mt-8 font-pixel text-4xl text-pink phosphor-pink animate-flicker md:text-7xl">
        PRASHAM
      </h1>
      <p className="relative mt-6 font-pixel text-[10px] tracking-widest text-cyan phosphor-cyan md:text-xs">
        EST. 2023 · DAU · GANDHINAGAR
      </p>

      <div className="relative mt-16 flex flex-col items-center gap-3">
        <p className="font-pixel text-sm text-yellow phosphor-yellow animate-blink md:text-xl">
          INSERT COIN TO START
        </p>
        <p className="font-body text-base text-text-dim md:text-lg">
          ‹ press any key or click anywhere ›
        </p>
      </div>

      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 font-pixel text-[9px] tracking-widest text-text-muted">
        © 2026 · PORTFOLIO REV 0.1 · ALL SYSTEMS NOMINAL
      </div>
    </button>
  );
}

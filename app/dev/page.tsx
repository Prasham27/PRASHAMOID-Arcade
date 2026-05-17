'use client';

import { useEffect, useState } from 'react';
import { KONAMI_UNLOCKED_KEY } from '@/lib/konami';
import { PixelText } from '@/components/effects/PixelText';

export default function DevPage() {
  const [unlocked, setUnlocked] = useState<boolean | null>(null);
  const [github, setGithub] = useState<unknown>(null);
  const [scores, setScores] = useState<unknown>(null);

  useEffect(() => {
    try {
      const v = window.localStorage.getItem(KONAMI_UNLOCKED_KEY);
      setUnlocked(v === '1');
    } catch {
      setUnlocked(false);
    }
  }, []);

  useEffect(() => {
    if (!unlocked) return;
    fetch('/api/github')
      .then((r) => r.json())
      .then(setGithub)
      .catch(() => setGithub({ error: 'fetch failed' }));
    fetch('/api/scores')
      .then((r) => r.json())
      .then(setScores)
      .catch(() => setScores({ error: 'fetch failed' }));
  }, [unlocked]);

  if (unlocked === null) {
    return (
      <div className="mx-auto max-w-2xl px-6 pt-20 text-center">
        <PixelText size="md" color="text-dim">
          AUTHENTICATING...
        </PixelText>
      </div>
    );
  }
  if (!unlocked) {
    return (
      <div className="mx-auto max-w-2xl px-6 pt-20 text-center">
        <PixelText size="lg" color="pink" glow>
          404 NOT FOUND
        </PixelText>
        <p className="mt-6 font-body text-lg text-text-dim">
          There's nothing here. Try a different route.
        </p>
        <p className="mt-6 font-pixel text-[10px] tracking-widest text-text-muted">
          (or maybe try a famous old code…)
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-6 pb-24 pt-12 md:px-10">
      <header className="mb-8">
        <p className="font-pixel text-[10px] tracking-widest text-pink phosphor-pink">
          ◆ DEV ROUTE // KONAMI UNLOCKED ◆
        </p>
        <h1 className="mt-3 font-pixel text-2xl text-yellow phosphor-yellow md:text-4xl">
          RAW STATS DUMP
        </h1>
        <p className="mt-3 font-body text-base text-text-dim">
          Internal API payloads. Cleared on next deploy.
        </p>
      </header>

      <section className="mb-8">
        <PixelText size="sm" color="cyan" glow as="h2">
          ▼ /api/github
        </PixelText>
        <pre className="mt-3 max-h-96 overflow-auto border-2 border-border bg-bg-2 p-4 font-score text-xs text-cyan">
          {JSON.stringify(github, null, 2)}
        </pre>
      </section>

      <section>
        <PixelText size="sm" color="yellow" glow as="h2">
          ▼ /api/scores
        </PixelText>
        <pre className="mt-3 max-h-96 overflow-auto border-2 border-border bg-bg-2 p-4 font-score text-xs text-yellow">
          {JSON.stringify(scores, null, 2)}
        </pre>
      </section>
    </div>
  );
}

'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { Prashamoid, type GameSnapshot } from '@/lib/game/prashamoid';
import { CoinSlotButton } from '@/components/hud/CoinSlotButton';
import { PixelText } from '@/components/effects/PixelText';
import { ScoreReadout } from '@/components/hud/ScoreReadout';
import { unlock } from '@/lib/achievements';
import { useAchievementBus } from '@/components/konami/achievementBus';

const BEST_KEY = 'arcade.bestScore';

export default function PlayPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameRef = useRef<Prashamoid | null>(null);
  const [snap, setSnap] = useState<GameSnapshot>({
    score: 0,
    lives: 3,
    gameOver: false,
    paused: false,
    invuln: true,
    elapsedSec: 0,
  });
  const [name, setName] = useState('PSM');
  const [submitState, setSubmitState] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [submitMsg, setSubmitMsg] = useState<string | null>(null);
  const [best, setBest] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [token, setToken] = useState(0); // bump to restart
  const push = useAchievementBus((s) => s.push);

  useEffect(() => {
    setIsMobile(
      typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches,
    );
    try {
      const raw = window.localStorage.getItem(BEST_KEY);
      if (raw) setBest(Number(raw));
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    if (isMobile) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const game = new Prashamoid(canvas);
    gameRef.current = game;
    game.onSnapshot(setSnap);
    game.start();
    return () => game.stop();
  }, [isMobile, token]);

  // On game-over, update best + fire achievement
  useEffect(() => {
    if (!snap.gameOver) return;
    const { newlyUnlocked, achievement } = unlock('GAME_PLAYED');
    if (newlyUnlocked) push(achievement);
    setBest((prev) => {
      if (snap.score > prev) {
        try {
          window.localStorage.setItem(BEST_KEY, snap.score.toString());
        } catch {
          /* ignore */
        }
        return snap.score;
      }
      return prev;
    });
  }, [snap.gameOver, snap.score, push]);

  const submitScore = useCallback(async () => {
    setSubmitState('sending');
    setSubmitMsg(null);
    const cleanName = name
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, '')
      .slice(0, 3)
      .padEnd(3, 'X');
    try {
      const res = await fetch('/api/scores', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: cleanName, score: snap.score }),
      });
      const data = (await res.json()) as {
        ok?: boolean;
        rank?: number;
        error?: string;
        mode?: 'global' | 'local';
      };
      if (!res.ok) {
        setSubmitState('error');
        setSubmitMsg(data.error ?? 'SUBMIT FAILED');
        return;
      }
      setSubmitState('sent');
      if (data.rank && data.rank <= 10) {
        const { newlyUnlocked, achievement } = unlock('HIGH_SCORE');
        if (newlyUnlocked) push(achievement);
        setSubmitMsg(`RANK #${data.rank} ${data.mode === 'global' ? '· GLOBAL' : '· LOCAL'}`);
      } else {
        setSubmitMsg(data.mode === 'global' ? 'SAVED · GLOBAL' : 'SAVED · LOCAL');
      }
    } catch {
      setSubmitState('error');
      setSubmitMsg('NETWORK ERROR');
    }
  }, [name, snap.score, push]);

  const restart = useCallback(() => {
    setSubmitState('idle');
    setSubmitMsg(null);
    setToken((t) => t + 1);
  }, []);

  if (isMobile) {
    return (
      <div className="mx-auto max-w-2xl px-6 pb-24 pt-12 text-center">
        <PixelText size="lg" color="pink" glow>
          DESKTOP ONLY
        </PixelText>
        <p className="mt-6 font-body text-lg text-text-dim">
          PRASHAMOID needs a keyboard. Open this page on a laptop — A/D to
          rotate, W to thrust, SPACE to fire.
        </p>
        <p className="mt-6 font-pixel text-[10px] tracking-widest text-text-muted">
          ◆ EVERYTHING ELSE WORKS FINE ON MOBILE ◆
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-6 pb-16 pt-8 md:px-10 md:pt-12">
      <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-pixel text-[10px] tracking-widest text-text-muted">
            ARCADE GAME //
          </p>
          <h1 className="mt-3 font-pixel text-2xl text-pink phosphor-pink md:text-4xl">
            PRASHAMOID
          </h1>
        </div>
        <div className="flex gap-4">
          <ScoreReadout label="SCORE" value={snap.score} color="yellow" />
          <ScoreReadout label="BEST" value={best} color="cyan" />
          <ScoreReadout label="LIVES" value={'♥'.repeat(snap.lives) || '∅'} color="pink" />
        </div>
      </header>

      <div className="relative border-2 border-border bg-bg">
        <canvas
          ref={canvasRef}
          width={800}
          height={500}
          className="block w-full"
          style={{ aspectRatio: '8 / 5' }}
          tabIndex={0}
        />
        {snap.gameOver && (
          <GameOverPanel
            score={snap.score}
            name={name}
            onNameChange={setName}
            onSubmit={submitScore}
            submitState={submitState}
            submitMsg={submitMsg}
            onRestart={restart}
          />
        )}
      </div>

      <div className="mt-4 grid gap-3 text-center text-text-dim md:grid-cols-4">
        <KeyCap k="A / ←" label="ROT LEFT" />
        <KeyCap k="D / →" label="ROT RIGHT" />
        <KeyCap k="W / ↑" label="THRUST" />
        <KeyCap k="SPACE" label="FIRE" />
      </div>

      <p className="mt-2 text-center font-pixel text-[10px] tracking-widest text-text-muted">
        ESC = PAUSE · TAB AWAY = AUTO-PAUSE
      </p>
    </div>
  );
}

function KeyCap({ k, label }: { k: string; label: string }) {
  return (
    <div className="border-2 border-border bg-bg-2 px-3 py-2">
      <p className="font-pixel text-xs text-yellow phosphor-yellow">{k}</p>
      <p className="mt-1 font-pixel text-[9px] tracking-widest text-text-muted">
        {label}
      </p>
    </div>
  );
}

interface GameOverPanelProps {
  score: number;
  name: string;
  onNameChange: (n: string) => void;
  onSubmit: () => void;
  submitState: 'idle' | 'sending' | 'sent' | 'error';
  submitMsg: string | null;
  onRestart: () => void;
}

function GameOverPanel({
  score,
  name,
  onNameChange,
  onSubmit,
  submitState,
  submitMsg,
  onRestart,
}: GameOverPanelProps) {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-bg/85 backdrop-blur-sm">
      <div className="w-[360px] border-2 border-pink bg-bg-2 p-6 text-center">
        <p className="font-pixel text-xs tracking-widest text-pink phosphor-pink animate-flicker">
          GAME OVER
        </p>
        <p className="mt-6 font-pixel text-[10px] tracking-widest text-text-muted">
          FINAL SCORE //
        </p>
        <p className="mt-2 font-pixel text-3xl text-yellow phosphor-yellow">
          {score.toString().padStart(7, '0')}
        </p>

        {submitState !== 'sent' ? (
          <>
            <p className="mt-6 font-pixel text-[10px] tracking-widest text-text-muted">
              ENTER 3-LETTER NAME //
            </p>
            <input
              value={name}
              onChange={(e) =>
                onNameChange(
                  e.target.value
                    .toUpperCase()
                    .replace(/[^A-Z0-9]/g, '')
                    .slice(0, 3),
                )
              }
              maxLength={3}
              className="mt-2 w-32 border-2 border-cyan bg-bg px-3 py-2 text-center font-pixel text-2xl text-cyan phosphor-cyan tracking-widest focus:outline-none"
            />
            <div className="mt-6 flex flex-col gap-2">
              <CoinSlotButton
                onClick={onSubmit}
                color="green"
                disabled={submitState === 'sending'}
              >
                {submitState === 'sending' ? 'SUBMITTING…' : 'SUBMIT SCORE'}
              </CoinSlotButton>
              <CoinSlotButton onClick={onRestart} color="cyan">
                PLAY AGAIN
              </CoinSlotButton>
            </div>
          </>
        ) : (
          <>
            <p className="mt-6 font-pixel text-xs text-green phosphor-green">
              {submitMsg ?? 'SAVED'}
            </p>
            <div className="mt-6 flex flex-col gap-2">
              <CoinSlotButton href="/scores" color="yellow">
                VIEW LEADERBOARD
              </CoinSlotButton>
              <CoinSlotButton onClick={onRestart} color="cyan">
                PLAY AGAIN
              </CoinSlotButton>
            </div>
          </>
        )}
        {submitMsg && submitState === 'error' && (
          <p className="mt-3 font-pixel text-[10px] tracking-widest text-pink">
            {submitMsg}
          </p>
        )}
      </div>
    </div>
  );
}

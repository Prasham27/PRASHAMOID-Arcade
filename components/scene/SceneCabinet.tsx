'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { cn } from '@/lib/cn';

export type CabinetAccent = 'pink' | 'cyan' | 'yellow' | 'green';

export interface SceneCabinetProps {
  /** World-x of cabinet centre (scene coords) */
  x: number;
  /** World-y of cabinet top (scene coords) */
  y: number;
  /** Overall scale multiplier (1 = standard ~120w x 200h). */
  scale?: number;
  label: string;
  accent: CabinetAccent;
  /** Optional secondary accent for the marquee (double-tone). */
  accentSecondary?: CabinetAccent;
  /** ReactNode frames cycled inside the CRT. */
  screenFrames: ReactNode[];
  onActivate: () => void;
  /** Show the floating "[E] ENTER" prompt and pulse subtly. */
  active?: boolean;
  variant?: 'standard' | 'big-terminal';
}

const hex: Record<CabinetAccent, string> = {
  pink: '#ff2c9f',
  cyan: '#00f0ff',
  yellow: '#ffe600',
  green: '#39ff14',
};

const COLOR_TEXT: Record<CabinetAccent, string> = {
  pink: 'text-pink',
  cyan: 'text-cyan',
  yellow: 'text-yellow',
  green: 'text-green',
};

/** A free-standing arcade cabinet, absolutely positioned in the scene. */
export function SceneCabinet({
  x,
  y,
  scale = 1,
  label,
  accent,
  accentSecondary,
  screenFrames,
  onActivate,
  active = false,
  variant = 'standard',
}: SceneCabinetProps) {
  const [frameI, setFrameI] = useState(0);
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    if (screenFrames.length <= 1) return;
    const t = window.setInterval(
      () => setFrameI((i) => (i + 1) % screenFrames.length),
      900,
    );
    return () => window.clearInterval(t);
  }, [screenFrames.length]);

  const W = variant === 'big-terminal' ? 200 : 140;
  const H = variant === 'big-terminal' ? 280 : 230;
  const c = hex[accent];
  const c2 = accentSecondary ? hex[accentSecondary] : c;
  const glow = active || hovered ? `0 0 18px ${c}cc, 0 0 36px ${c}66` : `0 0 10px ${c}55`;

  return (
    <div
      className="absolute z-20"
      style={{
        left: x - (W * scale) / 2,
        top: y,
        width: W * scale,
        height: H * scale,
        transform: active ? 'translateY(-2px)' : undefined,
        transition: 'transform 200ms ease-out',
      }}
    >
      {/* [E] ENTER prompt above marquee */}
      <div
        aria-hidden={!active}
        className={cn(
          'absolute left-1/2 -translate-x-1/2 -top-9 font-pixel text-[10px] tracking-widest text-yellow phosphor-yellow whitespace-nowrap',
          active ? 'opacity-100 animate-pulse' : 'opacity-0',
        )}
        style={{ transition: 'opacity 150ms ease-out' }}
      >
        [E] ENTER
      </div>

      <button
        type="button"
        onClick={onActivate}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className="block h-full w-full text-left focus:outline-none"
        aria-label={`Enter ${label} cabinet`}
        style={{
          filter: `drop-shadow(0 10px 8px rgba(0,0,0,0.7))`,
        }}
      >
        {/* Cabinet body */}
        <div
          className="relative h-full w-full bg-bg-2"
          style={{
            border: `2px solid ${c}`,
            boxShadow: glow,
            clipPath:
              'polygon(6% 0, 94% 0, 100% 8%, 100% 100%, 0 100%, 0 8%)',
          }}
        >
          {/* Marquee */}
          <div
            className="absolute left-2 right-2 top-2 border-2 px-2 py-1 text-center font-pixel uppercase tracking-widest"
            style={{
              borderColor: c2,
              color: c,
              fontSize: variant === 'big-terminal' ? 12 : 9,
              textShadow: `0 0 4px ${c}, 0 0 10px ${c2}`,
              backgroundImage: `linear-gradient(180deg, ${c2}22, transparent 50%, ${c}22)`,
            }}
          >
            {label}
            <span
              aria-hidden
              className="absolute inset-x-0 top-0 h-[2px]"
              style={{
                backgroundImage: `repeating-linear-gradient(90deg, ${c2} 0 3px, transparent 3px 6px)`,
              }}
            />
          </div>

          {/* CRT screen */}
          <div
            className="absolute left-3 right-3 overflow-hidden border-2 border-border bg-bg"
            style={{
              top: variant === 'big-terminal' ? 44 : 32,
              bottom: variant === 'big-terminal' ? 116 : 94,
              boxShadow: `inset 0 0 20px 4px rgba(0,0,0,0.8), inset 0 0 40px 6px ${c}22`,
            }}
          >
            <div
              className={cn(
                'flex h-full w-full items-center justify-center text-center px-1',
                COLOR_TEXT[accent],
              )}
            >
              {screenFrames[frameI] ?? null}
            </div>
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0"
              style={{
                backgroundImage:
                  'repeating-linear-gradient(0deg, rgba(0,0,0,0.35) 0 1px, transparent 1px 3px)',
              }}
            />
          </div>

          {/* Control panel — joystick + buttons + coin slot */}
          <div
            className="absolute left-3 right-3 border-2 border-border bg-bg"
            style={{
              bottom: variant === 'big-terminal' ? 46 : 36,
              height: variant === 'big-terminal' ? 44 : 36,
              backgroundImage:
                'linear-gradient(180deg, rgba(255,255,255,0.05), transparent 60%)',
            }}
          >
            <div className="flex h-full w-full items-center justify-between px-3">
              {/* joystick */}
              <div className="relative">
                <div
                  className="h-2 w-2"
                  style={{
                    background: '#1c0429',
                    boxShadow: '0 0 0 2px #361052',
                  }}
                />
                <div
                  className="absolute -top-3 left-1/2 h-3 w-1 -translate-x-1/2"
                  style={{ background: c, boxShadow: `0 0 4px ${c}` }}
                />
                <div
                  className="absolute -top-4 left-1/2 h-2 w-2 -translate-x-1/2 rounded-full"
                  style={{ background: '#f5e8ff' }}
                />
              </div>
              {/* buttons */}
              <div className="flex gap-1">
                <span
                  className="block h-3 w-3 rounded-full"
                  style={{ background: c, boxShadow: `0 0 6px ${c}` }}
                />
                <span
                  className="block h-3 w-3 rounded-full"
                  style={{ background: c2, boxShadow: `0 0 6px ${c2}` }}
                />
              </div>
              {/* coin slot */}
              <div className="flex flex-col items-center gap-0.5">
                <div
                  className="h-[2px] w-5"
                  style={{ background: '#7a5a96' }}
                />
                <div
                  className="font-pixel text-[6px] tracking-widest text-text-muted"
                >
                  25¢
                </div>
              </div>
            </div>
          </div>

          {/* Side art stripes */}
          <div
            aria-hidden
            className="absolute left-0 top-8 bottom-8 w-1"
            style={{
              background: `linear-gradient(180deg, ${c}, transparent)`,
            }}
          />
          <div
            aria-hidden
            className="absolute right-0 top-8 bottom-8 w-1"
            style={{
              background: `linear-gradient(180deg, ${c2}, transparent)`,
            }}
          />

          {/* base / kick panel */}
          <div
            className="absolute inset-x-2 bottom-1 border-2 border-border bg-bg text-center font-pixel text-[7px] tracking-widest text-text-muted"
            style={{ height: variant === 'big-terminal' ? 38 : 28 }}
          >
            <div className="flex h-full items-center justify-center">
              {variant === 'big-terminal' ? 'MAIN TERMINAL' : '1 PLAYER'}
            </div>
          </div>
        </div>
      </button>
    </div>
  );
}

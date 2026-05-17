'use client';

import { useState } from 'react';
import { cn } from '@/lib/cn';

export interface ChangingRoomProps {
  /** World-x of the booth's center. */
  x: number;
  /** World-y of the booth's top edge. */
  y: number;
  /** Whether the player is close enough to activate (highlight + show [E] CHANGE). */
  active?: boolean;
  /** Called when the booth is clicked or [E] is pressed nearby. */
  onActivate: () => void;
}

/** Phone-booth-style "changing room" with red velvet curtains.
 *  Clickable — opens the AvatarCustomizationModal. */
export function ChangingRoom({ x, y, active, onActivate }: ChangingRoomProps) {
  const [hovered, setHovered] = useState(false);
  const W = 96;
  const H = 220;
  const signH = 22;
  const matH = 14;
  const totalH = H + signH + matH + 12;
  const intense = !!(active || hovered);

  const frameBorder = intense ? '#00f0ff' : '#050009';
  const shadow = intense
    ? '0 0 18px #00f0ffaa, 0 0 40px #00f0ff55, 0 10px 14px rgba(0,0,0,0.85)'
    : '0 0 10px #00f0ff33, 0 8px 12px rgba(0,0,0,0.8)';

  return (
    <div
      className="absolute z-20"
      style={{
        left: x - W / 2,
        top: y - signH - 6,
        width: W,
        height: totalH,
      }}
    >
      {/* [E] CHANGE prompt */}
      <div
        aria-hidden={!active}
        className={cn(
          'absolute left-1/2 -translate-x-1/2 z-30 border-2 border-cyan bg-bg-2/90 px-2 py-0.5 font-pixel text-[10px] tracking-widest text-cyan whitespace-nowrap',
          active ? 'opacity-100 animate-pulse' : 'opacity-0',
        )}
        style={{
          top: -14,
          transition: 'opacity 150ms ease-out',
          boxShadow: '0 0 10px #00f0ff88',
        }}
      >
        [E] CHANGE
      </div>

      {/* Cyan halo wash on bricks behind */}
      <div
        aria-hidden
        className="pointer-events-none absolute"
        style={{
          left: -20,
          top: signH - 4,
          width: W + 40,
          height: H + 24,
          background:
            'radial-gradient(ellipse at center, rgba(0,240,255,0.22) 0%, transparent 70%)',
          opacity: intense ? 0.95 : 0.55,
          filter: 'blur(6px)',
          zIndex: -1,
        }}
      />

      {/* === "CHANGING ROOM" neon sign === */}
      <div
        className="absolute font-pixel uppercase tracking-widest"
        style={{
          left: -4,
          top: 0,
          width: W + 8,
          height: signH,
          lineHeight: `${signH - 4}px`,
          textAlign: 'center',
          fontSize: 8,
          color: '#ff2c9f',
          background:
            'linear-gradient(180deg, rgba(255,44,159,0.20), rgba(0,240,255,0.08) 50%, rgba(255,44,159,0.20))',
          border: '2px solid #ff2c9f',
          textShadow:
            '0 0 4px #ff2c9f, 0 0 10px #ff2c9faa, 0 0 18px rgba(0,240,255,0.4)',
          boxShadow:
            '0 0 12px rgba(255,44,159,0.55), 0 0 24px rgba(0,240,255,0.28), inset 0 0 8px rgba(255,44,159,0.35)',
        }}
      >
        CHANGING ROOM
      </div>

      <button
        type="button"
        onClick={onActivate}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        aria-label="Changing room — customize your look"
        className="absolute block text-left focus:outline-none"
        style={{ left: 0, top: signH + 6, width: W, height: H }}
      >
        {/* === Dark-wood frame === */}
        <div
          className="relative h-full w-full"
          style={{
            background:
              'linear-gradient(180deg, #2a1448 0%, #15082a 100%)',
            border: `2px solid ${frameBorder}`,
            boxShadow: [
              shadow,
              'inset 2px 2px 0 rgba(255,255,255,0.06)',
              'inset -2px -2px 0 rgba(0,0,0,0.7)',
            ].join(', '),
          }}
        >
          {/* Inner wood — vertical grain stripes */}
          <div
            className="absolute"
            style={{
              left: 4,
              top: 4,
              right: 4,
              bottom: 4,
              background:
                'linear-gradient(180deg, #3a1e10 0%, #2a1408 100%)',
              border: '2px solid #1a0c04',
              backgroundImage: [
                'linear-gradient(180deg, #3a1e10 0%, #2a1408 100%)',
                'repeating-linear-gradient(90deg, rgba(0,0,0,0.18) 0 2px, transparent 2px 8px)',
                'repeating-linear-gradient(90deg, rgba(255,200,140,0.04) 0 1px, transparent 1px 12px)',
              ].join(', '),
              boxShadow:
                'inset 2px 2px 0 rgba(255,200,140,0.08), inset -2px -2px 0 rgba(0,0,0,0.6)',
            }}
          >
            {/* === Red velvet curtains — 3 vertical panels === */}
            <div
              className="absolute inset-0 flex"
              style={{
                left: 6,
                right: 6,
                top: 8,
                bottom: 30,
                gap: 0,
              }}
            >
              {[0, 1, 2].map((i) => (
                <div
                  key={`curt-${i}`}
                  className="relative flex-1"
                  style={{
                    background:
                      i === 1
                        ? 'linear-gradient(180deg, #b41423 0%, #6e0612 60%, #4a040c 100%)'
                        : 'linear-gradient(180deg, #a51020 0%, #5d050f 60%, #3f030b 100%)',
                    borderLeft: i > 0 ? '1px solid #2a0207' : undefined,
                    borderRight: i < 2 ? '1px solid #2a0207' : undefined,
                    backgroundImage:
                      'repeating-linear-gradient(90deg, rgba(0,0,0,0.28) 0 2px, transparent 2px 6px), repeating-linear-gradient(90deg, rgba(255,80,90,0.10) 0 1px, transparent 1px 7px)',
                    boxShadow:
                      'inset 1px 0 0 rgba(255,80,90,0.10), inset -1px 0 0 rgba(0,0,0,0.5)',
                  }}
                >
                  {/* Bottom velvet hem highlight */}
                  <div
                    className="absolute inset-x-0"
                    style={{
                      bottom: 0,
                      height: 4,
                      background:
                        'linear-gradient(180deg, transparent, rgba(0,0,0,0.7))',
                    }}
                  />
                </div>
              ))}
            </div>

            {/* === Glowing "$" star icon on the curtain front === */}
            <div
              className="absolute font-pixel"
              style={{
                left: '50%',
                top: '40%',
                transform: 'translate(-50%, -50%)',
                width: 20,
                height: 20,
                lineHeight: '20px',
                textAlign: 'center',
                fontSize: 16,
                color: '#ffe600',
                textShadow:
                  '0 0 6px #ffe600, 0 0 14px #ffe600aa, 0 0 22px rgba(255,230,0,0.55)',
              }}
            >
              ★
            </div>

            {/* Curtain rod */}
            <div
              className="absolute"
              style={{
                left: 4,
                right: 4,
                top: 4,
                height: 4,
                background:
                  'linear-gradient(180deg, #7a5a96 0%, #361052 100%)',
                border: '1px solid #1a0428',
                boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.18)',
              }}
            />

            {/* === "STEP IN" floor mat at the bottom === */}
            <div
              className="absolute"
              style={{
                left: 4,
                right: 4,
                bottom: 4,
                height: 22,
                background:
                  'linear-gradient(180deg, #1c0429 0%, #0a0118 100%)',
                border: '2px solid #050009',
                boxShadow:
                  'inset 0 1px 0 rgba(255,255,255,0.06), 0 2px 0 rgba(0,0,0,0.6)',
              }}
            >
              <div
                className="flex h-full w-full items-center justify-center font-pixel uppercase tracking-widest"
                style={{
                  fontSize: 8,
                  color: '#00f0ff',
                  textShadow: '0 0 4px #00f0ff, 0 0 8px rgba(0,240,255,0.5)',
                }}
              >
                STEP IN
              </div>
            </div>
          </div>
        </div>
      </button>

      {/* === Small outer floor mat shadow under the booth === */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 -translate-x-1/2"
        style={{
          bottom: -4,
          width: W + 18,
          height: matH,
          background:
            'radial-gradient(ellipse at center, rgba(0,240,255,0.30), transparent 70%)',
          filter: 'blur(3px)',
        }}
      />
    </div>
  );
}

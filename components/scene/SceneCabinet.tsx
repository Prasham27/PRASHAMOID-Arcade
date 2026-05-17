'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { cn } from '@/lib/cn';

export type CabinetAccent = 'pink' | 'cyan' | 'yellow' | 'green';

export interface SceneCabinetProps {
  /** World-x of cabinet centre (scene coords) */
  x: number;
  /** World-y of cabinet TOP (scene coords) */
  y: number;
  /** Overall scale multiplier (1 = standard 130w x 220h). */
  scale?: number;
  label: string;
  accent: CabinetAccent;
  /** Optional secondary accent (for double-tone marquees on the PRASHAMOID cab). */
  accentSecondary?: CabinetAccent;
  /** ReactNode frames cycled inside the CRT every ~1200ms. */
  screenFrames: ReactNode[];
  onActivate: () => void;
  /** Show the floating "[E] ENTER" prompt and pulse the glow. */
  active?: boolean;
  /** Render a wooden bar stool in front (default true). */
  withStool?: boolean;
  /** Width override (default 130). */
  width?: number;
  /** Height override (default 220). */
  height?: number;
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

/** A free-standing arcade cabinet — chunky, beveled, full-bodied. */
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
  withStool = true,
  width = 130,
  height = 220,
}: SceneCabinetProps) {
  const [frameI, setFrameI] = useState(0);
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    if (screenFrames.length <= 1) return;
    const t = window.setInterval(
      () => setFrameI((i) => (i + 1) % screenFrames.length),
      1200,
    );
    return () => window.clearInterval(t);
  }, [screenFrames.length]);

  const W = width;
  const H = height;
  const c = hex[accent];
  const c2 = accentSecondary ? hex[accentSecondary] : c;
  const intense = active || hovered;
  const glowOuter = intense
    ? `0 0 22px ${c}cc, 0 0 50px ${c}77, 0 8px 14px rgba(0,0,0,0.85)`
    : `0 0 14px ${c}66, 0 6px 12px rgba(0,0,0,0.8)`;

  const sW = W * scale;
  const sH = H * scale;

  return (
    <div
      className="absolute z-20"
      style={{
        left: x - sW / 2,
        top: y,
        width: sW,
        height: sH + (withStool ? 56 : 0),
        transform: intense ? 'translateY(-2px)' : undefined,
        transition: 'transform 200ms ease-out',
      }}
    >
      {/* [E] ENTER prompt above marquee */}
      <div
        aria-hidden={!active}
        className={cn(
          'absolute left-1/2 -translate-x-1/2 -top-9 z-30 border-2 border-yellow bg-bg-2/90 px-2 py-0.5 font-pixel text-[10px] tracking-widest text-yellow phosphor-yellow whitespace-nowrap',
          active ? 'opacity-100 animate-pulse' : 'opacity-0',
        )}
        style={{
          transition: 'opacity 150ms ease-out',
          boxShadow: '0 0 10px #ffe60088',
        }}
      >
        [E] ENTER
      </div>

      {/* Halo behind cabinet — bleeds onto bricks */}
      <div
        aria-hidden
        className="pointer-events-none absolute"
        style={{
          left: -22,
          top: -10,
          width: sW + 44,
          height: sH + 20,
          background: `radial-gradient(ellipse at center, ${c}33 0%, transparent 70%)`,
          opacity: intense ? 0.9 : 0.55,
          filter: 'blur(6px)',
          zIndex: -1,
        }}
      />

      <button
        type="button"
        onClick={onActivate}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className="block w-full text-left focus:outline-none"
        aria-label={`Enter ${label} cabinet`}
        style={{ width: sW, height: sH }}
      >
        {/* === Cabinet body (chunky beveled box) === */}
        <div
          className="relative h-full w-full"
          style={{
            background:
              'linear-gradient(180deg, #1c0e30 0%, #15082a 40%, #0d0220 100%)',
            border: '2px solid #050009',
            boxShadow: [
              // outer accent halo
              glowOuter,
              // inner bevel — bright top/left, dark bottom/right
              'inset 2px 2px 0 rgba(255,255,255,0.08)',
              'inset -2px -2px 0 rgba(0,0,0,0.7)',
              'inset 0 0 0 1px rgba(0,0,0,0.4)',
            ].join(', '),
            clipPath:
              'polygon(8% 0, 92% 0, 100% 6%, 100% 95%, 95% 100%, 5% 100%, 0 95%, 0 6%)',
          }}
        >
          {/* Top angle highlights — faux 3D top edge */}
          <div
            aria-hidden
            className="absolute inset-x-0 top-0"
            style={{
              height: 4,
              background: `linear-gradient(90deg, transparent, ${c}55, transparent)`,
            }}
          />

          {/* === Marquee === */}
          <div
            className="absolute left-2 right-2 overflow-hidden border-2 text-center font-pixel uppercase tracking-widest"
            style={{
              top: 6,
              height: 26,
              borderColor: c,
              color: c,
              fontSize: 10,
              lineHeight: '22px',
              background: `linear-gradient(180deg, ${c}25 0%, ${c2}18 50%, ${c}25 100%)`,
              textShadow: `0 0 4px ${c}, 0 0 10px ${c}aa`,
              boxShadow: `inset 0 0 10px ${c}66, 0 0 8px ${c}55`,
            }}
          >
            <span className="relative z-10">{label}</span>
            {/* Marquee scanline ridges */}
            <span
              aria-hidden
              className="pointer-events-none absolute inset-0"
              style={{
                backgroundImage:
                  'repeating-linear-gradient(0deg, rgba(0,0,0,0.18) 0 1px, transparent 1px 3px)',
              }}
            />
          </div>

          {/* === CRT screen (recessed + scanlines) === */}
          <div
            className="absolute left-3 right-3 overflow-hidden border-2 border-black"
            style={{
              top: 38,
              height: 78,
              background:
                'linear-gradient(180deg, #04000a 0%, #0a0118 60%, #04000a 100%)',
              boxShadow: [
                'inset 0 0 16px 4px rgba(0,0,0,0.9)',
                `inset 0 0 24px 2px ${c}22`,
                '0 0 0 1px rgba(0,0,0,0.6)',
              ].join(', '),
            }}
          >
            <div
              className={cn(
                'flex h-full w-full items-center justify-center px-1',
                COLOR_TEXT[accent],
              )}
            >
              {screenFrames[frameI] ?? null}
            </div>
            {/* Scanlines */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0"
              style={{
                backgroundImage:
                  'repeating-linear-gradient(0deg, rgba(0,0,0,0.35) 0 1px, transparent 1px 3px)',
              }}
            />
            {/* Glass reflection */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0"
              style={{
                background:
                  'linear-gradient(135deg, rgba(255,255,255,0.08) 0%, transparent 50%)',
              }}
            />
            {/* CRT vignette */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0"
              style={{
                background:
                  'radial-gradient(ellipse at center, transparent 55%, rgba(0,0,0,0.45) 100%)',
              }}
            />
          </div>

          {/* === Control panel === */}
          <div
            className="absolute left-3 right-3 border-2"
            style={{
              top: 122,
              height: 38,
              borderColor: '#050009',
              background:
                'linear-gradient(180deg, #2a1448 0%, #170828 60%, #0c0218 100%)',
              boxShadow:
                'inset 0 1px 0 rgba(255,255,255,0.08), inset 0 -2px 0 rgba(0,0,0,0.7)',
            }}
          >
            <div className="flex h-full w-full items-center justify-between px-2">
              {/* Joystick (base + shaft + ball top) */}
              <div className="relative" style={{ width: 12, height: 28 }}>
                {/* base */}
                <div
                  className="absolute bottom-0 left-1/2 -translate-x-1/2 rounded-full"
                  style={{
                    width: 12,
                    height: 6,
                    background: '#050009',
                    boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.15)',
                  }}
                />
                {/* shaft */}
                <div
                  className="absolute bottom-3 left-1/2 -translate-x-1/2"
                  style={{
                    width: 3,
                    height: 14,
                    background: '#7a5a96',
                    boxShadow: 'inset 1px 0 0 rgba(255,255,255,0.2)',
                  }}
                />
                {/* ball top */}
                <div
                  className="absolute left-1/2 -translate-x-1/2 rounded-full"
                  style={{
                    top: 0,
                    width: 8,
                    height: 8,
                    background: `radial-gradient(circle at 35% 30%, #ffffff, ${c} 60%, ${c}99)`,
                    boxShadow: `0 0 6px ${c}aa`,
                  }}
                />
              </div>

              {/* Buttons row */}
              <div className="flex items-center gap-1">
                {([c, c2, c, c2] as string[]).map((color, i) => (
                  <span
                    key={i}
                    className="relative block rounded-full"
                    style={{
                      width: 9,
                      height: 9,
                      background: `radial-gradient(circle at 35% 30%, #ffffff, ${color} 55%, ${color}cc)`,
                      boxShadow: `0 0 6px ${color}aa, inset 0 -1px 0 rgba(0,0,0,0.5)`,
                    }}
                  >
                    <span
                      className="absolute left-1 top-1 h-[2px] w-[2px] rounded-full"
                      style={{ background: '#fff' }}
                    />
                  </span>
                ))}
              </div>
            </div>
            {/* Coin slot ridge on lower-right */}
            <div
              className="absolute right-2"
              style={{
                bottom: -8,
                width: 14,
                height: 4,
                background: '#050009',
                boxShadow: 'inset 0 1px 0 rgba(122,90,150,0.6)',
              }}
            />
          </div>

          {/* === Body sticker / nameplate area === */}
          <div
            className="absolute left-3 right-3"
            style={{
              top: 168,
              height: 18,
              background: 'linear-gradient(180deg, #0c0218, #1a0a2a)',
              border: '1px solid #050009',
            }}
          >
            <div
              className="flex h-full w-full items-center justify-center font-pixel text-[7px] tracking-widest"
              style={{
                color: '#7a5a96',
                textShadow: '0 0 2px rgba(0,0,0,0.6)',
              }}
            >
              1 PLAYER
            </div>
          </div>

          {/* === Side art chevrons === */}
          <div
            aria-hidden
            className="absolute left-0 top-8 bottom-8"
            style={{
              width: 4,
              background: `repeating-linear-gradient(180deg, ${c} 0 6px, transparent 6px 12px)`,
              opacity: 0.55,
            }}
          />
          <div
            aria-hidden
            className="absolute right-0 top-8 bottom-8"
            style={{
              width: 4,
              background: `repeating-linear-gradient(180deg, ${c2} 0 6px, transparent 6px 12px)`,
              opacity: 0.55,
            }}
          />

          {/* === Base / plinth — widens visually via flared bottom === */}
          <div
            className="absolute inset-x-0 bottom-0"
            style={{
              height: 26,
              background:
                'linear-gradient(180deg, #15082a 0%, #07000f 60%, #000000 100%)',
              borderTop: '2px solid #050009',
              boxShadow:
                'inset 0 2px 0 rgba(255,255,255,0.04), inset 0 -2px 0 rgba(0,0,0,0.7)',
            }}
          />
          {/* Plinth side flares */}
          <div
            aria-hidden
            className="absolute"
            style={{
              left: -4,
              bottom: 0,
              width: 4,
              height: 18,
              background: '#07000f',
              boxShadow: 'inset 1px 0 0 rgba(255,255,255,0.04)',
            }}
          />
          <div
            aria-hidden
            className="absolute"
            style={{
              right: -4,
              bottom: 0,
              width: 4,
              height: 18,
              background: '#07000f',
              boxShadow: 'inset -1px 0 0 rgba(255,255,255,0.04)',
            }}
          />
        </div>
      </button>

      {/* === Wooden bar stool in front === */}
      {withStool ? (
        <div
          aria-hidden
          className="absolute"
          style={{
            left: sW / 2 - 15,
            top: sH + 8,
            width: 30,
            height: 50,
          }}
        >
          {/* Cushion */}
          <div
            className="absolute left-0 right-0 mx-auto rounded-full"
            style={{
              top: 0,
              width: 30,
              height: 10,
              background:
                'radial-gradient(ellipse at 40% 30%, #b04030 0%, #6b1a18 70%, #2a0808 100%)',
              border: '1px solid #1a0408',
              boxShadow:
                'inset 0 1px 0 rgba(255,255,255,0.15), 0 1px 0 rgba(0,0,0,0.6)',
            }}
          />
          {/* Cushion side rim (chunky leather) */}
          <div
            className="absolute left-0 right-0 mx-auto"
            style={{
              top: 7,
              width: 28,
              height: 4,
              background: '#3a0e10',
              borderRadius: '0 0 6px 6px',
            }}
          />
          {/* Pole */}
          <div
            className="absolute left-1/2 -translate-x-1/2"
            style={{
              top: 11,
              width: 3,
              height: 30,
              background:
                'linear-gradient(90deg, #353540 0%, #6a6a78 40%, #353540 100%)',
              boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.5)',
            }}
          />
          {/* Base disc */}
          <div
            className="absolute left-0 right-0 mx-auto rounded-full"
            style={{
              top: 40,
              width: 22,
              height: 6,
              background:
                'radial-gradient(ellipse at 40% 30%, #5a5a68 0%, #1a1a22 70%)',
              boxShadow: '0 2px 4px rgba(0,0,0,0.7)',
            }}
          />
          {/* Floor shadow */}
          <div
            className="absolute left-0 right-0 mx-auto rounded-full"
            style={{
              top: 46,
              width: 26,
              height: 4,
              background:
                'radial-gradient(closest-side, rgba(0,0,0,0.6), transparent 80%)',
              filter: 'blur(1px)',
            }}
          />
        </div>
      ) : null}
    </div>
  );
}

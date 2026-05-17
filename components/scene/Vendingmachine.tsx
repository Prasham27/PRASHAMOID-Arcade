'use client';

import { useState } from 'react';
import { cn } from '@/lib/cn';

export interface VendingmachineProps {
  x: number;
  y: number;
  active?: boolean;
  onActivate: () => void;
}

const BOTTLE_COLORS: string[][] = [
  ['#ff2c9f', '#00f0ff', '#ffe600', '#39ff14'],
  ['#00f0ff', '#ffe600', '#39ff14', '#ff2c9f'],
  ['#39ff14', '#ff2c9f', '#00f0ff', '#ffe600'],
];

/** Tall arcade vending machine — clickable, routes to /comms via parent. */
export function Vendingmachine({
  x,
  y,
  active,
  onActivate,
}: VendingmachineProps) {
  const [hovered, setHovered] = useState(false);
  const W = 110;
  const H = 240;
  const intense = active || hovered;
  const glowBorder = intense ? '#ffe600' : '#050009';
  const shadow = intense
    ? '0 0 20px #ffe600aa, 0 0 44px #ffe60055, 0 10px 14px rgba(0,0,0,0.85)'
    : '0 0 10px #ffe60033, 0 8px 12px rgba(0,0,0,0.8)';

  return (
    <div
      className="absolute z-20"
      style={{ left: x - W / 2, top: y, width: W, height: H }}
    >
      {/* [E] DROP COIN prompt */}
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
        [E] DROP COIN
      </div>

      {/* Halo on bricks */}
      <div
        aria-hidden
        className="pointer-events-none absolute"
        style={{
          left: -16,
          top: -8,
          width: W + 32,
          height: H + 16,
          background:
            'radial-gradient(ellipse at center, rgba(255,230,0,0.22) 0%, transparent 70%)',
          opacity: intense ? 0.95 : 0.55,
          filter: 'blur(6px)',
          zIndex: -1,
        }}
      />

      <button
        type="button"
        onClick={onActivate}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        aria-label="Vending machine — send a message"
        className="block h-full w-full text-left focus:outline-none"
      >
        <div
          className="relative h-full w-full"
          style={{
            background:
              'linear-gradient(180deg, #1c0e30 0%, #14072a 50%, #07000f 100%)',
            border: `2px solid ${glowBorder}`,
            boxShadow: [
              shadow,
              'inset 2px 2px 0 rgba(255,255,255,0.08)',
              'inset -2px -2px 0 rgba(0,0,0,0.7)',
            ].join(', '),
          }}
        >
          {/* === POWER-UPS marquee sign (top) === */}
          <div
            className="absolute left-2 right-2 overflow-hidden border-2 border-yellow text-center font-pixel uppercase tracking-widest"
            style={{
              top: 4,
              height: 22,
              color: '#ffe600',
              fontSize: 9,
              lineHeight: '18px',
              background:
                'linear-gradient(180deg, rgba(255,230,0,0.18), rgba(255,230,0,0.05) 50%, rgba(255,230,0,0.18))',
              textShadow: '0 0 4px #ffe600, 0 0 10px #ffe600aa',
              boxShadow: 'inset 0 0 10px rgba(255,230,0,0.4), 0 0 8px rgba(255,230,0,0.5)',
            }}
          >
            POWER-UPS
          </div>

          {/* === Glass display window with 3 rows of 4 bottles === */}
          <div
            className="absolute left-2 right-2 overflow-hidden border-2"
            style={{
              top: 30,
              height: 130,
              borderColor: '#050009',
              background:
                'linear-gradient(180deg, #04000a 0%, #0a0118 60%, #02000a 100%)',
              boxShadow: [
                'inset 0 0 14px 4px rgba(0,0,0,0.85)',
                'inset 0 0 16px rgba(0,240,255,0.18)',
              ].join(', '),
            }}
          >
            {/* 3 shelf rows */}
            {BOTTLE_COLORS.map((row, ri) => (
              <div
                key={`shelf-${ri}`}
                className="absolute left-1 right-1 flex items-end justify-around"
                style={{
                  top: 4 + ri * 42,
                  height: 38,
                }}
              >
                {row.map((color, ci) => (
                  <div
                    key={`b-${ri}-${ci}`}
                    className="relative"
                    style={{ width: 14, height: 32 }}
                  >
                    {/* Bottle cap */}
                    <div
                      className="absolute left-1/2 -translate-x-1/2"
                      style={{
                        top: 0,
                        width: 5,
                        height: 4,
                        background: '#7a5a96',
                        borderRadius: '1px 1px 0 0',
                      }}
                    />
                    {/* Neck */}
                    <div
                      className="absolute left-1/2 -translate-x-1/2"
                      style={{
                        top: 4,
                        width: 4,
                        height: 4,
                        background: color,
                        opacity: 0.85,
                      }}
                    />
                    {/* Body */}
                    <div
                      className="absolute left-0 right-0 mx-auto"
                      style={{
                        top: 8,
                        width: 11,
                        height: 22,
                        background: `linear-gradient(180deg, ${color} 0%, ${color}cc 70%, ${color}88 100%)`,
                        border: '1px solid #050009',
                        borderRadius: '2px 2px 1px 1px',
                        boxShadow: `0 0 6px ${color}aa, inset 1px 0 0 rgba(255,255,255,0.3)`,
                      }}
                    >
                      {/* Label */}
                      <div
                        className="absolute left-1/2 -translate-x-1/2"
                        style={{
                          top: 6,
                          width: 7,
                          height: 6,
                          background: 'rgba(255,255,255,0.7)',
                        }}
                      />
                    </div>
                  </div>
                ))}
                {/* Shelf line */}
                <div
                  className="absolute left-0 right-0"
                  style={{
                    bottom: -2,
                    height: 1,
                    background: 'rgba(122,90,150,0.45)',
                  }}
                />
              </div>
            ))}
            {/* Glass reflection */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0"
              style={{
                background:
                  'linear-gradient(135deg, rgba(255,255,255,0.07) 0%, transparent 45%, rgba(0,240,255,0.05) 100%)',
              }}
            />
            {/* Scanlines */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0"
              style={{
                backgroundImage:
                  'repeating-linear-gradient(0deg, rgba(0,0,0,0.25) 0 1px, transparent 1px 3px)',
              }}
            />
          </div>

          {/* === Coin slot panel === */}
          <div
            className="absolute left-2 right-2 border-2 border-black"
            style={{
              top: 166,
              height: 22,
              background:
                'linear-gradient(180deg, #2a1448, #170828)',
              boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.08)',
            }}
          >
            <div className="flex h-full w-full items-center justify-between px-2">
              {/* Coin slot */}
              <div className="flex items-center gap-1">
                <div
                  className="rounded-sm"
                  style={{
                    width: 8,
                    height: 2,
                    background: '#ffe600',
                    boxShadow: '0 0 4px #ffe600',
                  }}
                />
                <span className="font-pixel text-[6px] tracking-widest text-text-muted">
                  25¢
                </span>
              </div>
              {/* Keypad blocks */}
              <div className="flex gap-0.5">
                {['A', '1', '2'].map((k) => (
                  <span
                    key={k}
                    className="font-pixel text-[6px] tracking-widest"
                    style={{
                      width: 8,
                      height: 8,
                      lineHeight: '8px',
                      textAlign: 'center',
                      background: '#0a0118',
                      color: '#7a5a96',
                      border: '1px solid #361052',
                    }}
                  >
                    {k}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* === Delivery slot (large opening at the bottom) === */}
          <div
            className="absolute left-2 right-2 border-2 border-black"
            style={{
              top: 194,
              height: 36,
              background:
                'linear-gradient(180deg, #050009 0%, #000000 100%)',
              boxShadow:
                'inset 0 4px 8px rgba(0,0,0,0.9), inset 0 -1px 0 rgba(255,255,255,0.04)',
            }}
          >
            <div className="flex h-full w-full items-center justify-center">
              <span
                className="font-pixel text-[7px] tracking-widest"
                style={{
                  color: '#7a5a96',
                  textShadow: '0 0 4px rgba(122,90,150,0.6)',
                }}
              >
                /COMMS
              </span>
            </div>
            {/* Flap lip */}
            <div
              className="absolute inset-x-2 top-1"
              style={{
                height: 2,
                background: '#1a0a2a',
              }}
            />
          </div>
        </div>
      </button>
    </div>
  );
}

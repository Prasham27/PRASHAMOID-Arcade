'use client';

import { useState } from 'react';
import { cn } from '@/lib/cn';

export interface VendingmachineProps {
  x: number;
  y: number;
  active?: boolean;
  onActivate: () => void;
}

/** Small pixel vending machine — clickable, routes to /comms. */
export function Vendingmachine({
  x,
  y,
  active,
  onActivate,
}: VendingmachineProps) {
  const [hovered, setHovered] = useState(false);
  const W = 70;
  const H = 130;
  const glowBorder = active || hovered ? '#ffe600' : '#361052';
  const shadow =
    active || hovered
      ? '0 0 14px #ffe600aa, 0 0 28px #ffe60055'
      : '0 0 6px #36105244';

  return (
    <div
      className="absolute z-20"
      style={{ left: x - W / 2, top: y, width: W, height: H }}
    >
      <div
        aria-hidden={!active}
        className={cn(
          'absolute left-1/2 -translate-x-1/2 -top-8 font-pixel text-[9px] tracking-widest text-yellow phosphor-yellow whitespace-nowrap',
          active ? 'opacity-100 animate-pulse' : 'opacity-0',
        )}
        style={{ transition: 'opacity 150ms ease-out' }}
      >
        [E] DROP COIN
      </div>

      <button
        type="button"
        onClick={onActivate}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        aria-label="Vending machine — send a message"
        className="block h-full w-full text-left focus:outline-none"
        style={{ filter: 'drop-shadow(0 8px 6px rgba(0,0,0,0.7))' }}
      >
        <div
          className="relative h-full w-full bg-bg-2"
          style={{
            border: `2px solid ${glowBorder}`,
            boxShadow: shadow,
          }}
        >
          {/* header */}
          <div
            className="absolute inset-x-1 top-1 border border-border bg-bg px-1 text-center font-pixel text-[7px] tracking-widest text-pink phosphor-pink"
            style={{ height: 12, lineHeight: '10px' }}
          >
            COMMS
          </div>

          {/* glass display with 3 glowing items */}
          <div
            className="absolute inset-x-1 top-[16px] border-2 border-border bg-bg"
            style={{
              height: 70,
              boxShadow:
                'inset 0 0 12px rgba(0,0,0,0.85), inset 0 0 18px rgba(0,240,255,0.15)',
            }}
          >
            <div className="grid h-full w-full grid-cols-3 items-center justify-items-center px-1">
              <span
                className="block h-4 w-4 rounded-full"
                style={{
                  background: '#ff2c9f',
                  boxShadow: '0 0 8px #ff2c9f',
                }}
              />
              <span
                className="block h-4 w-4"
                style={{
                  background: '#00f0ff',
                  boxShadow: '0 0 8px #00f0ff',
                }}
              />
              <span
                className="block h-4 w-4 rotate-45"
                style={{
                  background: '#39ff14',
                  boxShadow: '0 0 8px #39ff14',
                }}
              />
            </div>
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0"
              style={{
                backgroundImage:
                  'repeating-linear-gradient(0deg, rgba(0,0,0,0.3) 0 1px, transparent 1px 3px)',
              }}
            />
          </div>

          {/* coin slot */}
          <div
            className="absolute left-2 right-2 top-[90px] flex items-center justify-between border border-border bg-bg px-1 py-0.5"
            style={{ height: 12 }}
          >
            <div
              className="h-[2px] w-3"
              style={{ background: '#ffe600', boxShadow: '0 0 4px #ffe600' }}
            />
            <span className="font-pixel text-[6px] tracking-widest text-text-muted">
              INSERT
            </span>
          </div>

          {/* dispenser tray */}
          <div
            className="absolute inset-x-2 bottom-1 border border-border bg-bg"
            style={{
              height: 18,
              boxShadow: 'inset 0 4px 6px rgba(0,0,0,0.6)',
            }}
          >
            <div className="flex h-full items-center justify-center">
              <span className="font-pixel text-[6px] tracking-widest text-text-muted">
                /COMMS
              </span>
            </div>
          </div>
        </div>
      </button>
    </div>
  );
}

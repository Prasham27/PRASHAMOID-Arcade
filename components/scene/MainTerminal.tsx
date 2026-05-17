'use client';

import { SceneCabinet } from './SceneCabinet';
import { PixelText } from '@/components/effects/PixelText';

export interface MainTerminalProps {
  x: number;
  y: number;
  active?: boolean;
  onActivate: () => void;
}

/** The centerpiece — bigger, with extra ornamentation around a SceneCabinet. */
export function MainTerminal({ x, y, active, onActivate }: MainTerminalProps) {
  const W = 200;
  const scale = 1;
  // Outer shell width matches the inner SceneCabinet (big-terminal variant)
  const shellLeft = x - (W * scale) / 2;

  const frames = [
    <PixelText key="f1" size="md" color="cyan" glow>
      OVERVIEW //
    </PixelText>,
    <div key="f2" className="flex flex-col items-center gap-1">
      <PixelText size="xs" color="text-dim">
        ROOM MAP
      </PixelText>
      <PixelText size="md" color="cyan" glow>
        PRASHAM
      </PixelText>
    </div>,
    <PixelText key="f3" size="sm" color="yellow" glow>
      &gt; ACCESS_ROOT
    </PixelText>,
  ];

  return (
    <>
      {/* Power-core glow behind the cabinet */}
      <div
        aria-hidden
        className="absolute z-10 rounded-full"
        style={{
          left: x - 110,
          top: y - 30,
          width: 220,
          height: 80,
          background:
            'radial-gradient(closest-side, rgba(0,240,255,0.35), transparent 70%)',
          filter: 'blur(8px)',
        }}
      />

      {/* Left & right pipes */}
      <div
        aria-hidden
        className="absolute z-20"
        style={{
          left: shellLeft - 16,
          top: y + 40,
          width: 12,
          height: 200,
          background:
            'linear-gradient(180deg, #361052, #1c0429 50%, #361052)',
          border: '2px solid #361052',
          boxShadow: 'inset 0 0 6px rgba(0,240,255,0.3)',
        }}
      />
      <div
        aria-hidden
        className="absolute z-20"
        style={{
          left: shellLeft + W + 6,
          top: y + 40,
          width: 12,
          height: 200,
          background:
            'linear-gradient(180deg, #361052, #1c0429 50%, #361052)',
          border: '2px solid #361052',
          boxShadow: 'inset 0 0 6px rgba(255,44,159,0.3)',
        }}
      />

      {/* Vents (top dome) */}
      <div
        aria-hidden
        className="absolute z-20"
        style={{
          left: x - 60,
          top: y - 14,
          width: 120,
          height: 14,
          background: '#14001f',
          border: '2px solid #361052',
          backgroundImage:
            'repeating-linear-gradient(90deg, rgba(0,240,255,0.4) 0 2px, transparent 2px 6px)',
        }}
      />

      <SceneCabinet
        x={x}
        y={y}
        scale={scale}
        label="OVERVIEW TERMINAL"
        accent="cyan"
        accentSecondary="pink"
        screenFrames={frames}
        onActivate={onActivate}
        active={active}
        variant="big-terminal"
      />

      {/* Power core orb at base */}
      <div
        aria-hidden
        className="absolute z-30 rounded-full"
        style={{
          left: x - 8,
          top: y + 268,
          width: 16,
          height: 16,
          background: 'radial-gradient(closest-side, #00f0ff, #14001f 80%)',
          boxShadow: '0 0 14px #00f0ff, 0 0 28px #ff2c9f88',
        }}
      />
    </>
  );
}

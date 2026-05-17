import type { ReactElement } from 'react';

export interface SynthwaveWindowProps {
  /** World-x of the window's left edge. */
  x: number;
  /** World-y of the window's top edge. */
  y: number;
  /** Width in px. Default 480. */
  width?: number;
  /** Height in px. Default 340. */
  height?: number;
}

interface Building {
  /** Left offset within the window's interior, in fraction (0..1). */
  left: number;
  width: number;
  height: number;
  /** Hex */
  color: string;
  /** Number of lit window dots (2..4). */
  litWindows?: number;
}

interface MountainPeak {
  /** Center x of peak as fraction (0..1). */
  x: number;
  /** Peak height as fraction of available sky height. */
  height: number;
  /** Peak base half-width as fraction. */
  width: number;
  /** Hex shade. */
  color: string;
}

const BUILDINGS: Building[] = [
  { left: 0.02, width: 0.1, height: 0.34, color: '#1a0a2a', litWindows: 2 },
  { left: 0.11, width: 0.12, height: 0.55, color: '#22103a', litWindows: 4 },
  { left: 0.22, width: 0.08, height: 0.42, color: '#1c0830', litWindows: 2 },
  { left: 0.29, width: 0.14, height: 0.66, color: '#27143f', litWindows: 4 },
  { left: 0.42, width: 0.09, height: 0.38, color: '#1a0a2a', litWindows: 3 },
  { left: 0.5, width: 0.11, height: 0.5, color: '#22103a', litWindows: 3 },
  { left: 0.6, width: 0.07, height: 0.32, color: '#1c0830', litWindows: 2 },
  { left: 0.66, width: 0.13, height: 0.62, color: '#27143f', litWindows: 4 },
  { left: 0.78, width: 0.09, height: 0.45, color: '#1a0a2a', litWindows: 3 },
  { left: 0.86, width: 0.1, height: 0.55, color: '#22103a', litWindows: 4 },
];

const MOUNTAINS: MountainPeak[] = [
  { x: 0.08, height: 0.18, width: 0.16, color: '#1a0030' },
  { x: 0.22, height: 0.28, width: 0.2, color: '#150028' },
  { x: 0.4, height: 0.22, width: 0.18, color: '#1a0030' },
  { x: 0.58, height: 0.32, width: 0.22, color: '#100020' },
  { x: 0.78, height: 0.24, width: 0.2, color: '#1a0030' },
  { x: 0.92, height: 0.18, width: 0.16, color: '#150028' },
];

const STARS: Array<{ x: number; y: number; bright?: boolean }> = [
  { x: 0.06, y: 0.08, bright: true },
  { x: 0.13, y: 0.22 },
  { x: 0.18, y: 0.05 },
  { x: 0.24, y: 0.14, bright: true },
  { x: 0.31, y: 0.28 },
  { x: 0.36, y: 0.06 },
  { x: 0.42, y: 0.18 },
  { x: 0.48, y: 0.1 },
  { x: 0.54, y: 0.25, bright: true },
  { x: 0.59, y: 0.04 },
  { x: 0.66, y: 0.16 },
  { x: 0.71, y: 0.3 },
  { x: 0.76, y: 0.08 },
  { x: 0.83, y: 0.22, bright: true },
  { x: 0.88, y: 0.12 },
  { x: 0.93, y: 0.28 },
  { x: 0.04, y: 0.32 },
  { x: 0.32, y: 0.36 },
  { x: 0.46, y: 0.32 },
];

/** Static window high on the back wall — synthwave skyline interior. */
export function SynthwaveWindow({
  x,
  y,
  width = 480,
  height = 340,
}: SynthwaveWindowProps) {
  // Frame metrics
  const frameThickness = 8;
  const innerInset = frameThickness;
  const innerW = width - innerInset * 2;
  const innerH = height - innerInset * 2;

  // Mullion thickness
  const mull = 5;
  // 3 columns × 2 rows of glass panes → 2 vertical bars, 1 horizontal bar
  const colCount = 3;
  const rowCount = 2;
  const colWidth = innerW / colCount;
  const rowHeight = innerH / rowCount;

  // Horizon line (where ground/road meets sky) — about 62% down
  const horizonY = innerH * 0.62;
  // Sky region height (used to scale mountain heights)
  const skyH = horizonY;
  // Ground (grid) region height
  const groundH = innerH - horizonY;

  // Rivet positions (4 corners of the frame)
  const rivetOffset = 4;

  return (
    <div
      className="absolute"
      style={{ left: x, top: y, width, height, zIndex: 4 }}
      aria-hidden
    >
      {/* === Outer cyan/blue glow bleeding onto bricks === */}
      <div
        className="pointer-events-none absolute"
        style={{
          left: -28,
          top: -28,
          width: width + 56,
          height: height + 56,
          background:
            'radial-gradient(ellipse at center, rgba(80,180,255,0.28) 0%, rgba(0,200,255,0.12) 35%, transparent 70%)',
          filter: 'blur(8px)',
          mixBlendMode: 'screen',
          zIndex: -1,
        }}
      />

      {/* === Window frame === */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(180deg, #2a2a36 0%, #1a1a24 50%, #0e0e16 100%)',
          border: '3px solid #050009',
          boxShadow: [
            'inset 2px 2px 0 rgba(255,255,255,0.08)',
            'inset -2px -2px 0 rgba(0,0,0,0.7)',
            '0 6px 18px rgba(0,0,0,0.75)',
          ].join(', '),
        }}
      />

      {/* === Frame rivets (corners) === */}
      {[
        { left: rivetOffset, top: rivetOffset },
        { left: width - rivetOffset - 5, top: rivetOffset },
        { left: rivetOffset, top: height - rivetOffset - 5 },
        { left: width - rivetOffset - 5, top: height - rivetOffset - 5 },
      ].map((pos, i) => (
        <div
          key={`rivet-${i}`}
          className="absolute rounded-full"
          style={{
            left: pos.left,
            top: pos.top,
            width: 5,
            height: 5,
            background:
              'radial-gradient(circle at 30% 30%, #6a6a78, #1a1a24 70%, #050009 100%)',
            boxShadow:
              'inset 0 1px 0 rgba(255,255,255,0.25), 0 1px 1px rgba(0,0,0,0.6)',
          }}
        />
      ))}

      {/* === Interior sky + skyline === */}
      <div
        className="absolute overflow-hidden"
        style={{
          left: innerInset,
          top: innerInset,
          width: innerW,
          height: innerH,
          background: [
            // Sun-flare radial near horizon (hot pink/magenta core)
            'radial-gradient(ellipse 70% 30% at 50% 62%, rgba(255,128,200,0.45) 0%, transparent 60%)',
            // Vertical sky gradient: deep purple at top → magenta → hot pink at horizon
            'linear-gradient(180deg, #1a0030 0%, #2d0445 20%, #4a0a55 38%, #8a1c70 52%, #e63ee2 58%, #ff5a8a 62%, #1a0a2a 64%, #0a0014 100%)',
          ].join(', '),
        }}
      >
        {/* === Stars (some twinkle subtly via existing animate-flicker) === */}
        {STARS.map((s, i) => {
          const sz = s.bright ? 2 : 1;
          return (
            <span
              key={`star-${i}`}
              className={s.bright ? 'animate-flicker' : undefined}
              style={{
                position: 'absolute',
                left: s.x * innerW,
                top: s.y * skyH,
                width: sz,
                height: sz,
                background: '#f5e8ff',
                boxShadow: s.bright
                  ? '0 0 4px #f5e8ff, 0 0 8px rgba(245,232,255,0.7)'
                  : undefined,
              }}
            />
          );
        })}

        {/* === Crescent moon (larger, slightly off-center upper-right) === */}
        <div
          className="absolute"
          style={{
            left: innerW * 0.7,
            top: innerH * 0.08,
            width: 26,
            height: 26,
          }}
        >
          {/* Moon disc */}
          <div
            className="absolute inset-0 rounded-full"
            style={{
              background:
                'radial-gradient(circle at 35% 35%, #fff6c2 0%, #ffe9a5 55%, #c79438 100%)',
              boxShadow:
                '0 0 10px rgba(255,233,165,0.8), 0 0 22px rgba(255,200,140,0.45)',
            }}
          />
          {/* Cutout shadow → crescent */}
          <div
            className="absolute rounded-full"
            style={{
              left: 8,
              top: -2,
              width: 26,
              height: 26,
              background:
                'radial-gradient(ellipse at 30% 50%, #4a0a55 0%, #4a0a55 68%, transparent 72%)',
            }}
          />
        </div>

        {/* === Mountain range silhouette (just above horizon) === */}
        <svg
          className="absolute left-0"
          style={{ top: 0, width: innerW, height: skyH }}
          viewBox={`0 0 ${innerW} ${skyH}`}
          preserveAspectRatio="none"
        >
          {/* Back mountain layer */}
          <polygon
            points={MOUNTAINS.map((m) => {
              const baseY = skyH;
              const peakX = m.x * innerW;
              const peakY = skyH - m.height * skyH;
              const halfW = m.width * innerW * 0.5;
              return `${peakX - halfW},${baseY} ${peakX},${peakY} ${peakX + halfW},${baseY}`;
            }).join(' ')}
            fill="#150028"
            opacity={0.85}
          />
          {/* Front sharper jagged ridge */}
          <polygon
            points={(() => {
              const pts: string[] = [`0,${skyH}`];
              const segments = 18;
              for (let i = 0; i <= segments; i++) {
                const sx = (i / segments) * innerW;
                // pseudo-random ridge height
                const h = ((Math.sin(i * 1.7) + Math.sin(i * 0.7)) * 0.5 + 0.5) * 0.16 + 0.04;
                pts.push(`${sx},${skyH - h * skyH}`);
              }
              pts.push(`${innerW},${skyH}`);
              return pts.join(' ');
            })()}
            fill="#0a0018"
            opacity={0.9}
          />
        </svg>

        {/* === Horizon glow line === */}
        <div
          className="absolute left-0 right-0"
          style={{
            top: horizonY - 1,
            height: 3,
            background:
              'linear-gradient(90deg, transparent, #ff8c1a 15%, #ff5a8a 40%, #00f0ff 50%, #ff5a8a 60%, #ff8c1a 85%, transparent)',
            boxShadow:
              '0 0 10px rgba(0,240,255,0.8), 0 0 24px rgba(255,90,138,0.6), 0 0 36px rgba(255,140,26,0.4)',
          }}
        />

        {/* === City buildings (silhouettes) — sit in front of mountains === */}
        {BUILDINGS.map((b, i) => {
          const bw = b.width * innerW;
          const bh = b.height * (skyH * 0.55);
          const bx = b.left * innerW;
          const by = horizonY - bh;
          const lits = b.litWindows ?? 3;
          // Lit-window dots — small yellow/cyan rectangles distributed inside
          const dots: Array<{ left: number; top: number; color: string }> = [];
          for (let d = 0; d < lits; d++) {
            const dl = bw * (0.2 + (d / Math.max(1, lits)) * 0.6);
            const dt = bh * (0.25 + ((d * 0.37) % 0.5));
            const color = d % 2 === 0 ? 'rgba(255,230,0,0.85)' : 'rgba(0,240,255,0.7)';
            dots.push({ left: dl, top: dt, color });
          }
          return (
            <div
              key={`bld-${i}`}
              className="absolute"
              style={{
                left: bx,
                top: by,
                width: bw,
                height: bh,
                background: b.color,
                borderTop: '1px solid #050009',
                borderLeft: '1px solid #050009',
                borderRight: '1px solid #050009',
              }}
            >
              {dots.map((dot, di) => (
                <span
                  key={`dot-${di}`}
                  className="absolute"
                  style={{
                    left: dot.left,
                    top: dot.top,
                    width: 2,
                    height: 2,
                    background: dot.color,
                    boxShadow: `0 0 2px ${dot.color}`,
                  }}
                />
              ))}
            </div>
          );
        })}

        {/* === Palm tree silhouette (left side, foreground) === */}
        <div
          className="absolute"
          style={{
            left: innerW * 0.03,
            top: horizonY - 56,
            width: 28,
            height: 60,
            pointerEvents: 'none',
          }}
        >
          {/* Trunk */}
          <div
            className="absolute"
            style={{
              left: 13,
              top: 18,
              width: 2,
              height: 44,
              background: '#050009',
            }}
          />
          {/* Slight curve via second segment */}
          <div
            className="absolute"
            style={{
              left: 12,
              top: 30,
              width: 4,
              height: 32,
              background:
                'linear-gradient(180deg, transparent, #050009 30%, #050009 100%)',
            }}
          />
          {/* Fronds — SVG for clean diagonals */}
          <svg
            className="absolute left-0 top-0"
            width={28}
            height={28}
            viewBox="0 0 28 28"
          >
            <g fill="#050009">
              <polygon points="14,14 2,8 0,12 12,16" />
              <polygon points="14,14 26,8 28,12 16,16" />
              <polygon points="14,14 4,2 8,0 14,12" />
              <polygon points="14,14 24,2 20,0 14,12" />
              <polygon points="14,14 14,0 16,0 16,14" />
              <polygon points="14,14 0,18 2,22 14,16" />
              <polygon points="14,14 28,18 26,22 14,16" />
            </g>
          </svg>
        </div>

        {/* === Synthwave grid (perspective recession to horizon) === */}
        <svg
          className="absolute left-0"
          style={{
            top: horizonY,
            width: innerW,
            height: groundH,
            pointerEvents: 'none',
          }}
          viewBox={`0 0 ${innerW} ${groundH}`}
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="grid-fade" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ff2c9f" stopOpacity="1" />
              <stop offset="100%" stopColor="#00f0ff" stopOpacity="0.7" />
            </linearGradient>
          </defs>
          {/* Ground base — deep purple */}
          <rect
            x={0}
            y={0}
            width={innerW}
            height={groundH}
            fill="#0a0014"
          />
          {/* Horizontal recession lines (closer-spaced near horizon) */}
          {(() => {
            const lines: ReactElement[] = [];
            const rowCnt = 8;
            for (let i = 1; i <= rowCnt; i++) {
              const t = i / rowCnt;
              // Exponential spacing: closer at top (horizon), farther at bottom
              const yy = groundH * Math.pow(t, 1.7);
              const op = 0.3 + t * 0.55;
              lines.push(
                <line
                  key={`h-${i}`}
                  x1={0}
                  y1={yy}
                  x2={innerW}
                  y2={yy}
                  stroke="url(#grid-fade)"
                  strokeWidth={t < 0.4 ? 0.6 : 1}
                  opacity={op}
                />,
              );
            }
            return lines;
          })()}
          {/* Vertical perspective lines fanning from a center vanishing point */}
          {(() => {
            const lines: ReactElement[] = [];
            const vpX = innerW / 2;
            const colCnt = 14;
            for (let i = -colCnt / 2; i <= colCnt / 2; i++) {
              if (i === 0) continue;
              const baseX = vpX + (i / (colCnt / 2)) * innerW * 0.7;
              lines.push(
                <line
                  key={`v-${i}`}
                  x1={vpX}
                  y1={0}
                  x2={baseX}
                  y2={groundH}
                  stroke="url(#grid-fade)"
                  strokeWidth={0.7}
                  opacity={0.7}
                />,
              );
            }
            return lines;
          })()}
        </svg>

        {/* === Soft cyan road glow at bottom === */}
        <div
          className="absolute left-0 right-0 bottom-0"
          style={{
            height: 18,
            background:
              'linear-gradient(0deg, rgba(0,240,255,0.22), transparent)',
            pointerEvents: 'none',
          }}
        />
      </div>

      {/* === Vertical mullion bars (2 verticals splitting 3 columns) === */}
      {Array.from({ length: colCount - 1 }).map((_, i) => (
        <div
          key={`vmull-${i}`}
          className="absolute"
          style={{
            left: innerInset + (i + 1) * colWidth - mull / 2,
            top: innerInset,
            width: mull,
            height: innerH,
            background:
              'linear-gradient(90deg, #050009 0%, #32323e 50%, #050009 100%)',
            boxShadow:
              '0 0 0 1px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.08)',
          }}
        />
      ))}

      {/* === Horizontal mullion bars (1 horizontal splitting 2 rows) === */}
      {Array.from({ length: rowCount - 1 }).map((_, i) => (
        <div
          key={`hmull-${i}`}
          className="absolute"
          style={{
            left: innerInset,
            top: innerInset + (i + 1) * rowHeight - mull / 2,
            width: innerW,
            height: mull,
            background:
              'linear-gradient(180deg, #050009 0%, #32323e 50%, #050009 100%)',
            boxShadow:
              '0 0 0 1px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.08)',
          }}
        />
      ))}

      {/* === Mullion-intersection rivets (small dark dots) === */}
      {Array.from({ length: colCount - 1 }).flatMap((_, ci) =>
        Array.from({ length: rowCount - 1 }).map((_, ri) => (
          <div
            key={`xmull-${ci}-${ri}`}
            className="absolute rounded-full"
            style={{
              left: innerInset + (ci + 1) * colWidth - 3,
              top: innerInset + (ri + 1) * rowHeight - 3,
              width: 6,
              height: 6,
              background:
                'radial-gradient(circle at 30% 30%, #6a6a78, #1a1a24 70%, #050009 100%)',
              boxShadow:
                'inset 0 1px 0 rgba(255,255,255,0.25), 0 1px 1px rgba(0,0,0,0.7)',
            }}
          />
        )),
      )}

      {/* === Glass reflection sweep (diagonal bright-to-transparent) === */}
      <div
        className="pointer-events-none absolute"
        style={{
          left: innerInset,
          top: innerInset,
          width: innerW,
          height: innerH,
          background:
            'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.04) 25%, transparent 50%, transparent 75%, rgba(150,220,255,0.05) 100%)',
          mixBlendMode: 'screen',
        }}
      />

      {/* === Window sill (slightly chunkier for the bigger window) === */}
      <div
        className="absolute"
        style={{
          left: -6,
          right: -6,
          bottom: -10,
          height: 12,
          background:
            'linear-gradient(180deg, #2a2a36 0%, #1a1a24 50%, #0e0e16 100%)',
          border: '2px solid #050009',
          boxShadow:
            '0 6px 10px rgba(0,0,0,0.75), inset 0 1px 0 rgba(255,255,255,0.08)',
        }}
      />
    </div>
  );
}

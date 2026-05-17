export interface SynthwaveWindowProps {
  /** World-x of the window's left edge. */
  x: number;
  /** World-y of the window's top edge. */
  y: number;
  /** Width in px. Default 180. */
  width?: number;
  /** Height in px. Default 120. */
  height?: number;
}

interface Building {
  /** Left offset within the window's interior, in fraction (0..1). */
  left: number;
  width: number;
  height: number;
  /** Hex */
  color: string;
}

const BUILDINGS: Building[] = [
  { left: 0.04, width: 0.16, height: 0.34, color: '#1a0a2a' },
  { left: 0.18, width: 0.2, height: 0.55, color: '#22103a' },
  { left: 0.38, width: 0.14, height: 0.45, color: '#1c0830' },
  { left: 0.5, width: 0.18, height: 0.62, color: '#27143f' },
  { left: 0.66, width: 0.16, height: 0.4, color: '#1a0a2a' },
  { left: 0.8, width: 0.16, height: 0.5, color: '#22103a' },
];

const STARS: Array<{ x: number; y: number; bright?: boolean }> = [
  { x: 0.12, y: 0.18, bright: true },
  { x: 0.28, y: 0.1 },
  { x: 0.46, y: 0.24 },
  { x: 0.6, y: 0.08, bright: true },
  { x: 0.76, y: 0.18 },
  { x: 0.88, y: 0.3 },
  { x: 0.34, y: 0.32 },
];

/** Static-ish window high on the back wall — synthwave skyline interior. */
export function SynthwaveWindow({
  x,
  y,
  width = 180,
  height = 120,
}: SynthwaveWindowProps) {
  // Mullion thickness
  const mull = 4;
  // The interior viewport (after frame inset)
  const innerInset = 6;
  const innerW = width - innerInset * 2;
  const innerH = height - innerInset * 2;
  const horizonY = innerH * 0.7;

  return (
    <div
      className="absolute"
      style={{ left: x, top: y, width, height, zIndex: 4 }}
      aria-hidden
    >
      {/* === Window frame === */}
      <div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(180deg, #2a2a36 0%, #14141c 100%)',
          border: '3px solid #050009',
          boxShadow: [
            'inset 2px 2px 0 rgba(255,255,255,0.08)',
            'inset -2px -2px 0 rgba(0,0,0,0.7)',
            '0 4px 10px rgba(0,0,0,0.7)',
          ].join(', '),
        }}
      />

      {/* === Interior sky + skyline === */}
      <div
        className="absolute overflow-hidden"
        style={{
          left: innerInset,
          top: innerInset,
          width: innerW,
          height: innerH,
          background: [
            // sun-flare radial
            'radial-gradient(ellipse at 50% 75%, rgba(255,128,200,0.35) 0%, transparent 55%)',
            // vertical sky gradient
            'linear-gradient(180deg, #1a0030 0%, #4a0a55 35%, #8a1c70 60%, #ff5a8a 75%, #ff90b8 80%, #1a0a2a 82%, #0a0014 100%)',
          ].join(', '),
        }}
      >
        {/* === Stars (with very subtle twinkle, reduced-motion safe) === */}
        {STARS.map((s, i) => {
          const sz = s.bright ? 2 : 1;
          return (
            <span
              key={`star-${i}`}
              className={s.bright ? 'animate-flicker' : undefined}
              style={{
                position: 'absolute',
                left: s.x * innerW,
                top: s.y * horizonY,
                width: sz,
                height: sz,
                background: '#f5e8ff',
                boxShadow: s.bright
                  ? '0 0 3px #f5e8ff, 0 0 6px rgba(245,232,255,0.6)'
                  : undefined,
              }}
            />
          );
        })}

        {/* === Crescent moon === */}
        <div
          className="absolute"
          style={{
            left: innerW * 0.78,
            top: innerH * 0.12,
            width: 12,
            height: 12,
          }}
        >
          {/* moon disc */}
          <div
            className="absolute inset-0 rounded-full"
            style={{
              background:
                'radial-gradient(circle at 35% 35%, #fff6c2 0%, #ffe9a5 60%, #b8862a 100%)',
              boxShadow:
                '0 0 6px rgba(255,233,165,0.7), 0 0 12px rgba(255,200,140,0.4)',
            }}
          />
          {/* cutout shadow → crescent */}
          <div
            className="absolute rounded-full"
            style={{
              left: 4,
              top: -1,
              width: 12,
              height: 12,
              background:
                'radial-gradient(ellipse at 30% 50%, #4a0a55 0%, #4a0a55 65%, transparent 70%)',
            }}
          />
        </div>

        {/* === Horizon glow line === */}
        <div
          className="absolute left-0 right-0"
          style={{
            top: horizonY - 1,
            height: 2,
            background:
              'linear-gradient(90deg, transparent, #ff5a8a, #00f0ff 50%, #ff5a8a, transparent)',
            boxShadow:
              '0 0 6px rgba(0,240,255,0.7), 0 0 12px rgba(255,90,138,0.5)',
          }}
        />

        {/* === Skyline buildings (silhouettes) === */}
        {BUILDINGS.map((b, i) => {
          const bw = b.width * innerW;
          const bh = b.height * (innerH - horizonY) + (innerH - horizonY) * 0.5;
          return (
            <div
              key={`bld-${i}`}
              className="absolute"
              style={{
                left: b.left * innerW,
                top: horizonY - bh + 4,
                width: bw,
                height: bh,
                background: b.color,
                border: '1px solid #050009',
                // tiny window dots
                backgroundImage: `repeating-linear-gradient(0deg, ${b.color} 0 3px, rgba(255,230,0,0.18) 3px 4px, ${b.color} 4px 7px), repeating-linear-gradient(90deg, ${b.color} 0 3px, transparent 3px 4px)`,
              }}
            />
          );
        })}

        {/* === Foreground horizon road glow === */}
        <div
          className="absolute left-0 right-0 bottom-0"
          style={{
            height: 12,
            background:
              'linear-gradient(0deg, rgba(0,240,255,0.18), transparent)',
          }}
        />
      </div>

      {/* === Mullion cross (cross bars) === */}
      <div
        className="absolute"
        style={{
          left: width / 2 - mull / 2,
          top: innerInset,
          width: mull,
          height: innerH,
          background:
            'linear-gradient(90deg, #050009 0%, #2a2a36 50%, #050009 100%)',
          boxShadow: '0 0 0 1px rgba(0,0,0,0.6)',
        }}
      />
      <div
        className="absolute"
        style={{
          left: innerInset,
          top: height / 2 - mull / 2,
          width: innerW,
          height: mull,
          background:
            'linear-gradient(180deg, #050009 0%, #2a2a36 50%, #050009 100%)',
          boxShadow: '0 0 0 1px rgba(0,0,0,0.6)',
        }}
      />

      {/* === Faint inner glass reflection === */}
      <div
        className="pointer-events-none absolute"
        style={{
          left: innerInset,
          top: innerInset,
          width: innerW,
          height: innerH,
          background:
            'linear-gradient(135deg, rgba(255,255,255,0.06) 0%, transparent 45%)',
        }}
      />

      {/* === Window sill === */}
      <div
        className="absolute"
        style={{
          left: -4,
          right: -4,
          bottom: -6,
          height: 8,
          background:
            'linear-gradient(180deg, #2a2a36 0%, #14141c 100%)',
          border: '2px solid #050009',
          boxShadow:
            '0 4px 6px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.08)',
        }}
      />
    </div>
  );
}

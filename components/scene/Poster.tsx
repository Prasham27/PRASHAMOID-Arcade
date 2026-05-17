import type { CSSProperties } from 'react';

export interface PosterProps {
  /** World-x of the poster's left edge. */
  x: number;
  /** World-y of the poster's top edge. */
  y: number;
  /** Width in px. Default 90. */
  width?: number;
  /** Height in px. Default 120. */
  height?: number;
  /** Which design variant to render. */
  variant?: 'spaceship' | 'dragon' | 'tourney';
}

interface PixelGridDef {
  rows: string[];
  palette: Record<string, string>;
  pixel: number;
}

function PixelGrid({
  rows,
  palette,
  pixel,
  style,
}: PixelGridDef & { style?: CSSProperties }) {
  const w = rows[0]?.length ?? 0;
  const h = rows.length;
  return (
    <div
      className="relative"
      style={{ width: w * pixel, height: h * pixel, ...style }}
    >
      {rows.flatMap((row, y) =>
        Array.from(row).map((ch, x) => {
          const c = palette[ch];
          if (!c || c === 'transparent') return null;
          return (
            <span
              key={`${x}-${y}`}
              className="absolute"
              style={{
                left: x * pixel,
                top: y * pixel,
                width: pixel,
                height: pixel,
                background: c,
              }}
            />
          );
        }),
      )}
    </div>
  );
}

// ── Variant defs ──────────────────────────────────────────────────────────
const SPACESHIP: PixelGridDef = {
  pixel: 3,
  palette: {
    '.': 'transparent',
    K: '#0b0014',
    S: '#f5e8ff',
    C: '#00f0ff',
    P: '#ff2c9f',
    F: '#ffe600',
  },
  // 14w x 10h
  rows: [
    '......KK......',
    '.....KSSK.....',
    '....KSSSSK....',
    '...KSCCCCSK...',
    '..KSCCPPCCSK..',
    '.KSCCCPPCCCSK.',
    'KSSCCCPPCCCSSK',
    'K..F.F..F.F..K',
    '.K.FF...FF...K',
    '..KK......KK..',
  ],
};

const DRAGON: PixelGridDef = {
  pixel: 3,
  palette: {
    '.': 'transparent',
    K: '#0b0014',
    G: '#39ff14',
    D: '#1a8a08',
    E: '#ff2c9f',
    F: '#ffe600',
  },
  // 14w x 10h — chunky dragon head silhouette
  rows: [
    '.....KKKKKK...',
    '....KGGGGGGK..',
    '...KGGDDDGGK..',
    '..KGGDGGGGGGK.',
    '.KGGDGEGGGGGK.',
    'KGGGGGGGGGGGK.',
    'KGGDGGGGGGGGK.',
    '.KGGGGGGGGGK..',
    '..KGFFKKKKK...',
    '...KFFK.......',
  ],
};

// ── Component ─────────────────────────────────────────────────────────────
const VARIANT_TITLES = {
  spaceship: 'ACE OF SPACE',
  dragon: '8-BIT DRAGON',
  tourney: 'TOURNEY TONITE',
} as const;

/** Decorative arcade poster — neon border, pixel art, chunky title. */
export function Poster({
  x,
  y,
  width = 90,
  height = 120,
  variant = 'spaceship',
}: PosterProps) {
  const borderColor = variant === 'dragon' ? '#39ff14' : '#ff2c9f';
  const accentColor = variant === 'dragon' ? '#ffe600' : '#00f0ff';
  const title = VARIANT_TITLES[variant];
  const grid =
    variant === 'dragon' || variant === 'tourney' ? DRAGON : SPACESHIP;

  return (
    <div
      className="absolute"
      style={{ left: x, top: y, width, height, zIndex: 12 }}
      aria-hidden
    >
      {/* Frame / paper */}
      <div
        className="relative h-full w-full"
        style={{
          background:
            'linear-gradient(180deg, #1a0a2a 0%, #0e0118 100%)',
          border: `2px solid ${borderColor}`,
          boxShadow: [
            `0 0 10px ${borderColor}88`,
            'inset 0 0 0 2px rgba(0,0,0,0.4)',
            '0 4px 8px rgba(0,0,0,0.75)',
          ].join(', '),
        }}
      >
        {/* Inner accent rule */}
        <div
          className="absolute"
          style={{
            left: 4,
            right: 4,
            top: 4,
            bottom: 4,
            border: `1px solid ${accentColor}66`,
          }}
        />

        {/* Title strip */}
        <div
          className="absolute left-1 right-1 text-center font-pixel uppercase tracking-widest"
          style={{
            top: 6,
            fontSize: 8,
            color: borderColor,
            textShadow: `0 0 4px ${borderColor}, 0 0 8px ${borderColor}aa`,
            lineHeight: 1,
          }}
        >
          {title}
        </div>

        {/* Pixel-art illustration */}
        <div
          className="absolute left-1/2 -translate-x-1/2"
          style={{ top: 28 }}
        >
          <PixelGrid {...grid} />
        </div>

        {/* Bottom info bar (chunky pixel rules) */}
        <div
          className="absolute left-3 right-3"
          style={{
            bottom: 18,
            height: 2,
            background: `${accentColor}88`,
            boxShadow: `0 0 4px ${accentColor}88`,
          }}
        />
        <div
          className="absolute left-1 right-1 text-center font-pixel uppercase tracking-widest"
          style={{
            bottom: 6,
            fontSize: 6,
            color: accentColor,
            textShadow: `0 0 3px ${accentColor}`,
          }}
        >
          1 CREDIT
        </div>

        {/* Corner pins (paper-pinned-to-wall feel) */}
        {[
          { left: 4, top: 4 },
          { right: 4, top: 4 },
          { left: 4, bottom: 4 },
          { right: 4, bottom: 4 },
        ].map((pos, i) => (
          <span
            key={`pin-${i}`}
            className="absolute rounded-full"
            style={{
              ...pos,
              width: 3,
              height: 3,
              background: '#7a5a96',
              boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.25)',
            }}
          />
        ))}
      </div>
    </div>
  );
}

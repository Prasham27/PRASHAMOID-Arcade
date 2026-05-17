import type { CSSProperties } from 'react';

/** Tiny pixel-art icons that live inside arcade-cabinet CRT screens.
 *  Each is hand-coded as a small grid of absolutely-positioned divs.
 */

const PALETTE = {
  pink: '#ff2c9f',
  cyan: '#00f0ff',
  yellow: '#ffe600',
  green: '#39ff14',
  white: '#f5e8ff',
  dark: '#14001f',
  skin: '#f1c9a5',
} as const;

interface PixelGridProps {
  rows: string[];
  palette: Record<string, string>;
  pixel?: number;
  style?: CSSProperties;
}

function PixelGrid({ rows, palette, pixel = 3, style }: PixelGridProps) {
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

/** ABOUT ME — small hooded character sprite (12w x 14h). */
export function AboutMeArt() {
  const palette = {
    '.': 'transparent',
    H: PALETTE.dark,
    P: '#3d1c66',
    S: PALETTE.skin,
    E: PALETTE.dark,
    C: PALETTE.cyan,
    K: PALETTE.dark,
  };
  const rows = [
    '...HHHHHH...',
    '..HPPPPPPH..',
    '..HPSSSSPH..',
    '..HPSEESPH..',
    '..HPSSSSPH..',
    '..HPPPPPPH..',
    '..HPCCCCPH..',
    '..HPPPPPPH..',
    '..HPPPPPPH..',
    '..HPPPPPPH..',
    '..HPPPPPPH..',
    '..HK....KH..',
    '..HK....KH..',
    '..HK....KH..',
  ];
  return <PixelGrid rows={rows} palette={palette} pixel={3} />;
}

/** PROJECTS — 2x2 grid of colored project cards. */
export function ProjectsArt() {
  return (
    <div className="grid grid-cols-2 gap-1">
      {[PALETTE.pink, PALETTE.cyan, PALETTE.yellow, PALETTE.green].map(
        (c, i) => (
          <div
            key={i}
            className="border border-black"
            style={{
              width: 18,
              height: 18,
              background: c,
              boxShadow: `0 0 6px ${c}aa, inset 0 -2px 0 rgba(0,0,0,0.3)`,
            }}
          />
        ),
      )}
    </div>
  );
}

/** EXPERIENCE — ascending XP bar chart. */
export function ExperienceArt() {
  const heights = [10, 18, 26, 34, 42];
  return (
    <div className="flex items-end gap-1" style={{ height: 46 }}>
      {heights.map((h, i) => (
        <div
          key={i}
          style={{
            width: 7,
            height: h,
            background: PALETTE.yellow,
            boxShadow: `0 0 6px ${PALETTE.yellow}aa, inset 0 -2px 0 rgba(0,0,0,0.3)`,
            border: '1px solid #050009',
          }}
        />
      ))}
    </div>
  );
}

/** SKILLS — 5 hearts in a row (filled). */
export function SkillsArt() {
  // Tiny 7x6 heart shape
  const heartRows = [
    '.HH.HH.',
    'HHHHHHH',
    'HHHHHHH',
    '.HHHHH.',
    '..HHH..',
    '...H...',
  ];
  return (
    <div className="flex items-center gap-1">
      {[PALETTE.green, PALETTE.green, PALETTE.green, PALETTE.green, PALETTE.green].map(
        (c, i) => (
          <PixelGrid
            key={i}
            rows={heartRows}
            palette={{ '.': 'transparent', H: c }}
            pixel={2}
            style={{
              filter: `drop-shadow(0 0 3px ${c}aa)`,
            }}
          />
        ),
      )}
    </div>
  );
}

/** CONTACT — chunky pixel envelope. */
export function ContactArt() {
  const palette = {
    '.': 'transparent',
    P: PALETTE.pink,
    W: PALETTE.white,
    K: PALETTE.dark,
  };
  const rows = [
    'PPPPPPPPPPPPPP',
    'PWWWWWWWWWWWWP',
    'PWPWWWWWWWWPWP',
    'PWPPWWWWWWPPWP',
    'PWPPPWWWWPPPWP',
    'PWPPPPWWPPPPWP',
    'PWPPPPPPPPPPWP',
    'PWWWWWWWWWWWWP',
    'PPPPPPPPPPPPPP',
  ];
  return <PixelGrid rows={rows} palette={palette} pixel={3} />;
}

/** PRASHAMOID — tiny asteroid + ship. */
export function PrashamoidArt() {
  const palette = {
    '.': 'transparent',
    A: '#7a5a96',
    B: '#c7a8e8',
    S: PALETTE.cyan,
    P: PALETTE.pink,
    F: PALETTE.yellow,
  };
  const rows = [
    '..AABBA....SSSSS....',
    '.ABBBBAA..S.S.S.S...',
    '.AABBBAA..SSSSSSS...',
    '.ABBBAA....SSPSS....',
    '..AAA.......SPS.....',
    '...........FFFF.....',
  ];
  return <PixelGrid rows={rows} palette={palette} pixel={2} />;
}

/** Animated "PRESS START" blinking caption — used as a between-frames screen. */
export function PressStartCaption({ color }: { color: string }) {
  return (
    <div
      className="font-pixel text-[9px] tracking-widest animate-blink"
      style={{
        color,
        textShadow: `0 0 4px ${color}, 0 0 10px ${color}aa`,
      }}
    >
      PRESS START
    </div>
  );
}

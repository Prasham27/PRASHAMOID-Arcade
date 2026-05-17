export interface FloorGlow {
  /** Center-x of the glow puddle on the floor (scene coords). */
  x: number;
  /** RGB triplet for the glow tint, e.g. "255,44,159". */
  rgb: string;
  /** Optional intensity 0..1, default 0.35. */
  intensity?: number;
  /** Optional puddle width override, default 180. */
  width?: number;
}

export interface CeilingLampCfg {
  /** Center-x of the lamp + cone. */
  x: number;
  /** Top-y where the cable starts. Defaults to 0. */
  topY?: number;
  /** Cable length in px. Defaults 60. */
  cableLen?: number;
  /** Lamp tint, defaults warm yellow-white. */
  color?: string;
  /** Halo glow rgba, defaults warm yellow. */
  glow?: string;
  /** Cone width in px. Defaults 180. */
  coneWidth?: number;
}

export interface WallPosterCfg {
  x: number;
  y: number;
  color: string;
  glow: string;
  title: string;
  sub?: string;
}

export interface SceneBackgroundProps {
  width: number;
  height: number;
  /** Y-coordinate where the floor begins (back wall ends). */
  floorY: number;
  /** Floor-glow puddles bleeding from cabinets/props. */
  floorGlows?: FloorGlow[];
  /** Ceiling lamps with cones (over cabinets + wing props). */
  ceilingLamps?: CeilingLampCfg[];
  /** Wall posters (the small in-background ones — not the wing Poster comp). */
  wallPosters?: WallPosterCfg[];
}

const DEFAULT_LAMPS: CeilingLampCfg[] = [
  { x: 320 },
  { x: 700, cableLen: 78 },
  { x: 1080 },
];

const DEFAULT_POSTERS: WallPosterCfg[] = [
  {
    x: 340,
    y: 138,
    color: '#ffe600',
    glow: 'rgba(255,230,0,0.5)',
    title: 'INSERT',
    sub: 'COIN',
  },
  {
    x: 1080,
    y: 132,
    color: '#39ff14',
    glow: 'rgba(57,255,20,0.5)',
    title: 'HI-SCORE',
    sub: 'PSM 9999',
  },
];

const DEFAULT_FLOOR_GLOWS: FloorGlow[] = [
  { x: 220, rgb: '255,44,159' },
  { x: 460, rgb: '0,240,255' },
  { x: 700, rgb: '255,230,0', intensity: 0.3 },
  { x: 940, rgb: '57,255,20', intensity: 0.3 },
  { x: 1180, rgb: '255,44,159' },
];

// Brick grid sizing
const BRICK_W = 56;
const BRICK_H = 18;

// Floor tile sizing (perspective)
const TILE_ROWS = 7;

function brickShade(row: number, col: number): string {
  // Deterministic pseudo-random based on (row, col) — keeps SSR/CSR identical.
  const h = (row * 37 + col * 53) & 0xff;
  const variants = ['#1a0a2a', '#22103a', '#1c0830', '#27143f', '#180826'];
  return variants[h % variants.length] as string;
}

/** Static back-of-room: brick wall, ceiling lamps, perspective tile floor, doormat. */
export function SceneBackground({
  width,
  height,
  floorY,
  floorGlows = DEFAULT_FLOOR_GLOWS,
  ceilingLamps = DEFAULT_LAMPS,
  wallPosters = DEFAULT_POSTERS,
}: SceneBackgroundProps) {
  // Compute brick rows
  const wallRowCount = Math.ceil(floorY / BRICK_H) + 1;
  const wallColCount = Math.ceil(width / BRICK_W) + 1;
  const wallRows: Array<{ row: number; offset: number }> = [];
  for (let r = 0; r < wallRowCount; r++) {
    wallRows.push({ row: r, offset: r % 2 === 0 ? 0 : BRICK_W / 2 });
  }

  const floorH = height - floorY;

  return (
    <div
      className="pointer-events-none absolute inset-0 z-0"
      aria-hidden
      style={{ width, height }}
    >
      {/* Back wall — base dark plate */}
      <div
        className="absolute inset-x-0 top-0"
        style={{
          height: floorY,
          background:
            'linear-gradient(180deg, #0a0014 0%, #11001c 55%, #170127 100%)',
        }}
      />

      {/* Brick grid (absolutely positioned divs) */}
      <div
        className="absolute inset-x-0 top-0 overflow-hidden"
        style={{ height: floorY }}
      >
        {wallRows.map(({ row, offset }) => (
          <div
            key={`row-${row}`}
            className="absolute left-0"
            style={{
              top: row * BRICK_H,
              height: BRICK_H,
              width: width + BRICK_W,
              transform: `translateX(${-offset}px)`,
            }}
          >
            {Array.from({ length: wallColCount }).map((_, c) => {
              const fill = brickShade(row, c);
              return (
                <div
                  key={`b-${row}-${c}`}
                  className="absolute"
                  style={{
                    left: c * BRICK_W,
                    top: 0,
                    width: BRICK_W - 2,
                    height: BRICK_H - 2,
                    background: fill,
                    boxShadow:
                      'inset 0 1px 0 rgba(255,255,255,0.06), inset 0 -1px 0 rgba(0,0,0,0.55), inset -1px 0 0 rgba(0,0,0,0.35)',
                  }}
                />
              );
            })}
          </div>
        ))}
        {/* Mortar grime — a faint blue/violet wash from below the cabinets */}
        <div
          className="absolute inset-x-0 bottom-0"
          style={{
            height: 120,
            background:
              'linear-gradient(0deg, rgba(11,0,20,0.6), transparent)',
          }}
        />
      </div>

      {/* Ceiling band — dark beam */}
      <div
        className="absolute left-0 right-0 top-0"
        style={{
          height: 28,
          background:
            'linear-gradient(180deg, #050009 0%, #0b0014 70%, #160026 100%)',
          boxShadow: 'inset 0 -2px 0 rgba(0,0,0,0.6)',
        }}
      />

      {/* Ceiling rivets — small bolts every 80px */}
      {Array.from({ length: Math.floor(width / 80) }).map((_, i) => (
        <div
          key={`rivet-${i}`}
          className="absolute rounded-full"
          style={{
            left: 40 + i * 80,
            top: 8,
            width: 4,
            height: 4,
            background: '#22103a',
            boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.15)',
          }}
        />
      ))}

      {/* Hanging ceiling lamps with cones of warm light */}
      {ceilingLamps.map((lamp, i) => {
        const topY = lamp.topY ?? 0;
        const cableLen = lamp.cableLen ?? 60;
        const color = lamp.color ?? '#ffe9a5';
        const glow = lamp.glow ?? 'rgba(255,233,165,0.55)';
        const coneW = lamp.coneWidth ?? 180;
        return (
          <div key={`lamp-${i}`}>
            {/* Cable */}
            <div
              className="absolute"
              style={{
                left: lamp.x - 1,
                top: topY,
                width: 2,
                height: cableLen,
                background: '#1a0a2a',
              }}
            />
            {/* Lamp cap */}
            <div
              className="absolute"
              style={{
                left: lamp.x - 14,
                top: topY + cableLen,
                width: 28,
                height: 10,
                background: 'linear-gradient(180deg, #2a1448, #150726)',
                borderRadius: '4px 4px 0 0',
                boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.12)',
              }}
            />
            {/* Bulb */}
            <div
              className="absolute rounded-full"
              style={{
                left: lamp.x - 6,
                top: topY + cableLen + 8,
                width: 12,
                height: 12,
                background: `radial-gradient(closest-side, ${color}, #6b4a14 80%)`,
                boxShadow: `0 0 14px ${color}, 0 0 32px ${glow}`,
              }}
            />
            {/* Light cone — trapezoidal warm fill */}
            <div
              className="absolute"
              style={{
                left: lamp.x - coneW / 2,
                top: topY + cableLen + 18,
                width: coneW,
                height: floorY - (topY + cableLen + 18) + 40,
                background: `radial-gradient(ellipse at top, ${glow} 0%, transparent 70%)`,
                clipPath:
                  'polygon(42% 0, 58% 0, 100% 100%, 0 100%)',
                opacity: 0.55,
                mixBlendMode: 'screen',
              }}
            />
          </div>
        );
      })}

      {/* Wall posters */}
      {wallPosters.map((p) => (
        <div
          key={`${p.title}-${p.x}`}
          className="absolute border-2 bg-bg-2/85 px-2 py-1 text-center font-pixel"
          style={{
            left: p.x,
            top: p.y,
            borderColor: p.color,
            color: p.color,
            textShadow: `0 0 4px ${p.color}`,
            boxShadow: `0 0 10px ${p.glow}`,
            fontSize: 9,
            lineHeight: 1.4,
          }}
        >
          <div>{p.title}</div>
          {p.sub ? (
            <div
              className="mt-1 border-t pt-1"
              style={{ borderColor: `${p.color}55`, fontSize: 8 }}
            >
              {p.sub}
            </div>
          ) : null}
        </div>
      ))}

      {/* Wall→floor base trim (a chunky baseboard) */}
      <div
        className="absolute inset-x-0"
        style={{
          top: floorY - 8,
          height: 8,
          background:
            'linear-gradient(180deg, #1a0a2a 0%, #0b0014 70%, #000000 100%)',
          boxShadow:
            'inset 0 1px 0 rgba(255,255,255,0.05), 0 2px 6px rgba(0,0,0,0.7)',
        }}
      />

      {/* Floor — perspective tile rows */}
      <div
        className="absolute inset-x-0 overflow-hidden"
        style={{
          top: floorY,
          height: floorH,
          background:
            'linear-gradient(180deg, #0c0118 0%, #110123 40%, #07000f 100%)',
        }}
      >
        {Array.from({ length: TILE_ROWS }).map((_, r) => {
          // Rows higher (closer to back) are smaller; rows near the front are larger.
          const t = r / (TILE_ROWS - 1); // 0..1, 0=back
          const rowY = floorH * (1 - Math.pow(1 - t, 1.6));
          const nextT = (r + 1) / (TILE_ROWS - 1);
          const nextRowY = floorH * (1 - Math.pow(1 - nextT, 1.6));
          const rowH = Math.max(6, nextRowY - rowY);
          const tileW = 56 + t * 120; // wider in front
          const cols = Math.ceil(width / tileW) + 2;
          const offsetX = (r % 2) * (tileW / 2);
          return (
            <div
              key={`tile-row-${r}`}
              className="absolute left-0"
              style={{ top: rowY, height: rowH, width: width + tileW }}
            >
              {Array.from({ length: cols }).map((_, c) => {
                const dark = (r + c) % 2 === 0;
                return (
                  <div
                    key={`t-${r}-${c}`}
                    className="absolute"
                    style={{
                      left: c * tileW - offsetX,
                      top: 0,
                      width: tileW - 2,
                      height: rowH - 2,
                      background: dark
                        ? 'linear-gradient(180deg, #1a0928 0%, #11061d 100%)'
                        : 'linear-gradient(180deg, #240e3a 0%, #170824 100%)',
                      boxShadow:
                        'inset 0 1px 0 rgba(255,255,255,0.04), inset 0 -1px 0 rgba(0,0,0,0.5)',
                    }}
                  />
                );
              })}
            </div>
          );
        })}

        {/* Glossy floor reflection overlay */}
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(0deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.01) 40%, transparent 80%)',
            mixBlendMode: 'screen',
          }}
        />
      </div>

      {/* Floor glow puddles (cabinet color reflections leaking down) */}
      {floorGlows.map((g, i) => {
        const intensity = g.intensity ?? 0.35;
        const w = g.width ?? 180;
        return (
          <div
            key={`glow-${i}`}
            className="absolute rounded-full"
            style={{
              left: g.x - w / 2,
              top: floorY + 8,
              width: w,
              height: 40,
              background: `radial-gradient(closest-side, rgba(${g.rgb},${intensity}), transparent 70%)`,
              filter: 'blur(8px)',
            }}
          />
        );
      })}

      {/* PRESS START doormat at front-center */}
      <div
        className="absolute"
        style={{
          left: width / 2 - 90,
          top: height - 64,
          width: 180,
          height: 30,
          background:
            'linear-gradient(180deg, #1a0a2a 0%, #0a0014 100%)',
          border: '2px solid #361052',
          boxShadow:
            '0 6px 12px rgba(0,0,0,0.7), inset 0 0 0 2px rgba(255,44,159,0.15)',
        }}
      >
        <div
          className="flex h-full w-full items-center justify-center font-pixel text-[10px] tracking-widest"
          style={{
            color: '#ff2c9f',
            textShadow: '0 0 4px #ff2c9f, 0 0 10px rgba(255,44,159,0.5)',
          }}
        >
          PRESS START
        </div>
      </div>
    </div>
  );
}

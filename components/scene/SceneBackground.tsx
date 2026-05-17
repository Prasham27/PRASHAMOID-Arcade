export interface SceneBackgroundProps {
  width: number;
  height: number;
  /** Y-coordinate where the floor begins (back wall ends). */
  floorY: number;
}

interface Poster {
  x: number;
  y: number;
  color: string;
  glow: string;
  title: string;
  sub?: string;
}

const POSTERS: Poster[] = [
  {
    x: 240,
    y: 150,
    color: '#ffe600',
    glow: 'rgba(255,230,0,0.5)',
    title: 'INSERT',
    sub: 'COIN',
  },
  {
    x: 640,
    y: 140,
    color: '#39ff14',
    glow: 'rgba(57,255,20,0.5)',
    title: 'HI-SCORE',
    sub: 'PSM 9999',
  },
  {
    x: 840,
    y: 160,
    color: '#ff2c9f',
    glow: 'rgba(255,44,159,0.5)',
    title: 'NOW PLAYING',
    sub: 'PRASHAMOID',
  },
];

/** Static back-of-room: wall, ceiling strip lights, floor + perspective hatch. */
export function SceneBackground({
  width,
  height,
  floorY,
}: SceneBackgroundProps) {
  return (
    <div
      className="pointer-events-none absolute inset-0 z-0"
      aria-hidden
      style={{ width, height }}
    >
      {/* Back wall — panelled vertical lines */}
      <div
        className="absolute inset-x-0 top-0"
        style={{
          height: floorY,
          background:
            'linear-gradient(180deg, #0b0014 0%, #14001f 60%, #1c0429 100%)',
          backgroundImage:
            'repeating-linear-gradient(90deg, rgba(54,16,82,0.6) 0 2px, transparent 2px 56px)',
        }}
      />

      {/* Ceiling strip lights (cyan & pink alternating) */}
      <div
        className="absolute left-0 right-0 top-0"
        style={{ height: 16, background: '#0b0014' }}
      >
        <div
          className="absolute inset-x-0 top-4 h-1"
          style={{
            background:
              'repeating-linear-gradient(90deg, #00f0ff 0 80px, transparent 80px 100px, #ff2c9f 100px 180px, transparent 180px 200px)',
            boxShadow: '0 0 12px #00f0ff66, 0 6px 16px #ff2c9f44',
          }}
        />
        <div
          className="absolute inset-x-0 top-10 h-[2px]"
          style={{
            background:
              'repeating-linear-gradient(90deg, rgba(0,240,255,0.4) 0 80px, transparent 80px 100px, rgba(255,44,159,0.4) 100px 180px, transparent 180px 200px)',
            filter: 'blur(2px)',
          }}
        />
      </div>

      {/* Wall posters */}
      {POSTERS.map((p) => (
        <div
          key={p.title}
          className="absolute border-2 bg-bg-2/80 px-2 py-1 text-center font-pixel"
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

      {/* Floor */}
      <div
        className="absolute inset-x-0"
        style={{
          top: floorY,
          height: height - floorY,
          background:
            'linear-gradient(180deg, #1c0429 0%, #14001f 40%, #0b0014 100%)',
          backgroundImage:
            'repeating-linear-gradient(115deg, rgba(54,16,82,0.55) 0 2px, transparent 2px 48px), repeating-linear-gradient(65deg, rgba(54,16,82,0.55) 0 2px, transparent 2px 48px)',
        }}
      />

      {/* Floor glow puddles (radial gradients in accents) */}
      <div
        className="absolute rounded-full"
        style={{
          left: 200,
          top: floorY + 80,
          width: 320,
          height: 70,
          background:
            'radial-gradient(closest-side, rgba(0,240,255,0.45), transparent 70%)',
          filter: 'blur(8px)',
        }}
      />
      <div
        className="absolute rounded-full"
        style={{
          left: 880,
          top: floorY + 60,
          width: 340,
          height: 80,
          background:
            'radial-gradient(closest-side, rgba(255,44,159,0.4), transparent 70%)',
          filter: 'blur(8px)',
        }}
      />
      <div
        className="absolute rounded-full"
        style={{
          left: 540,
          top: floorY + 110,
          width: 280,
          height: 60,
          background:
            'radial-gradient(closest-side, rgba(255,230,0,0.3), transparent 70%)',
          filter: 'blur(8px)',
        }}
      />

      {/* Wall→floor base trim */}
      <div
        className="absolute inset-x-0"
        style={{
          top: floorY - 4,
          height: 4,
          background: '#361052',
          boxShadow: '0 0 8px rgba(54,16,82,0.8)',
        }}
      />
    </div>
  );
}

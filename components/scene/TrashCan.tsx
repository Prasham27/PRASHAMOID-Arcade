export interface TrashCanProps {
  x: number;
  y: number;
}

/** Decorative trash can with a green slime glow. Not interactive. */
export function TrashCan({ x, y }: TrashCanProps) {
  const W = 36;
  const H = 50;
  return (
    <div
      className="absolute z-20"
      style={{ left: x - W / 2, top: y, width: W, height: H }}
      aria-hidden
    >
      {/* slime puddle glow under it */}
      <div
        className="absolute -bottom-2 left-1/2 -translate-x-1/2 rounded-full"
        style={{
          width: 60,
          height: 14,
          background:
            'radial-gradient(closest-side, rgba(57,255,20,0.5), transparent 70%)',
          filter: 'blur(2px)',
        }}
      />
      {/* lid */}
      <div
        className="absolute left-0 right-0 top-0 mx-auto"
        style={{
          width: W,
          height: 6,
          background: '#1c0429',
          border: '2px solid #361052',
          borderRadius: '2px',
        }}
      />
      {/* handle */}
      <div
        className="absolute left-1/2 -translate-x-1/2"
        style={{
          top: -3,
          width: 14,
          height: 4,
          background: '#361052',
          borderRadius: '1px',
        }}
      />
      {/* body */}
      <div
        className="absolute left-1 right-1"
        style={{
          top: 6,
          bottom: 0,
          background:
            'linear-gradient(180deg, #1c0429, #14001f 60%, #1c0429)',
          border: '2px solid #361052',
          backgroundImage:
            'repeating-linear-gradient(90deg, rgba(54,16,82,0.6) 0 2px, transparent 2px 5px)',
          boxShadow: '0 0 12px rgba(57,255,20,0.35)',
        }}
      />
      {/* slime overflow at top */}
      <div
        className="absolute left-2 right-2"
        style={{
          top: 4,
          height: 6,
          background:
            'linear-gradient(180deg, #39ff14, rgba(57,255,20,0.6) 60%, transparent)',
          boxShadow: '0 0 10px #39ff14, 0 0 18px #39ff1466',
        }}
      />
    </div>
  );
}

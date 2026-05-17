import { Sprite } from '@/components/icons/Sprite';
import type { SnackItem } from '@/lib/snack-items';

export interface TrashCanProps {
  x: number;
  y: number;
  /** Recent wrappers visible peeking out of the can; newest at index 0.
   *  Capped to ~6 by the caller. */
  wrappers?: SnackItem[];
}

/** Decorative trash can with a green slime glow. The newest wrappers
 *  (capped to ~6) are stacked visibly at the opening so the visitor
 *  can see what's been tossed. */
export function TrashCan({ x, y, wrappers = [] }: TrashCanProps) {
  const W = 44;
  const H = 56;
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
          width: 70,
          height: 14,
          background:
            'radial-gradient(closest-side, rgba(57,255,20,0.5), transparent 70%)',
          filter: 'blur(2px)',
        }}
      />
      {/* handle */}
      <div
        className="absolute left-1/2 -translate-x-1/2"
        style={{
          top: -3,
          width: 16,
          height: 4,
          background: '#361052',
          borderRadius: '1px',
        }}
      />
      {/* lid back ring (visible behind wrappers) */}
      <div
        className="absolute left-0 right-0 top-0 mx-auto"
        style={{
          width: W,
          height: 8,
          background: '#1c0429',
          border: '2px solid #361052',
          borderRadius: '3px',
          zIndex: 0,
        }}
      />

      {/* Wrappers peeking out of the top of the can.
       *  Newest (index 0) sits on top + leftmost; older ones layer behind.
       *  We position absolutely so they overlap slightly, giving a "pile"
       *  look. Each wrapper has a small random-ish tilt for character. */}
      <div
        className="absolute left-0 right-0 z-10"
        style={{ top: -8, height: 16 }}
      >
        {wrappers.slice(0, 6).map((w, i) => {
          // 6 horizontal slots across the can width
          const slot = i; // 0 (leftmost) → 5 (rightmost)
          // Tilt alternates slightly so the pile has character
          const tilts = [-12, 6, -4, 14, -8, 10];
          const yOffsets = [0, 2, -1, 1, 3, 0];
          const baseX = (W / 6) * slot - 4;
          return (
            <div
              key={`${w.id}-${i}`}
              className="absolute"
              style={{
                left: baseX,
                top: yOffsets[i] ?? 0,
                transform: `rotate(${tilts[i] ?? 0}deg)`,
                transformOrigin: 'bottom center',
                zIndex: 6 - i,
                filter:
                  i === 0
                    ? `drop-shadow(0 0 6px ${w.accentColor}88)`
                    : 'none',
              }}
              title={w.name}
            >
              <Sprite def={w.spriteHandheld} scale={1.6} />
            </div>
          );
        })}
      </div>

      {/* body — rendered below the wrapper layer */}
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
          top: 6,
          height: 5,
          background:
            'linear-gradient(180deg, #39ff14, rgba(57,255,20,0.6) 60%, transparent)',
          boxShadow: '0 0 10px #39ff14, 0 0 18px #39ff1466',
        }}
      />
    </div>
  );
}

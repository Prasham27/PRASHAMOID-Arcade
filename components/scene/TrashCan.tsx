import { Sprite } from '@/components/icons/Sprite';
import type { SnackItem } from '@/lib/snack-items';

export interface TrashCanProps {
  x: number;
  y: number;
  /** Recent wrappers visibly stacked in the can. Newest at index 0,
   *  oldest at the end. Caller caps to ~6. */
  wrappers?: SnackItem[];
}

/** Trash can with a green slime glow at the rim. Wrappers stack vertically
 *  INSIDE the can — the first one thrown lands at the bottom; each new one
 *  appears above the previous one until the queue is full and oldest rolls off. */
export function TrashCan({ x, y, wrappers = [] }: TrashCanProps) {
  const W = 44;
  const H = 56;
  const list = wrappers.slice(0, 6);
  const N = list.length;
  /** Vertical spacing between stacked wrappers, in px. Each handheld sprite
   *  is ~17px tall at scale 1.2, so overlap is intentional for a pile look. */
  const STACK_OFFSET = 7;
  /** Subtle horizontal jiggle per stack layer so the pile doesn't look like
   *  a perfect tower. Looped so longer queues stay varied. */
  const X_OFFSETS = [0, 3, -2, 4, -3, 2];
  const TILTS = [-8, 6, -3, 9, -6, 4];

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

      {/* body — the can interior where wrappers stack */}
      <div
        className="absolute left-1 right-1 overflow-visible"
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
      >
        {/* Stacked wrappers — oldest at bottom, newest on top.
         *  list[0]   = newest → highest in the can (largest `bottom`)
         *  list[N-1] = oldest → lowest in the can (`bottom: 0`)
         *  zIndex set so the newest visually sits ON TOP of older ones. */}
        {list.map((w, i) => {
          const stackIndex = N - 1 - i; // 0 = oldest at the bottom
          const isNewest = i === 0;
          return (
            <div
              key={`${w.id}-${i}-${stackIndex}`}
              className="absolute left-1/2"
              style={{
                bottom: stackIndex * STACK_OFFSET,
                transform: `translateX(-50%) translateX(${X_OFFSETS[i] ?? 0}px) rotate(${TILTS[i] ?? 0}deg)`,
                transformOrigin: 'bottom center',
                zIndex: 10 + (N - i),
                filter: isNewest
                  ? `drop-shadow(0 0 6px ${w.accentColor}aa)`
                  : `drop-shadow(0 1px 1px rgba(0,0,0,0.6))`,
                pointerEvents: 'none',
              }}
              title={w.name}
            >
              <Sprite def={w.spriteHandheld} scale={1.2} />
            </div>
          );
        })}
      </div>

      {/* slime overflow at the rim — drawn after the wrappers so the green
       *  drip remains visible even when the pile is tall */}
      <div
        className="pointer-events-none absolute left-2 right-2"
        style={{
          top: 6,
          height: 5,
          zIndex: 30,
          background:
            'linear-gradient(180deg, #39ff14, rgba(57,255,20,0.6) 60%, transparent)',
          boxShadow: '0 0 10px #39ff14, 0 0 18px #39ff1466',
        }}
      />
    </div>
  );
}

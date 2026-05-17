import type { SpriteDef } from '@/lib/sprites';

export interface SpriteProps {
  def: SpriteDef;
  /** Pixel size of each grid cell, default 4 */
  scale?: number;
  ariaLabel?: string;
  className?: string;
}

export function Sprite({ def, scale = 4, ariaLabel, className }: SpriteProps) {
  const w = def.width * scale;
  const h = def.height * scale;

  return (
    <svg
      width={w}
      height={h}
      viewBox={`0 0 ${def.width} ${def.height}`}
      shapeRendering="crispEdges"
      role={ariaLabel ? 'img' : 'presentation'}
      aria-label={ariaLabel}
      className={className}
    >
      {def.rows.map((row, y) =>
        Array.from(row).map((ch, x) => {
          const color = def.palette[ch];
          if (!color || color === 'transparent') return null;
          return (
            <rect
              key={`${x}-${y}`}
              x={x}
              y={y}
              width={1}
              height={1}
              fill={color}
            />
          );
        }),
      )}
    </svg>
  );
}

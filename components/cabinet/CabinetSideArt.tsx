import { cn } from '@/lib/cn';

export interface CabinetSideArtProps {
  color: 'pink' | 'cyan' | 'yellow' | 'green';
  side: 'left' | 'right';
  className?: string;
}

const colorBg = {
  pink: 'bg-pink/10 border-pink/40',
  cyan: 'bg-cyan/10 border-cyan/40',
  yellow: 'bg-yellow/10 border-yellow/40',
  green: 'bg-green/10 border-green/40',
};

/** Decorative side panel of the cabinet — diagonal stripes in the accent color. */
export function CabinetSideArt({ color, side, className }: CabinetSideArtProps) {
  return (
    <div
      aria-hidden
      className={cn(
        'pointer-events-none w-3 border-y-2',
        colorBg[color],
        side === 'left' ? 'border-l-2' : 'border-r-2',
        className,
      )}
      style={{
        backgroundImage:
          'repeating-linear-gradient(45deg, rgba(255,255,255,0.04) 0 4px, transparent 4px 8px)',
      }}
    />
  );
}

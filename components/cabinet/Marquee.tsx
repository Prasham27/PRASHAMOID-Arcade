import { cn } from '@/lib/cn';

export interface MarqueeProps {
  name: string;
  color: 'pink' | 'cyan' | 'yellow' | 'green';
  size?: 'sm' | 'md' | 'lg';
}

const colorMap = {
  pink: 'text-pink phosphor-pink border-pink',
  cyan: 'text-cyan phosphor-cyan border-cyan',
  yellow: 'text-yellow phosphor-yellow border-yellow',
  green: 'text-green phosphor-green border-green',
};

const sizeMap = {
  sm: 'text-[10px] py-1 px-2',
  md: 'text-xs py-2 px-3',
  lg: 'text-base py-3 px-5',
};

/** The illuminated top-of-cabinet title sign. CSS-only — no images. */
export function Marquee({ name, color, size = 'md' }: MarqueeProps) {
  return (
    <div
      className={cn(
        'relative w-full overflow-hidden border-2 bg-bg-2 text-center font-pixel tracking-widest',
        colorMap[color],
        sizeMap[size],
      )}
      style={{
        backgroundImage:
          'linear-gradient(180deg, rgba(255,255,255,0.06) 0%, transparent 30%, transparent 70%, rgba(0,0,0,0.4) 100%)',
      }}
    >
      <span className="relative z-10">{name}</span>
      {/* Marquee lights along the top edge */}
      <span
        aria-hidden
        className="absolute inset-x-0 top-0 h-[2px]"
        style={{
          backgroundImage:
            'repeating-linear-gradient(90deg, currentColor 0 4px, transparent 4px 8px)',
        }}
      />
    </div>
  );
}

import type { CSSProperties } from 'react';
import { cn } from '@/lib/cn';

export type NeonColor = 'pink' | 'cyan' | 'yellow' | 'green';

export interface NeonSignProps {
  text: string;
  color?: NeonColor;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  /** Absolute position helpers — applied as inline style */
  style?: CSSProperties;
  /** Secondary color for a double-outline marquee effect */
  secondary?: NeonColor;
}

const hex: Record<NeonColor, string> = {
  pink: '#ff2c9f',
  cyan: '#00f0ff',
  yellow: '#ffe600',
  green: '#39ff14',
};

const sizeMap = {
  sm: 'text-[10px] px-3 py-1',
  md: 'text-base px-5 py-2',
  lg: 'text-2xl px-7 py-3 md:text-3xl',
};

/** Neon-tube styled text sign with phosphor box-shadow glow. */
export function NeonSign({
  text,
  color = 'pink',
  size = 'md',
  className,
  style,
  secondary,
}: NeonSignProps) {
  const c1 = hex[color];
  const c2 = secondary ? hex[secondary] : c1;
  const shadow = secondary
    ? `0 0 4px ${c1}, 0 0 14px ${c1}, 0 0 28px ${c2}, inset 0 0 12px ${c2}`
    : `0 0 6px ${c1}, 0 0 18px ${c1}, 0 0 32px ${c1}aa, inset 0 0 8px ${c1}66`;
  const textShadow = `0 0 4px ${c1}, 0 0 10px ${c1}, 0 0 22px ${c1}`;

  return (
    <div
      className={cn(
        'inline-block border-2 bg-bg-2/80 font-pixel uppercase tracking-widest animate-flicker',
        sizeMap[size],
        className,
      )}
      style={{
        borderColor: c1,
        color: c1,
        textShadow,
        boxShadow: shadow,
        ...style,
      }}
    >
      <span style={secondary ? { color: c2 } : undefined}>{text}</span>
    </div>
  );
}

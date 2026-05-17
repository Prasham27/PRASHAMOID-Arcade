import { cn } from '@/lib/cn';
import type { ReactNode } from 'react';

type Size = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
type Color = 'pink' | 'cyan' | 'yellow' | 'green' | 'text' | 'text-dim';

const sizeMap: Record<Size, string> = {
  xs: 'text-[10px]',
  sm: 'text-xs',
  md: 'text-sm',
  lg: 'text-xl',
  xl: 'text-3xl',
  '2xl': 'text-5xl md:text-6xl',
};

const colorMap: Record<Color, string> = {
  pink: 'text-pink',
  cyan: 'text-cyan',
  yellow: 'text-yellow',
  green: 'text-green',
  text: 'text-text',
  'text-dim': 'text-text-dim',
};

const glowMap: Record<Color, string> = {
  pink: 'phosphor-pink',
  cyan: 'phosphor-cyan',
  yellow: 'phosphor-yellow',
  green: 'phosphor-green',
  text: '',
  'text-dim': '',
};

export interface PixelTextProps {
  children: ReactNode;
  size?: Size;
  color?: Color;
  glow?: boolean;
  as?: 'span' | 'div' | 'h1' | 'h2' | 'h3' | 'p';
  className?: string;
}

export function PixelText({
  children,
  size = 'md',
  color = 'text',
  glow = false,
  as: Tag = 'span',
  className,
}: PixelTextProps) {
  return (
    <Tag
      className={cn(
        'font-pixel tracking-wide',
        sizeMap[size],
        colorMap[color],
        glow && glowMap[color],
        className,
      )}
    >
      {children}
    </Tag>
  );
}

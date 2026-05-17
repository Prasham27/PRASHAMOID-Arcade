'use client';

import { cn } from '@/lib/cn';
import type { ReactNode } from 'react';

export interface CoinSlotButtonProps {
  children: ReactNode;
  onClick?: () => void;
  href?: string;
  color?: 'pink' | 'cyan' | 'yellow' | 'green';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  type?: 'button' | 'submit';
  disabled?: boolean;
}

const colorMap = {
  pink: {
    border: 'border-pink',
    text: 'text-pink',
    glow: 'phosphor-pink',
    hover: 'hover:bg-pink hover:text-bg',
  },
  cyan: {
    border: 'border-cyan',
    text: 'text-cyan',
    glow: 'phosphor-cyan',
    hover: 'hover:bg-cyan hover:text-bg',
  },
  yellow: {
    border: 'border-yellow',
    text: 'text-yellow',
    glow: 'phosphor-yellow',
    hover: 'hover:bg-yellow hover:text-bg',
  },
  green: {
    border: 'border-green',
    text: 'text-green',
    glow: 'phosphor-green',
    hover: 'hover:bg-green hover:text-bg',
  },
};

const sizeMap = {
  sm: 'px-3 py-1 text-[10px]',
  md: 'px-5 py-2 text-xs',
  lg: 'px-8 py-3 text-sm',
};

export function CoinSlotButton({
  children,
  onClick,
  href,
  color = 'pink',
  size = 'md',
  className,
  type = 'button',
  disabled,
}: CoinSlotButtonProps) {
  const palette = colorMap[color];
  const classes = cn(
    'inline-flex items-center justify-center border-2 font-pixel tracking-widest uppercase',
    'transition-colors duration-100 ease-linear',
    'disabled:opacity-50 disabled:cursor-not-allowed',
    sizeMap[size],
    palette.border,
    palette.text,
    palette.glow,
    !disabled && palette.hover,
    className,
  );

  if (href) {
    return (
      <a href={href} className={classes}>
        {children}
      </a>
    );
  }
  return (
    <button type={type} onClick={onClick} disabled={disabled} className={classes}>
      {children}
    </button>
  );
}

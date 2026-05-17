'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import type { ReactNode } from 'react';
import { Marquee } from './Marquee';
import { CabinetScreen } from './CabinetScreen';
import { ControlPanel } from './ControlPanel';
import { CabinetSideArt } from './CabinetSideArt';
import { cn } from '@/lib/cn';

export interface CabinetProps {
  id: string;
  name: string;
  tagline: string;
  accentColor: 'pink' | 'cyan' | 'yellow' | 'green';
  demoFrames: ReactNode[];
  href: string;
  className?: string;
  /** When true, visually mark it as already played (visited) */
  visited?: boolean;
}

const taglineColor = {
  pink: 'text-pink',
  cyan: 'text-cyan',
  yellow: 'text-yellow',
  green: 'text-green',
};

/** A reusable arcade cabinet, built entirely from divs + CSS. */
export function Cabinet({
  name,
  tagline,
  accentColor,
  demoFrames,
  href,
  className,
  visited,
}: CabinetProps) {
  return (
    <Link
      href={href}
      className={cn('group block focus:outline-none', className)}
    >
      <motion.div
        whileHover={{ y: -4 }}
        transition={{ duration: 0.12, ease: 'linear' }}
        className="flex w-full flex-col"
      >
        <div className="flex w-full items-stretch">
          <CabinetSideArt color={accentColor} side="left" />
          <div className="flex flex-1 flex-col gap-2 bg-bg-2 p-3">
            <Marquee name={name} color={accentColor} />
            <CabinetScreen frames={demoFrames} />
            <div
              className={cn(
                'border-2 border-border bg-bg px-3 py-2 text-center font-body text-sm leading-tight',
                taglineColor[accentColor],
              )}
            >
              {tagline}
            </div>
            <ControlPanel color={accentColor} />
            <div className="flex items-center justify-between border-2 border-border bg-bg px-2 py-1 font-pixel text-[9px] tracking-widest text-text-muted">
              <span>1 PLAYER</span>
              <span className={visited ? 'text-green phosphor-green' : 'text-yellow phosphor-yellow animate-blink'}>
                {visited ? '★ CLEARED' : '◆ PLAY'}
              </span>
            </div>
          </div>
          <CabinetSideArt color={accentColor} side="right" />
        </div>
      </motion.div>
    </Link>
  );
}

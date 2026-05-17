'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { cn } from '@/lib/cn';

export interface CabinetScreenProps {
  /** 3 demo frames cycled at intervalMs */
  frames: ReactNode[];
  intervalMs?: number;
  className?: string;
}

/** The CRT screen embedded in the cabinet. Cycles between supplied frames. */
export function CabinetScreen({
  frames,
  intervalMs = 800,
  className,
}: CabinetScreenProps) {
  const [i, setI] = useState(0);

  useEffect(() => {
    if (frames.length <= 1) return;
    const t = window.setInterval(
      () => setI((prev) => (prev + 1) % frames.length),
      intervalMs,
    );
    return () => window.clearInterval(t);
  }, [frames.length, intervalMs]);

  return (
    <div
      className={cn(
        'relative aspect-[4/3] w-full overflow-hidden border-2 border-border bg-bg',
        className,
      )}
      style={{
        boxShadow:
          'inset 0 0 30px 6px rgba(0,0,0,0.7), inset 0 0 80px 12px rgba(0,240,255,0.05)',
      }}
    >
      <div className="flex h-full w-full items-center justify-center">
        {frames[i] ?? null}
      </div>
      {/* Scanlines inside the cabinet screen */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            'repeating-linear-gradient(0deg, rgba(0,0,0,0.25) 0 1px, transparent 1px 3px)',
        }}
      />
    </div>
  );
}

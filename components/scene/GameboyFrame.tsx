import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

export interface GameboyFrameProps {
  /** The canvas / game area — passed in as children */
  children: ReactNode;
  /** Subtitle shown on the top of the handheld */
  title?: string;
  /** When true, the POWER LED glows green; otherwise red */
  powered?: boolean;
  /** Optional status bar (score, best, lives) rendered above the screen */
  statusBar?: ReactNode;
  className?: string;
}

/**
 * Decorative Gameboy-style frame that wraps a game canvas.
 *
 * All controls (D-pad, A/B/X/Y, L/R shoulders) are visual only — keyboard
 * still drives gameplay. The frame is hidden below the md breakpoint so it
 * does not collide with the desktop-only message on small screens.
 */
export function GameboyFrame({
  children,
  title = 'PRASHAMOID',
  powered = true,
  statusBar,
  className,
}: GameboyFrameProps) {
  const ledColor = powered ? 'bg-green' : 'bg-pink';
  const ledGlow = powered
    ? 'shadow-[0_0_8px_var(--green)]'
    : 'shadow-[0_0_8px_var(--pink)]';

  return (
    <div
      className={cn(
        'rounded-3xl border-4 border-border bg-bg-2 p-4 sm:p-6 lg:p-8',
        'shadow-[0_20px_50px_rgba(0,0,0,0.5),inset_0_2px_0_rgba(255,255,255,0.04)]',
        'relative',
        className,
      )}
    >
      {/* Corner "screws" */}
      <ScrewDot className="left-3 top-3" />
      <ScrewDot className="right-3 top-3" />
      <ScrewDot className="bottom-3 left-3" />
      <ScrewDot className="bottom-3 right-3" />

      {/* Top "speaker" strip */}
      <div className="mx-auto mb-4 flex w-fit items-center gap-2">
        <span className="h-1.5 w-1.5 rounded-full bg-border" />
        <span className="h-1.5 w-1.5 rounded-full bg-border" />
        <span className="h-1.5 w-1.5 rounded-full bg-border" />
      </div>

      {/* Title row: LED + brand + optional indicator */}
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span
            aria-label={powered ? 'Power on' : 'Power off'}
            className={cn(
              'inline-block h-2.5 w-2.5 rounded-full border border-border',
              ledColor,
              ledGlow,
            )}
          />
          <span className="font-pixel text-[10px] tracking-widest text-text-dim">
            POWER
          </span>
        </div>
        <span className="font-pixel text-xs tracking-widest text-pink phosphor-pink">
          {title}
        </span>
        <span className="font-pixel text-[10px] tracking-widest text-text-muted">
          DOT-MATRIX
        </span>
      </div>

      {/* Optional status bar (score / best / lives) above the screen */}
      {statusBar && (
        <div className="mb-3 border-2 border-border bg-bg px-3 py-2">
          {statusBar}
        </div>
      )}

      {/* SCREEN SLOT — darker inset, children render here */}
      <div className="relative border-4 border-border bg-bg p-1">
        <div className="relative bg-bg">{children}</div>
      </div>

      {/* L / R shoulder buttons */}
      <div className="mt-4 flex items-center justify-between">
        <ShoulderPill label="L" />
        <span className="font-pixel text-[10px] tracking-widest text-text-muted">
          II
        </span>
        <ShoulderPill label="R" />
      </div>

      {/* CONTROLS — D-pad (left) + Y/X/B/A diamond (right) */}
      <div className="mt-6 flex items-center justify-between gap-6">
        <DPad />
        <FaceButtons />
      </div>

      {/* Brand strip */}
      <div className="mt-6 text-center">
        <span className="font-pixel text-[10px] tracking-widest text-text-muted">
          ◆ PRASHAM HANDHELD SYSTEM ◆
        </span>
      </div>
    </div>
  );
}

/* ----- Subcomponents ----- */

function ScrewDot({ className }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={cn(
        'pointer-events-none absolute h-2 w-2 rounded-full',
        'border border-border bg-bg',
        className,
      )}
    />
  );
}

function ShoulderPill({ label }: { label: string }) {
  return (
    <div className="rounded-md border-2 border-border bg-bg px-4 py-1">
      <span className="font-pixel text-[10px] tracking-widest text-text-dim">
        {label}
      </span>
    </div>
  );
}

/**
 * D-pad cross: 5 squares laid out in a + shape. Decorative only.
 */
function DPad() {
  return (
    <div
      aria-hidden
      className="grid grid-cols-3 grid-rows-3 gap-0.5"
      style={{ width: 84, height: 84 }}
    >
      <span />
      <span className="border border-border bg-text-dim" />
      <span />
      <span className="border border-border bg-text-dim" />
      <span className="border border-border bg-text-dim" />
      <span className="border border-border bg-text-dim" />
      <span />
      <span className="border border-border bg-text-dim" />
      <span />
    </div>
  );
}

/**
 * Y / X / B / A buttons in a diamond.
 * Layout (3x3 grid):
 *   .  Y  .
 *   X  .  B
 *   .  A  .
 */
function FaceButtons() {
  return (
    <div
      aria-hidden
      className="grid grid-cols-3 grid-rows-3 gap-1"
      style={{ width: 110, height: 110 }}
    >
      <span />
      <FaceButton label="Y" color="yellow" />
      <span />
      <FaceButton label="X" color="pink" />
      <span />
      <FaceButton label="B" color="cyan" />
      <span />
      <FaceButton label="A" color="green" />
      <span />
    </div>
  );
}

function FaceButton({
  label,
  color,
}: {
  label: string;
  color: 'pink' | 'cyan' | 'yellow' | 'green';
}) {
  const bg =
    color === 'pink'
      ? 'bg-pink'
      : color === 'cyan'
        ? 'bg-cyan'
        : color === 'yellow'
          ? 'bg-yellow'
          : 'bg-green';
  return (
    <div
      className={cn(
        'flex items-center justify-center rounded-full border-2 border-border',
        bg,
        'shadow-[inset_0_-2px_0_rgba(0,0,0,0.25)]',
      )}
    >
      <span className="font-pixel text-[10px] text-bg">{label}</span>
    </div>
  );
}

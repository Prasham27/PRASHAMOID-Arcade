'use client';

/** A single 2px-tall moving scanline. One per page; rendered on top of
 *  content but below the CRT overlay. Killed by reduced-motion media query
 *  in styles/arcade-theme.css.
 */
export function Scanline() {
  return (
    <div
      aria-hidden
      className="crt-scanline pointer-events-none fixed left-0 right-0 z-[9998] h-[2px] animate-scanline"
      style={{
        background:
          'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.18) 50%, transparent 100%)',
        top: 0,
      }}
    />
  );
}

'use client';

import { useEffect, useState } from 'react';

const STORAGE_KEY = 'arcade.crt';

/** Fixed viewport-covering overlay with scanlines + corner vignette.
 *  Pointer-events: none so it never blocks clicks. Toggle with `~` key
 *  or programmatically via localStorage `arcade.crt = 'on' | 'off'`.
 */
export function CRTViewport() {
  const [enabled, setEnabled] = useState(true);

  // Read preference on mount + apply to <html data-crt>
  useEffect(() => {
    try {
      const v = window.localStorage.getItem(STORAGE_KEY);
      const on = v !== 'off';
      setEnabled(on);
      document.documentElement.dataset.crt = on ? 'on' : 'off';
    } catch {
      // SSR / no-storage path: stay on
    }
  }, []);

  // ~ key toggles
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === '`' || e.key === '~') {
        setEnabled((prev) => {
          const next = !prev;
          try {
            window.localStorage.setItem(STORAGE_KEY, next ? 'on' : 'off');
          } catch {
            /* ignore */
          }
          document.documentElement.dataset.crt = next ? 'on' : 'off';
          return next;
        });
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <div
      aria-hidden
      className="crt-overlay pointer-events-none fixed inset-0 z-[9999]"
      style={{
        // Static scanlines
        backgroundImage: enabled
          ? 'repeating-linear-gradient(0deg, rgba(0,0,0,0.22) 0 1px, transparent 1px 3px)'
          : 'none',
        // Corner vignette via radial gradient overlay
        boxShadow: enabled
          ? 'inset 0 0 200px 40px rgba(0,0,0,0.55)'
          : 'none',
        willChange: 'transform',
        isolation: 'isolate',
        transform: 'translateZ(0)',
      }}
    />
  );
}

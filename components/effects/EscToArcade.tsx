'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';

/**
 * Global Escape-key handler: from any inner page (cabinet detail,
 * overview, levels, etc.) ESC navigates back to /arcade.
 *
 * Skipped on:
 *   - / (the INSERT COIN landing)
 *   - /arcade (the lobby itself — modals there own their ESC)
 *   - /play (Prashamoid uses ESC to pause)
 *   - /admin, /dev (separate contexts)
 *
 * Also skipped while typing in inputs / textareas / contentEditable.
 */
export function EscToArcade() {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (!pathname) return;
    if (pathname === '/' || pathname === '/arcade' || pathname === '/play') {
      return;
    }
    if (pathname.startsWith('/admin') || pathname.startsWith('/dev')) {
      return;
    }

    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      const target = e.target as HTMLElement | null;
      const tag = target?.tagName;
      if (
        tag === 'INPUT' ||
        tag === 'TEXTAREA' ||
        tag === 'SELECT' ||
        target?.isContentEditable
      ) {
        return;
      }
      e.preventDefault();
      router.push('/arcade');
    };

    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [pathname, router]);

  return null;
}

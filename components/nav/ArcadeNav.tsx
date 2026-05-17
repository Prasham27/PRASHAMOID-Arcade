'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { cn } from '@/lib/cn';

interface NavItem {
  href: string;
  label: string;
  color: 'pink' | 'cyan' | 'yellow' | 'green';
}

const NAV: NavItem[] = [
  { href: '/arcade', label: 'ARCADE', color: 'pink' },
  { href: '/overview', label: 'ABOUT', color: 'pink' },
  { href: '/projects', label: 'PROJECTS', color: 'cyan' },
  { href: '/levels', label: 'EXPERIENCE', color: 'yellow' },
  { href: '/inventory', label: 'SKILLS', color: 'green' },
  { href: '/comms', label: 'CONTACT', color: 'pink' },
  { href: '/play', label: 'PLAY', color: 'cyan' },
  { href: '/scores', label: 'HI-SCORES', color: 'yellow' },
];

const colorMap = {
  pink: 'border-pink text-pink phosphor-pink',
  cyan: 'border-cyan text-cyan phosphor-cyan',
  yellow: 'border-yellow text-yellow phosphor-yellow',
  green: 'border-green text-green phosphor-green',
};

/** Top nav, hidden on / (the INSERT COIN landing).
 *  Mobile: collapses to a [MENU] button + full-screen overlay.
 */
export function ArcadeNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  if (pathname === '/') return null;

  return (
    <>
      {/* Desktop bar */}
      <nav className="sticky top-0 z-40 hidden border-b-2 border-border bg-bg/95 px-4 py-2 backdrop-blur-md md:flex md:items-center md:justify-between">
        <Link
          href="/arcade"
          className="font-pixel text-xs tracking-widest text-pink phosphor-pink"
        >
          ◆ PRASHAMOID ◆
        </Link>
        <ul className="flex items-center gap-1">
          {NAV.map((item) => {
            const active = pathname === item.href;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    'inline-block border-2 px-3 py-1 font-pixel text-[10px] tracking-widest transition-colors duration-100',
                    active
                      ? colorMap[item.color]
                      : 'border-transparent text-text-dim hover:border-current hover:text-text',
                  )}
                >
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Mobile bar */}
      <nav className="sticky top-0 z-40 flex items-center justify-between border-b-2 border-border bg-bg/95 px-4 py-2 backdrop-blur-md md:hidden">
        <Link
          href="/arcade"
          className="font-pixel text-[10px] tracking-widest text-pink phosphor-pink"
        >
          ◆ PRASHAMOID ◆
        </Link>
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="border-2 border-yellow px-3 py-1 font-pixel text-[10px] tracking-widest text-yellow phosphor-yellow"
          aria-expanded={open}
          aria-label="Menu"
        >
          [ {open ? 'X' : '≡'} MENU ]
        </button>
      </nav>

      {/* Mobile overlay */}
      {open && (
        <div className="fixed inset-0 z-50 flex flex-col bg-bg/98 px-6 pb-12 pt-20 backdrop-blur-md md:hidden">
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="absolute right-4 top-4 border-2 border-yellow px-3 py-1 font-pixel text-[10px] tracking-widest text-yellow"
          >
            [ X CLOSE ]
          </button>
          <ul className="flex flex-1 flex-col gap-3">
            {NAV.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    'block border-2 px-4 py-3 font-pixel text-sm tracking-widest',
                    colorMap[item.color],
                  )}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </>
  );
}

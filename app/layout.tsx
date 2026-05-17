import type { Metadata } from 'next';
import { Press_Start_2P, VT323, Share_Tech_Mono, Inter } from 'next/font/google';
import './globals.css';
import { CRTViewport } from '@/components/effects/CRTViewport';
import { Scanline } from '@/components/effects/Scanline';
import { TrackBeacon } from '@/components/effects/TrackBeacon';
import { EscToArcade } from '@/components/effects/EscToArcade';
import { KonamiListener } from '@/components/konami/KonamiListener';
import { AchievementToaster } from '@/components/hud/AchievementToaster';
import { ArcadeNav } from '@/components/nav/ArcadeNav';

const pressStart = Press_Start_2P({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-pixel',
  display: 'swap',
});
const vt323 = VT323({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-body',
  display: 'swap',
});
const shareTech = Share_Tech_Mono({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-score',
  display: 'swap',
});
const inter = Inter({
  subsets: ['latin'],
  variable: '--font-prose',
  display: 'swap',
});

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

export const metadata: Metadata = {
  metadataBase: (() => {
    try {
      return new URL(SITE_URL);
    } catch {
      return new URL('http://localhost:3000');
    }
  })(),
  title: {
    default: 'PRASHAMOID ARCADE // Prasham',
    template: '%s // PRASHAMOID ARCADE',
  },
  description:
    'A 1980s arcade-themed portfolio for Prasham — projects as cabinets, skills as power-ups, experience as XP. Playable mini-game inside.',
  openGraph: {
    title: 'PRASHAMOID ARCADE',
    description:
      'A 1980s arcade-themed portfolio for Prasham — neon, scanlines, and a real mini-game.',
    type: 'website',
  },
  twitter: { card: 'summary_large_image' },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      data-crt="on"
      className={`${pressStart.variable} ${vt323.variable} ${shareTech.variable} ${inter.variable}`}
    >
      <body className="min-h-screen overflow-x-hidden">
        <a href="#main" className="skip-link">
          SKIP TO CONTENT
        </a>
        <ArcadeNav />
        <main id="main">{children}</main>
        <CRTViewport />
        <Scanline />
        <KonamiListener />
        <AchievementToaster />
        <TrackBeacon />
        <EscToArcade />
      </body>
    </html>
  );
}

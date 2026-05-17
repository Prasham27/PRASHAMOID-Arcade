'use client';

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { useRouter } from 'next/navigation';
import { SceneBackground } from './SceneBackground';
import { SceneCabinet, type CabinetAccent } from './SceneCabinet';
import {
  PixelCharacter,
  type PixelCharacterHandle,
} from './PixelCharacter';
import { NeonSign } from './NeonSign';
import { Vendingmachine } from './Vendingmachine';
import { TrashCan } from './TrashCan';
import { PlayerCard } from './PlayerCard';
import { HighScoresCard } from './HighScoresCard';
import { AchievementsCard } from './AchievementsCard';
import { NowPlayingCard } from './NowPlayingCard';
import {
  AboutMeArt,
  ContactArt,
  ExperienceArt,
  PressStartCaption,
  ProjectsArt,
  PrashamoidArt,
  SkillsArt,
} from './CabinetScreenArt';

export const SCENE_WIDTH = 1400;
export const SCENE_HEIGHT = 800;
const FLOOR_Y = 470;
const PROXIMITY_PX = 80;
const CHARACTER_Y = SCENE_HEIGHT - 130;
const CHAR_SCALE = 3;

export type SectionId =
  | 'about'
  | 'projects'
  | 'experience'
  | 'skills'
  | 'contact';

interface SectionCabinetCfg {
  id: SectionId;
  label: string;
  accent: CabinetAccent;
  route: string;
  x: number;
  /** The pixel-art icon for the CRT screen. */
  screenArt: ReactNode;
  /** Accent color (hex) for the PRESS START caption between frames. */
  accentHex: string;
}

const ACCENT_HEX: Record<CabinetAccent, string> = {
  pink: '#ff2c9f',
  cyan: '#00f0ff',
  yellow: '#ffe600',
  green: '#39ff14',
};

export const SECTION_CABINETS: SectionCabinetCfg[] = [
  {
    id: 'about',
    label: 'ABOUT ME',
    accent: 'pink',
    route: '/overview',
    x: 220,
    screenArt: <AboutMeArt />,
    accentHex: ACCENT_HEX.pink,
  },
  {
    id: 'projects',
    label: 'PROJECTS',
    accent: 'cyan',
    route: '/projects',
    x: 460,
    screenArt: <ProjectsArt />,
    accentHex: ACCENT_HEX.cyan,
  },
  {
    id: 'experience',
    label: 'EXPERIENCE',
    accent: 'yellow',
    route: '/levels',
    x: 700,
    screenArt: <ExperienceArt />,
    accentHex: ACCENT_HEX.yellow,
  },
  {
    id: 'skills',
    label: 'SKILLS',
    accent: 'green',
    route: '/inventory',
    x: 940,
    screenArt: <SkillsArt />,
    accentHex: ACCENT_HEX.green,
  },
  {
    id: 'contact',
    label: 'CONTACT',
    accent: 'pink',
    route: '/comms',
    x: 1180,
    screenArt: <ContactArt />,
    accentHex: ACCENT_HEX.pink,
  },
];

const CABINET_Y = 230;
const PLAY_X = 150;
const PLAY_Y = 550;
const VENDING_X = 1320;
const VENDING_Y = 350;
const TRASH_X = 80;
const TRASH_Y = 620;

export interface ArcadeRoomProps {
  /** Section cabinets to render (defaults to SECTION_CABINETS). */
  cabinets?: SectionCabinetCfg[];
  /** Called when a section cabinet is activated. id is one of SectionId. */
  onCabinetActivate: (id: SectionId) => void;
  /** Disable motion if user prefers reduced-motion. */
  reduced?: boolean;
}

type Hotspot =
  | { kind: 'section'; id: SectionId; route: string; x: number }
  | { kind: 'play'; x: number }
  | { kind: 'vending'; x: number };

/** The composed immersive arcade scene. */
export function ArcadeRoom({
  cabinets = SECTION_CABINETS,
  onCabinetActivate,
  reduced = false,
}: ArcadeRoomProps) {
  const router = useRouter();
  const charRef = useRef<PixelCharacterHandle>(null);
  const [charX, setCharX] = useState(700);
  const [flashing, setFlashing] = useState(false);
  const busyRef = useRef(false);

  const hotspots = useMemo<Hotspot[]>(
    () => [
      ...cabinets.map(
        (c) =>
          ({
            kind: 'section',
            id: c.id,
            route: c.route,
            x: c.x,
          }) as Hotspot,
      ),
      { kind: 'play', x: PLAY_X },
      { kind: 'vending', x: VENDING_X },
    ],
    [cabinets],
  );

  /** Returns the closest hotspot within PROXIMITY_PX, else null. */
  const activeHotspot = useMemo<Hotspot | null>(() => {
    let best: Hotspot | null = null;
    let bestD = PROXIMITY_PX;
    for (const h of hotspots) {
      const d = Math.abs(h.x - charX);
      if (d < bestD) {
        bestD = d;
        best = h;
      }
    }
    return best;
  }, [hotspots, charX]);

  const flashAndGo = useCallback((after: () => void) => {
    if (busyRef.current) return;
    busyRef.current = true;
    setFlashing(true);
    window.setTimeout(() => {
      after();
    }, 250);
  }, []);

  const activateHotspot = useCallback(
    (h: Hotspot) => {
      if (h.kind === 'section') {
        onCabinetActivate(h.id);
        flashAndGo(() => router.push(h.route));
      } else if (h.kind === 'play') {
        flashAndGo(() => router.push('/play'));
      } else if (h.kind === 'vending') {
        flashAndGo(() => router.push('/comms'));
      }
    },
    [router, onCabinetActivate, flashAndGo],
  );

  const handleClickHotspot = useCallback(
    async (h: Hotspot) => {
      if (busyRef.current) return;
      try {
        await charRef.current?.walkTo(h.x);
      } catch {
        /* interrupted by keyboard */
      }
      activateHotspot(h);
    },
    [activateHotspot],
  );

  // Keyboard: [E] to activate the nearby hotspot
  useEffect(() => {
    const isTypingTarget = (el: EventTarget | null): boolean => {
      if (!(el instanceof HTMLElement)) return false;
      const tag = el.tagName;
      return (
        tag === 'INPUT' ||
        tag === 'TEXTAREA' ||
        tag === 'SELECT' ||
        el.isContentEditable
      );
    };
    const onKey = (e: KeyboardEvent) => {
      if (isTypingTarget(e.target)) return;
      if (e.code !== 'KeyE' && e.key !== 'e' && e.key !== 'E') return;
      if (!activeHotspot) return;
      e.preventDefault();
      activateHotspot(activeHotspot);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [activeHotspot, activateHotspot]);

  // PRASHAMOID cabinet screen frames — asteroid + ship icon, then PRESS START.
  const playFrames: ReactNode[] = useMemo(
    () => [
      <PrashamoidArt key="f1" />,
      <PressStartCaption key="f2" color={ACCENT_HEX.pink} />,
    ],
    [],
  );

  return (
    <div
      className="relative mx-auto overflow-hidden"
      style={{
        width: SCENE_WIDTH,
        height: SCENE_HEIGHT,
        background: '#04000a',
      }}
    >
      <SceneBackground
        width={SCENE_WIDTH}
        height={SCENE_HEIGHT}
        floorY={FLOOR_Y}
      />

      {/* === Top marquees === */}
      <div
        className="absolute z-30"
        style={{
          left: SCENE_WIDTH / 2 - 260,
          top: 44,
          width: 520,
          textAlign: 'center',
        }}
      >
        {/* Marquee board frame (dark with rivets) */}
        <div
          className="relative mx-auto inline-block"
          style={{
            background:
              'linear-gradient(180deg, #1a0a2a 0%, #0b0014 100%)',
            padding: '12px 28px 18px',
            border: '2px solid #050009',
            boxShadow:
              '0 6px 14px rgba(0,0,0,0.8), inset 0 1px 0 rgba(255,255,255,0.06)',
          }}
        >
          {/* Rivets */}
          {[8, 60, 200, 340, 480, 520 - 8].map((px, i) => (
            <span
              key={i}
              className="absolute rounded-full"
              style={{
                left: px,
                top: 6,
                width: 4,
                height: 4,
                background: '#22103a',
                boxShadow:
                  'inset 0 1px 0 rgba(255,255,255,0.25), 0 0 2px rgba(0,0,0,0.6)',
              }}
            />
          ))}
          {[8, 60, 200, 340, 480, 520 - 8].map((px, i) => (
            <span
              key={`b-${i}`}
              className="absolute rounded-full"
              style={{
                left: px,
                bottom: 6,
                width: 4,
                height: 4,
                background: '#22103a',
                boxShadow:
                  'inset 0 1px 0 rgba(255,255,255,0.25), 0 0 2px rgba(0,0,0,0.6)',
              }}
            />
          ))}

          <div
            className="font-pixel text-2xl tracking-widest"
            style={{
              color: '#ff2c9f',
              textShadow:
                '0 0 6px #ff2c9f, 0 0 18px #ff2c9faa, 0 0 32px rgba(255,44,159,0.6)',
              letterSpacing: '0.18em',
            }}
          >
            PRASHAM&apos;S ARCADE
          </div>
          <div
            className="mt-1 font-pixel text-[10px] tracking-widest"
            style={{
              color: '#00f0ff',
              textShadow: '0 0 4px #00f0ff, 0 0 10px rgba(0,240,255,0.5)',
            }}
          >
            WELCOME PLAYER 1 — SELECT A MACHINE
          </div>
        </div>
      </div>

      <div className="absolute z-30" style={{ right: 24, top: 50 }}>
        <NeonSign text="EXIT →" color="green" size="sm" />
      </div>

      {/* === Section cabinets (back wall) === */}
      {cabinets.map((c) => {
        const isActive =
          activeHotspot?.kind === 'section' && activeHotspot.id === c.id;
        const frames: ReactNode[] = [
          c.screenArt,
          <PressStartCaption key={`ps-${c.id}`} color={c.accentHex} />,
        ];
        return (
          <SceneCabinet
            key={c.id}
            x={c.x}
            y={CABINET_Y}
            label={c.label}
            accent={c.accent}
            screenFrames={frames}
            onActivate={() =>
              handleClickHotspot({
                kind: 'section',
                id: c.id,
                route: c.route,
                x: c.x,
              })
            }
            active={isActive}
          />
        );
      })}

      {/* === PRASHAMOID cabinet (off to the side / floor) === */}
      <SceneCabinet
        x={PLAY_X}
        y={PLAY_Y}
        scale={0.9}
        label="PRASHAMOID"
        accent="pink"
        accentSecondary="cyan"
        screenFrames={playFrames}
        onActivate={() =>
          handleClickHotspot({ kind: 'play', x: PLAY_X })
        }
        active={activeHotspot?.kind === 'play'}
        withStool={false}
        width={150}
        height={180}
      />

      {/* === Decorative + vending === */}
      <TrashCan x={TRASH_X} y={TRASH_Y} />
      <Vendingmachine
        x={VENDING_X}
        y={VENDING_Y}
        active={activeHotspot?.kind === 'vending'}
        onActivate={() =>
          handleClickHotspot({ kind: 'vending', x: VENDING_X })
        }
      />

      {/* === Pixel character === */}
      <PixelCharacter
        ref={charRef}
        initialX={700}
        y={CHARACTER_Y}
        minX={50}
        maxX={SCENE_WIDTH - 50}
        scale={CHAR_SCALE}
        onPositionChange={setCharX}
        reduced={reduced}
      />

      {/* === Inline HUD: controls hint === */}
      <div className="absolute left-4 bottom-3 z-40 border-2 border-border bg-bg-2/85 px-3 py-1 font-pixel text-[9px] tracking-widest text-text-dim">
        ← → / A D — WALK · [E] ENTER · CLICK CABINET
      </div>

      {/* === Click-to-flash overlay === */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-50"
        style={{
          background:
            'radial-gradient(closest-side, rgba(255,255,255,0.95), rgba(255,44,159,0.85) 60%, rgba(20,0,31,0.0) 100%)',
          opacity: flashing ? 1 : 0,
          transition: 'opacity 220ms ease-out',
        }}
      />

      {/* === Fixed-position HUD overlays (rendered as portals via fixed positioning) === */}
      <PlayerCard />
      <HighScoresCard />
      <AchievementsCard />
      <NowPlayingCard />
    </div>
  );
}

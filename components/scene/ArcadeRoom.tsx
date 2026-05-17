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
import {
  SceneBackground,
  type CeilingLampCfg,
  type FloorGlow,
} from './SceneBackground';
import { SceneCabinet, type CabinetAccent } from './SceneCabinet';
import {
  PixelCharacter,
  type PixelCharacterHandle,
} from './PixelCharacter';
import { PixelBeagle } from './PixelBeagle';
import { NeonSign } from './NeonSign';
import { Vendingmachine } from './Vendingmachine';
import { SnackVendingModal } from './SnackVendingModal';
import {
  usePlayerInventory,
  hydratePlayerInventory,
} from '@/lib/playerInventory';
import type { SnackItem } from '@/lib/snack-items';
import { TrashCan } from './TrashCan';
import { ChangingRoom } from './ChangingRoom';
import { AvatarCustomizationModal } from './AvatarCustomizationModal';
import { Poster } from './Poster';
import { SynthwaveWindow } from './SynthwaveWindow';
import { PinballMachine } from './PinballMachine';
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

export const SCENE_WIDTH = 1900;
export const SCENE_HEIGHT = 800;
const FLOOR_Y = 470;
const PROXIMITY_PX = 90;
/** Depth bounds for the character's stage. */
const BACK_Y = 478; // foot-y at z=0 (just below the cabinet bases)
const FRONT_Y = 720; // foot-y at z=1 (in front of the stage)
const CHAR_SCALE = 3;

export type SectionId =
  | 'player'
  | 'games'
  | 'levels'
  | 'inventory'
  | 'comms';

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
    id: 'player',
    label: 'PLAYER 1',
    accent: 'pink',
    route: '/overview',
    x: 470,
    screenArt: <AboutMeArt />,
    accentHex: ACCENT_HEX.pink,
  },
  {
    id: 'games',
    label: 'GAMES',
    accent: 'cyan',
    route: '/projects',
    x: 670,
    screenArt: <ProjectsArt />,
    accentHex: ACCENT_HEX.cyan,
  },
  {
    id: 'levels',
    label: 'LEVELS',
    accent: 'yellow',
    route: '/levels',
    x: 870,
    screenArt: <ExperienceArt />,
    accentHex: ACCENT_HEX.yellow,
  },
  {
    id: 'inventory',
    label: 'INVENTORY',
    accent: 'green',
    route: '/inventory',
    x: 1070,
    screenArt: <SkillsArt />,
    accentHex: ACCENT_HEX.green,
  },
  {
    id: 'comms',
    label: 'COMMS',
    accent: 'pink',
    route: '/comms',
    x: 1270,
    screenArt: <ContactArt />,
    accentHex: ACCENT_HEX.pink,
  },
];

const CABINET_Y = 230;
/** Standing-z at which the character "is at" a back-wall cabinet. */
const CABINET_STAND_Z = 0.14;
/** Proximity for back-wall cabinets — must also be close to the wall. */
const BACK_WALL_MAX_Z = 0.34;

// Floor-positioned props
const PLAY_X = 200;
const PLAY_Y = 550;
const PLAY_STAND_Z = 0.55;

const VENDING_X = 1490;
const VENDING_Y = 350;
const VENDING_STAND_Z = 0.18; // it's tall and against the wall
/** After picking a snack, character walks to this visible spot on the
 *  floor tiles (in front of the vending machine, off the back wall) so
 *  the eat/drink animation actually plays where you can see it. */
const CONSUME_SPOT_X = 1340;
const CONSUME_SPOT_Z = 0.6;

const TRASH_X = 80;
const TRASH_Y = 620;
/** Spot just to the right of the trash can where the character stands
 *  to toss the wrapper in. */
const TRASH_STAND_X = 150;
const TRASH_STAND_Z = 0.85;
/** How long to hold the eat/drink animation before walking to the trash.
 *  Drink tilt = 600ms; eat munch = 1500ms — wait a bit past the longer one. */
const CONSUME_HOLD_MS = 1700;

// Decorative wing props (no hotspots)
// ChangingRoom replaces the old EXIT door — same anchor point so the floor
// glow + ceiling lamp positions remain coherent. It IS interactive (opens
// the AvatarCustomizationModal).
const CHANGING_ROOM_X = 70;
const CHANGING_ROOM_Y = 230;
const CHANGING_ROOM_STAND_Z = 0.55; // it's a floor-front prop
const POSTER_X = 170;
const POSTER_Y = 250;
// Bigger synthwave window — ~480×280 spanning the right wing,
// bottom edge sits ~10px above the pinball back-glass at y=360.
const WINDOW_X = 1400;
const WINDOW_Y = 70;
const WINDOW_W = 480;
const WINDOW_H = 280;
const PINBALL_X = 1700;
const PINBALL_Y = 360; // top of back-glass at 360, base at 620 (on the floor)

export interface ArcadeRoomProps {
  /** Section cabinets to render (defaults to SECTION_CABINETS). */
  cabinets?: SectionCabinetCfg[];
  /** Called when a section cabinet is activated. id is one of SectionId. */
  onCabinetActivate: (id: SectionId) => void;
  /** Disable motion if user prefers reduced-motion. */
  reduced?: boolean;
}

type Hotspot =
  | {
      kind: 'section';
      id: SectionId;
      route: string;
      x: number;
      standZ: number;
      maxZ: number;
    }
  | {
      kind: 'play';
      x: number;
      standZ: number;
      maxZ: number;
    }
  | {
      kind: 'vending';
      x: number;
      standZ: number;
      maxZ: number;
    }
  | {
      kind: 'changing';
      x: number;
      standZ: number;
      maxZ: number;
    };

/** The composed immersive arcade scene. */
export function ArcadeRoom({
  cabinets = SECTION_CABINETS,
  onCabinetActivate,
  reduced = false,
}: ArcadeRoomProps) {
  const router = useRouter();
  const charRef = useRef<PixelCharacterHandle>(null);
  const consumeItem = usePlayerInventory((s) => s.consume);
  const throwAway = usePlayerInventory((s) => s.throwAway);
  const [charX, setCharX] = useState(SCENE_WIDTH / 2);
  const [charZ, setCharZ] = useState(0.7);
  const [flashing, setFlashing] = useState(false);
  const [changingOpen, setChangingOpen] = useState(false);
  const [vendingOpen, setVendingOpen] = useState(false);
  const busyRef = useRef(false);

  // Hydrate snack inventory (consumedHistory + trashedCount) from
  // sessionStorage so the history persists across page reloads in the
  // same tab.
  useEffect(() => {
    hydratePlayerInventory();
  }, []);

  /** Full snack flow: walk to visible spot → consume → wait for the
   *  eat/drink animation → walk to the trash can → throwAway. The
   *  inventory store persists consumedHistory + trashedCount to
   *  sessionStorage on every step. */
  const handlePickSnack = useCallback(
    async (item: SnackItem) => {
      try {
        await charRef.current?.walkTo(CONSUME_SPOT_X, CONSUME_SPOT_Z);
      } catch {
        /* keyboard interrupted — still consume so the visitor sees feedback */
      }
      consumeItem(item);
      // Let the eat/drink animation play before heading to the trash.
      await new Promise<void>((resolve) =>
        window.setTimeout(resolve, CONSUME_HOLD_MS),
      );
      try {
        await charRef.current?.walkTo(TRASH_STAND_X, TRASH_STAND_Z);
      } catch {
        /* interrupted again — throw anyway so the held item clears */
      }
      throwAway();
    },
    [consumeItem, throwAway],
  );

  const hotspots = useMemo<Hotspot[]>(
    () => [
      ...cabinets.map(
        (c) =>
          ({
            kind: 'section',
            id: c.id,
            route: c.route,
            x: c.x,
            standZ: CABINET_STAND_Z,
            maxZ: BACK_WALL_MAX_Z,
          }) as Hotspot,
      ),
      {
        kind: 'play',
        x: PLAY_X,
        standZ: PLAY_STAND_Z,
        maxZ: 0.85,
      },
      {
        kind: 'vending',
        x: VENDING_X,
        standZ: VENDING_STAND_Z,
        maxZ: BACK_WALL_MAX_Z,
      },
      {
        kind: 'changing',
        x: CHANGING_ROOM_X,
        standZ: CHANGING_ROOM_STAND_Z,
        maxZ: 0.85,
      },
    ],
    [cabinets],
  );

  /** Returns the closest hotspot that the character is actually next to
   *  (in BOTH x and z). */
  const activeHotspot = useMemo<Hotspot | null>(() => {
    let best: Hotspot | null = null;
    let bestD = PROXIMITY_PX;
    for (const h of hotspots) {
      const dx = Math.abs(h.x - charX);
      if (dx >= PROXIMITY_PX) continue;
      // Z-axis gate: depending on prop type
      if (h.kind === 'play' || h.kind === 'changing') {
        if (Math.abs(charZ - h.standZ) > 0.32) continue;
      } else {
        if (charZ > h.maxZ) continue;
      }
      if (dx < bestD) {
        bestD = dx;
        best = h;
      }
    }
    return best;
  }, [hotspots, charX, charZ]);

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
        // Open the snack vending modal instead of routing away.
        setVendingOpen(true);
      } else if (h.kind === 'changing') {
        // Local modal — no flash, no route change.
        setChangingOpen(true);
      }
    },
    [router, onCabinetActivate, flashAndGo],
  );

  const handleClickHotspot = useCallback(
    async (h: Hotspot) => {
      if (busyRef.current) return;
      try {
        // Walk to (x, standZ) in one promise; PixelCharacter handles
        // both axes simultaneously, then resolves once both are within
        // arrival tolerance.
        await charRef.current?.walkTo(h.x, h.standZ);
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

  // Position-update callback (memoized to avoid re-creating PixelCharacter deps)
  const onCharMove = useCallback((nx: number, nz: number) => {
    setCharX(nx);
    setCharZ(nz);
  }, []);

  // === Background config — lamps spread across the wider room
  const ceilingLamps: CeilingLampCfg[] = useMemo(
    () => [
      { x: 130, cableLen: 70, color: '#9be8ff', glow: 'rgba(0,240,255,0.4)' }, // over changing room (cyan)
      { x: 470, cableLen: 60 },
      { x: 770, cableLen: 78 },
      { x: 1070, cableLen: 60 },
      { x: 1370, cableLen: 60 },
      { x: 1720, cableLen: 72, color: '#a5d8ff', glow: 'rgba(80,160,255,0.4)' }, // over window/pinball
    ],
    [],
  );

  const floorGlows: FloorGlow[] = useMemo(
    () => [
      // Cabinet color leaks (driven by SECTION_CABINETS positions)
      { x: CHANGING_ROOM_X, rgb: '0,240,255', intensity: 0.32, width: 220 }, // changing room cyan
      ...cabinets.map((c) => {
        const accentRgb: Record<CabinetAccent, string> = {
          pink: '255,44,159',
          cyan: '0,240,255',
          yellow: '255,230,0',
          green: '57,255,20',
        };
        return {
          x: c.x,
          rgb: accentRgb[c.accent],
          intensity: c.accent === 'yellow' || c.accent === 'green' ? 0.3 : 0.35,
        };
      }),
      { x: PLAY_X, rgb: '255,44,159', intensity: 0.25, width: 160 },
      { x: VENDING_X, rgb: '255,230,0', intensity: 0.32 },
      // Window blue glow — bigger window now (480px wide centered at ~1640) so
      // boost the puddle width and intensity to match.
      { x: 1640, rgb: '0,180,255', intensity: 0.42, width: 380 },
      { x: PINBALL_X + 65, rgb: '255,44,159', intensity: 0.25, width: 170 },
    ],
    [cabinets],
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
        ceilingLamps={ceilingLamps}
        floorGlows={floorGlows}
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

      {/* === Left wing — interactive ChangingRoom + decorative poster === */}
      <ChangingRoom
        x={CHANGING_ROOM_X}
        y={CHANGING_ROOM_Y}
        active={activeHotspot?.kind === 'changing'}
        onActivate={() =>
          handleClickHotspot({
            kind: 'changing',
            x: CHANGING_ROOM_X,
            standZ: CHANGING_ROOM_STAND_Z,
            maxZ: 0.85,
          })
        }
      />
      <Poster x={POSTER_X} y={POSTER_Y} variant="spaceship" />

      {/* === Right wing — decorative === */}
      <SynthwaveWindow
        x={WINDOW_X}
        y={WINDOW_Y}
        width={WINDOW_W}
        height={WINDOW_H}
      />
      <PinballMachine x={PINBALL_X} y={PINBALL_Y} />

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
                standZ: CABINET_STAND_Z,
                maxZ: BACK_WALL_MAX_Z,
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
          handleClickHotspot({
            kind: 'play',
            x: PLAY_X,
            standZ: PLAY_STAND_Z,
            maxZ: 0.85,
          })
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
          handleClickHotspot({
            kind: 'vending',
            x: VENDING_X,
            standZ: VENDING_STAND_Z,
            maxZ: BACK_WALL_MAX_Z,
          })
        }
      />

      {/* === Pixel character === */}
      <PixelCharacter
        ref={charRef}
        initialX={SCENE_WIDTH / 2}
        initialZ={0.7}
        backY={BACK_Y}
        frontY={FRONT_Y}
        minX={50}
        maxX={SCENE_WIDTH - 50}
        scale={CHAR_SCALE}
        onPositionChange={onCharMove}
        reduced={reduced}
      />
      <PixelBeagle
        targetX={charX}
        targetZ={charZ}
        backY={BACK_Y}
        frontY={FRONT_Y}
        scale={CHAR_SCALE}
        reduced={reduced}
      />

      {/* === Inline HUD: controls hint === */}
      <div className="absolute left-4 bottom-3 z-40 border-2 border-border bg-bg-2/85 px-3 py-1 font-pixel text-[9px] tracking-widest text-text-dim">
        ← → ↑ ↓ / WASD — WALK · [E] ENTER · CLICK CABINET
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

      {/* === Avatar customization modal — opened by the ChangingRoom prop === */}
      <AvatarCustomizationModal
        open={changingOpen}
        onClose={() => setChangingOpen(false)}
      />

      {/* === Snack vending modal — opened by the Vendingmachine prop === */}
      <SnackVendingModal
        open={vendingOpen}
        onClose={() => setVendingOpen(false)}
        onPick={handlePickSnack}
      />
    </div>
  );
}

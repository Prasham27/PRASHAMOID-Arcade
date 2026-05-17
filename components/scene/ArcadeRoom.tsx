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
import { MainTerminal } from './MainTerminal';
import { Vendingmachine } from './Vendingmachine';
import { TrashCan } from './TrashCan';
import { PixelText } from '@/components/effects/PixelText';

export const SCENE_WIDTH = 1400;
export const SCENE_HEIGHT = 720;
const FLOOR_Y = 430;
const PROXIMITY_PX = 80;
const CHARACTER_Y = SCENE_HEIGHT - 110;
const CHAR_SCALE = 3;

interface ProjectCabinetCfg {
  id: string;
  label: string;
  accent: CabinetAccent;
  frames: ReactNode[];
  x: number;
}

export interface ArcadeRoomProps {
  projectCabinets: ProjectCabinetCfg[];
  onCabinetActivate: (id: string) => void;
  /** Disable motion if user prefers reduced-motion */
  reduced?: boolean;
}

type Hotspot =
  | { kind: 'project'; id: string; x: number }
  | { kind: 'main'; x: number }
  | { kind: 'play'; x: number }
  | { kind: 'vending'; x: number };

const MAIN_X = 700;
const MAIN_Y = 360;
const PLAY_X = 1180;
const PLAY_Y = 320;
const VENDING_X = 1305;
const VENDING_Y = 470;
const TRASH_X = 80;
const TRASH_Y = 540;

/** The composed immersive arcade scene. */
export function ArcadeRoom({
  projectCabinets,
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
      ...projectCabinets.map(
        (p) => ({ kind: 'project', id: p.id, x: p.x }) as Hotspot,
      ),
      { kind: 'main', x: MAIN_X },
      { kind: 'play', x: PLAY_X },
      { kind: 'vending', x: VENDING_X },
    ],
    [projectCabinets],
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

  const flashAndGo = useCallback(
    (after: () => void) => {
      if (busyRef.current) return;
      busyRef.current = true;
      setFlashing(true);
      window.setTimeout(() => {
        after();
        // intentionally leave flashing on through navigation
      }, 250);
    },
    [],
  );

  const activateHotspot = useCallback(
    (h: Hotspot) => {
      if (h.kind === 'project') {
        onCabinetActivate(h.id);
        flashAndGo(() => router.push(`/cabinet/${h.id}`));
      } else if (h.kind === 'main') {
        flashAndGo(() => router.push('/overview'));
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
      // Walk to target, then activate.
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

  const playFrames: ReactNode[] = useMemo(
    () => [
      <PixelText key="f1" size="md" color="pink" glow>
        PRASHAMOID
      </PixelText>,
      <PixelText key="f2" size="md" color="cyan" glow>
        ★ MINI-GAME
      </PixelText>,
      <PixelText key="f3" size="sm" color="yellow" glow>
        INSERT COIN
      </PixelText>,
    ],
    [],
  );

  return (
    <div
      className="relative mx-auto overflow-hidden"
      style={{
        width: SCENE_WIDTH,
        height: SCENE_HEIGHT,
        background: '#0b0014',
      }}
    >
      <SceneBackground
        width={SCENE_WIDTH}
        height={SCENE_HEIGHT}
        floorY={FLOOR_Y}
      />

      {/* Top neon marquees */}
      <div
        className="absolute z-30"
        style={{
          left: SCENE_WIDTH / 2 - 220,
          top: 38,
          width: 440,
          textAlign: 'center',
        }}
      >
        <NeonSign
          text="PRASHAMOID ARCADE"
          color="pink"
          secondary="cyan"
          size="lg"
        />
      </div>
      <div className="absolute z-30" style={{ right: 24, top: 50 }}>
        <NeonSign text="EXIT →" color="green" size="sm" />
      </div>

      {/* Back-wall project cabinets */}
      {projectCabinets.map((c) => {
        const isActive =
          activeHotspot?.kind === 'project' && activeHotspot.id === c.id;
        return (
          <SceneCabinet
            key={c.id}
            x={c.x}
            y={210}
            label={c.label}
            accent={c.accent}
            screenFrames={c.frames}
            onActivate={() => handleClickHotspot({ kind: 'project', id: c.id, x: c.x })}
            active={isActive}
          />
        );
      })}

      {/* Main terminal centerpiece */}
      <MainTerminal
        x={MAIN_X}
        y={MAIN_Y}
        active={activeHotspot?.kind === 'main'}
        onActivate={() => handleClickHotspot({ kind: 'main', x: MAIN_X })}
      />

      {/* PRASHAMOID cabinet — special, on the floor */}
      <SceneCabinet
        x={PLAY_X}
        y={PLAY_Y}
        scale={1.05}
        label="PRASHAMOID"
        accent="pink"
        accentSecondary="cyan"
        screenFrames={playFrames}
        onActivate={() => handleClickHotspot({ kind: 'play', x: PLAY_X })}
        active={activeHotspot?.kind === 'play'}
      />

      {/* Decorative + vending */}
      <TrashCan x={TRASH_X} y={TRASH_Y} />
      <Vendingmachine
        x={VENDING_X}
        y={VENDING_Y}
        active={activeHotspot?.kind === 'vending'}
        onActivate={() => handleClickHotspot({ kind: 'vending', x: VENDING_X })}
      />

      {/* Pixel character */}
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

      {/* HUD: controls hint */}
      <div
        className="absolute left-4 bottom-3 z-40 border-2 border-border bg-bg-2/80 px-3 py-1 font-pixel text-[9px] tracking-widest text-text-dim"
      >
        ← → / A D — WALK · [E] ENTER · CLICK CABINET
      </div>

      {/* Click-to-flash overlay */}
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
    </div>
  );
}

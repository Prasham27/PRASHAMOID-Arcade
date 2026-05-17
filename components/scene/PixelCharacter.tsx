'use client';

import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import type { SpriteDef } from '@/lib/sprites';
import { Sprite } from '@/components/icons/Sprite';
import {
  hydratePlayerAppearance,
  usePlayerAppearance,
  type GogglesType,
  type HatType,
  type HoodieColor,
} from '@/lib/playerAppearance';
import { usePlayerInventory } from '@/lib/playerInventory';

/** Chibi pixel figure — 24w x 36h. Two-frame walk cycle.
 *  Bigger head, smaller body, big eyes, blush, default cyan hoodie.
 *
 *  Palette key:
 *   .  transparent
 *   K  ink outline / shadow
 *   H  hoodie body (recolorable)
 *   D  hoodie deep-shadow (recolorable, slightly darker)
 *   P  pink drawstring / pocket trim
 *   S  skin (warm peach)
 *   F  face shadow
 *   E  eye dark
 *   I  eye shine (white highlight)
 *   B  blush (pink cheek)
 *   M  mouth (dark pink)
 *   R  hair (dark, visible under hood front)
 *   N  pants (navy)
 *   W  shoes (white)
 *   T  shoe stripe (pink)
 */
type PaletteMap = Record<string, string>;

// Base palette colors that don't depend on appearance
const BASE_PALETTE: PaletteMap = {
  '.': 'transparent',
  K: '#0b0014',
  P: '#ff2c9f',
  S: '#ffc6a0',
  F: '#d49778',
  E: '#0b0014',
  I: '#ffffff',
  B: '#ff86b8',
  M: '#a8245e',
  R: '#1c0a1a',
  N: '#0e1a3a',
  W: '#f5e8ff',
  T: '#ff2c9f',
};

const HOODIE_HEX: Record<HoodieColor, { body: string; shade: string }> = {
  cyan: { body: '#00f0ff', shade: '#008ea8' },
  pink: { body: '#ff2c9f', shade: '#a01262' },
  yellow: { body: '#ffe600', shade: '#a89500' },
  green: { body: '#39ff14', shade: '#1ba300' },
  red: { body: '#ff3344', shade: '#a01a25' },
  white: { body: '#f5e8ff', shade: '#9a8aa8' },
};

function buildCharacterPalette(hoodie: HoodieColor): PaletteMap {
  const { body, shade } = HOODIE_HEX[hoodie];
  return { ...BASE_PALETTE, H: body, D: shade };
}

/*
  Grid is 24 wide x 36 tall. Coordinates (col,row):
    rows  0-12  → head (~12h, hood + face)
    rows 13-22  → torso/arms (~10h)
    rows 23-28  → legs (~6h)
    rows 29-31  → shoes
    rows 32-35  → spare / floor
*/

// Head + torso shared between frames. Rows 0..22 (23 rows).
const HEAD_AND_TORSO: string[] = [
  // ---- HEAD (rows 0..12, 13h) ----
  '........KKKKKKKKKK......', //  0  hood crown
  '.......KHHHHHHHHHHK.....', //  1
  '......KHHHHHHHHHHHHK....', //  2  hood widens
  '.....KHHHRRRRRRRRHHHK...', //  3  hair fringe peek under hood
  '....KHHHRRRRRRRRRRHHK...', //  4
  '....KHHSSSSSSSSSSSSHK...', //  5  face top (forehead)
  '...KHHSSSSSSSSSSSSSSHK..', //  6
  '...KHHSEEISSSSSSSEEISHK.', //  7  eyes (2-tall ovals w/ shine)
  '...KHHSEEISSSSSSSEEISHK.', //  8  eye row 2
  '...KHHSSBBSSSSSSSSBBSHK.', //  9  blush cheeks under each eye
  '...KHHSSSSSSMMMMSSSSSHK.', // 10  smile mouth (4px wide)
  '....KHHSSSSSSSSSSSSSHK..', // 11  chin
  '.....KHHHSSSSSSSSHHHK...', // 12  jaw/neck blends to hood
  // ---- TORSO/ARMS (rows 13..22, 10h) ----
  '....KHHHHHHHHHHHHHHHK...', // 13  shoulders begin
  '...KHHHHHPPPPPPPPHHHHK..', // 14  pink hoodie drawstring across collar
  '...KHHHHHHHHHHHHHHHHHK..', // 15
  '..KDHHHHHHHHHHHHHHHHDK..', // 16  arms add darker shading on sides
  '..KDHHHHHHHHHHHHHHHHDK..', // 17
  '..KDHHHHHHPPPPPPHHHHDK..', // 18  pocket trim (pink, kangaroo-style)
  '..KDHHHHHPHHHHHHPHHHDK..', // 19  pocket sides
  '..KDHHHHHPHHHHHHPHHHDK..', // 20
  '..KDHHHHHPPPPPPPPHHHDK..', // 21  pocket bottom
  '..KDDHHHHHHHHHHHHHHDDK..', // 22  hoodie hem (bottom)
];

// Frame A — feet planted side-by-side
const FRAME_A: string[] = [
  ...HEAD_AND_TORSO,
  // ---- LEGS (rows 23..28, 6h) ----
  '...KKHNNNNNN..NNNNNNHKK.', // 23  legs split, hoodie hem peeks
  '....KNNNNNN....NNNNNNK..', // 24
  '....KNNNNNN....NNNNNNK..', // 25
  '....KNNNNNN....NNNNNNK..', // 26
  '....KNNNNNN....NNNNNNK..', // 27
  '....KNNNNNN....NNNNNNK..', // 28
  // ---- SHOES (rows 29..31, 3h) ----
  '...KWWWWWWWK..KWWWWWWWK.', // 29  shoes
  '...KWTTTTTTK..KWTTTTTTK.', // 30  pink stripe
  '...KKKKKKKKK..KKKKKKKKK.', // 31  shoe outline
  // ---- spare (rows 32..35) ----
  '........................', // 32
  '........................', // 33
  '........................', // 34
  '........................', // 35
];

// Frame B — mid-step (back leg lifts a bit, weight shifts)
const FRAME_B: string[] = [
  ...HEAD_AND_TORSO,
  '...KKHNNNNNN..NNNNNNHKK.', // 23
  '....KNNNNNN....NNNNNNK..', // 24
  '....KNNNNNN....NNNNNNK..', // 25
  '.....KNNNNN....NNNNNK...', // 26  rear leg lifts
  '.....KNNNNN....NNNNNK...', // 27
  '......KNNNN....NNNNK....', // 28
  '....KWWWWWWWK..KWWWWWWWK', // 29  shoes (shifted, mid-stride)
  '....KWTTTTTTK..KWTTTTTTK', // 30
  '....KKKKKKKKK..KKKKKKKKK', // 31
  '........................', // 32
  '........................', // 33
  '........................', // 34
  '........................', // 35
];

const SPRITE_WIDTH = 24;
const SPRITE_HEIGHT = 36;

function buildSprite(
  id: string,
  rows: string[],
  hoodie: HoodieColor,
): SpriteDef {
  return {
    id,
    width: SPRITE_WIDTH,
    height: SPRITE_HEIGHT,
    palette: buildCharacterPalette(hoodie),
    rows,
  };
}

// === HAT SPRITES ===========================================================
// Each hat is a small 14w x 8h overlay anchored over the head.
// Palette keys are local per-hat to keep colors crisp.
type OverlayDef = {
  width: number;
  height: number;
  palette: PaletteMap;
  rows: string[];
  /** Pixel offset from the character sprite's TOP-LEFT to where this overlay's
   *  top-left should be drawn. (in 1x sprite units, multiplied by scale at render) */
  offsetX: number;
  offsetY: number;
};

const HAT_OVERLAYS: Record<Exclude<HatType, 'none'>, OverlayDef> = {
  // Slouchy yellow knit beanie with a darker band
  beanie: {
    width: 14,
    height: 8,
    palette: {
      '.': 'transparent',
      K: '#0b0014',
      Y: '#ffe600',
      O: '#a8930a',
      P: '#ff2c9f',
    },
    rows: [
      '......PP......',
      '.....KYYK.....',
      '....KYYYYK....',
      '...KYYYYYYK...',
      '..KYYOOOOYYK..',
      '..KYOOOOOOYK..',
      '..KKOOOOOOKK..',
      '..............',
    ],
    offsetX: 5,
    offsetY: -2,
  },
  // Backwards-facing pink baseball cap (button on top-back, no front brim)
  cap: {
    width: 14,
    height: 8,
    palette: {
      '.': 'transparent',
      K: '#0b0014',
      P: '#ff2c9f',
      D: '#a01262',
      W: '#f5e8ff',
    },
    rows: [
      '......W.......',
      '.....KPPK.....',
      '....KPPPPK....',
      '...KPPPPPPK...',
      '..KPPPPPPPPK..',
      '..KDDDDDDDDK..',
      '..KKDDDDDDKK..',
      '..............',
    ],
    offsetX: 5,
    offsetY: -1,
  },
  // Dark band over head with two green ear pads
  headphones: {
    width: 14,
    height: 8,
    palette: {
      '.': 'transparent',
      K: '#0b0014',
      D: '#22093f',
      G: '#39ff14',
      W: '#f5e8ff',
    },
    rows: [
      '...KKKKKKKK...',
      '..KDDDDDDDDK..',
      '..KDDWWWWDDK..',
      '..KDDDDDDDDK..',
      '..KKKKKKKKKK..',
      '.KGGK....KGGK.',
      '.KGGK....KGGK.',
      '.KKKK....KKKK.',
    ],
    offsetX: 5,
    offsetY: 0,
  },
  // Tiny pixel crown — yellow with red gems
  crown: {
    width: 14,
    height: 8,
    palette: {
      '.': 'transparent',
      K: '#0b0014',
      Y: '#ffe600',
      O: '#a8930a',
      R: '#ff3344',
    },
    rows: [
      '..K..K..K..K..',
      '.KYK.KYK.KYK..',
      '.KYKKKYKKKYK..',
      '.KYRYYYRYYRYK.',
      '.KYYYYYYYYYYK.',
      '.KYOOOOOOOOYK.',
      '.KKKKKKKKKKKK.',
      '..............',
    ],
    offsetX: 5,
    offsetY: -1,
  },
};

// === GOGGLES SPRITES =======================================================
// Small 10w x 4h overlays positioned across the eyes.
const GOGGLES_OVERLAYS: Record<Exclude<GogglesType, 'none'>, OverlayDef> = {
  // Chunky steampunk-style frame (dark) with cyan lenses + small strap dots
  'pixel-goggles': {
    width: 12,
    height: 4,
    palette: {
      '.': 'transparent',
      K: '#0b0014',
      C: '#00f0ff',
      D: '#22093f',
      I: '#ffffff',
    },
    rows: [
      'KKKKKKKKKKKK',
      'KCCIKDDKCCIK',
      'KCCCKDDKCCCK',
      'KKKKKKKKKKKK',
    ],
    offsetX: 6,
    offsetY: 7,
  },
  // Single horizontal cyan visor
  visor: {
    width: 12,
    height: 4,
    palette: {
      '.': 'transparent',
      K: '#0b0014',
      C: '#00f0ff',
      I: '#aff5ff',
    },
    rows: [
      'KKKKKKKKKKKK',
      'KCCCIICCCCCK',
      'KCCCCCCCCCCK',
      'KKKKKKKKKKKK',
    ],
    offsetX: 6,
    offsetY: 7,
  },
  // 8-bit black shades — solid lenses with a tiny white shine
  shades: {
    width: 12,
    height: 4,
    palette: {
      '.': 'transparent',
      K: '#0b0014',
      I: '#ffffff',
    },
    rows: [
      'KKKKKKKKKKKK',
      'KKKIKKKKIKKK',
      'KKKKKKKKKKKK',
      '..K......K..',
    ],
    offsetX: 6,
    offsetY: 7,
  },
};

export interface PixelCharacterHandle {
  /** Walk to a target (world-x, depth-z). Resolves once both axes are within tolerance.
   *  If z is omitted, the current z is preserved. */
  walkTo: (targetX: number, targetZ?: number) => Promise<void>;
  getX: () => number;
  getZ: () => number;
}

export interface PixelCharacterProps {
  /** Initial world-x in scene coordinates. */
  initialX: number;
  /** Initial depth z in [0..1]. 0 = back wall, 1 = front of stage. */
  initialZ?: number;
  /** Y-pixel of the floor at z=0 (back wall foot). */
  backY: number;
  /** Y-pixel of the floor at z=1 (front of stage). */
  frontY: number;
  /** Scene min/max bounds for horizontal movement (world-x). */
  minX: number;
  maxX: number;
  /** Min/max depth z. Defaults [0, 1]. */
  minZ?: number;
  maxZ?: number;
  /** Base sprite scale at z=1 (the "front" full-size scale). */
  scale?: number;
  /** Scale factor at z=0 (back). Default 0.62. */
  backScaleFactor?: number;
  /** Whether arrow keys/WASD should drive the character. */
  inputEnabled?: boolean;
  /** Notified each frame with the current (x, z). Used for proximity highlight. */
  onPositionChange?: (x: number, z: number) => void;
  /** Reduced motion → use static frame, no walk cycle. */
  reduced?: boolean;
}

// Horizontal movement
const SPEED_X = 240; // px / sec — top horizontal speed
const ACCEL_X = 1400;
const FRICTION_X = 1100;

// Depth movement
const Z_TRAVEL_PX = 400;
const SPEED_VZ_PX = 180;
const SPEED_Z = SPEED_VZ_PX / Z_TRAVEL_PX;
const ACCEL_Z = 1100 / Z_TRAVEL_PX;
const FRICTION_Z = 900 / Z_TRAVEL_PX;

const ARRIVAL_X = 4;
const ARRIVAL_Z = 0.012;

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

export const PixelCharacter = forwardRef<
  PixelCharacterHandle,
  PixelCharacterProps
>(function PixelCharacter(
  {
    initialX,
    initialZ = 0.5,
    backY,
    frontY,
    minX,
    maxX,
    minZ = 0,
    maxZ = 1,
    scale = 3,
    backScaleFactor = 0.62,
    inputEnabled = true,
    onPositionChange,
    reduced = false,
  },
  ref,
) {
  const [x, setX] = useState(initialX);
  const [z, setZ] = useState(initialZ);
  const [frame, setFrame] = useState<0 | 1>(0);
  const [facing, setFacing] = useState<'left' | 'right'>('right');
  // Idle bob: 0 or 1 pixel of vertical offset, swapped every ~1.4s.
  const [idleBob, setIdleBob] = useState(0);
  const movingRef = useRef(false);
  const xRef = useRef(initialX);
  const zRef = useRef(initialZ);
  const vxRef = useRef(0);
  const vzRef = useRef(0);
  const targetRef = useRef<{
    x: number;
    z: number;
    resolve: () => void;
  } | null>(null);
  const inputRef = useRef<{
    left: boolean;
    right: boolean;
    up: boolean;
    down: boolean;
  }>({
    left: false,
    right: false,
    up: false,
    down: false,
  });
  const lastFrameAt = useRef(0);
  const rafRef = useRef<number | null>(null);

  // === Appearance store ===
  const hoodieColor = usePlayerAppearance((s) => s.hoodieColor);
  const hatType = usePlayerAppearance((s) => s.hatType);
  const gogglesType = usePlayerAppearance((s) => s.gogglesType);

  // === Inventory store (held snack) ===
  const heldItem = usePlayerInventory((s) => s.heldItem);
  const consumptionId = usePlayerInventory((s) => s.consumptionId);

  // Hydrate sessionStorage once on mount
  useEffect(() => {
    hydratePlayerAppearance();
  }, []);

  // Idle bob loop — only animates while stationary, paused under reduced motion.
  useEffect(() => {
    if (reduced) {
      setIdleBob(0);
      return;
    }
    const id = window.setInterval(() => {
      if (!movingRef.current) {
        setIdleBob((b) => (b === 0 ? 1 : 0));
      }
    }, 700); // toggle every 0.7s → full cycle 1.4s
    return () => window.clearInterval(id);
  }, [reduced]);

  // Build the two sprite frames based on current hoodie color.
  const spriteA = useMemo<SpriteDef>(
    () => buildSprite('char_a', FRAME_A, hoodieColor),
    [hoodieColor],
  );
  const spriteB = useMemo<SpriteDef>(
    () => buildSprite('char_b', FRAME_B, hoodieColor),
    [hoodieColor],
  );

  useImperativeHandle(ref, () => ({
    walkTo(targetX: number, targetZ?: number) {
      const cx = Math.max(minX, Math.min(maxX, targetX));
      const cz = Math.max(
        minZ,
        Math.min(maxZ, targetZ ?? zRef.current),
      );
      return new Promise<void>((resolve) => {
        if (targetRef.current) targetRef.current.resolve();
        targetRef.current = { x: cx, z: cz, resolve };
      });
    },
    getX: () => xRef.current,
    getZ: () => zRef.current,
  }));

  useEffect(() => {
    if (!inputEnabled) return;
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
    const cancelTarget = () => {
      if (targetRef.current) {
        const r = targetRef.current.resolve;
        targetRef.current = null;
        r();
      }
    };
    const down = (e: KeyboardEvent) => {
      if (isTypingTarget(e.target)) return;
      const k = e.key;
      if (k === 'ArrowLeft' || k === 'a' || k === 'A') {
        inputRef.current.left = true;
        cancelTarget();
      } else if (k === 'ArrowRight' || k === 'd' || k === 'D') {
        inputRef.current.right = true;
        cancelTarget();
      } else if (k === 'ArrowUp' || k === 'w' || k === 'W') {
        inputRef.current.up = true;
        cancelTarget();
      } else if (k === 'ArrowDown' || k === 's' || k === 'S') {
        inputRef.current.down = true;
        cancelTarget();
      }
    };
    const up = (e: KeyboardEvent) => {
      const k = e.key;
      if (k === 'ArrowLeft' || k === 'a' || k === 'A')
        inputRef.current.left = false;
      else if (k === 'ArrowRight' || k === 'd' || k === 'D')
        inputRef.current.right = false;
      else if (k === 'ArrowUp' || k === 'w' || k === 'W')
        inputRef.current.up = false;
      else if (k === 'ArrowDown' || k === 's' || k === 'S')
        inputRef.current.down = false;
    };
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    return () => {
      window.removeEventListener('keydown', down);
      window.removeEventListener('keyup', up);
    };
  }, [inputEnabled]);

  useEffect(() => {
    let last = performance.now();
    const tick = (t: number) => {
      const dt = Math.min(0.05, (t - last) / 1000);
      last = t;
      let vx = vxRef.current;
      let vz = vzRef.current;
      const inp = inputRef.current;
      const tgt = targetRef.current;

      let dirX = 0;
      let dirZ = 0;
      if (tgt) {
        const dx = tgt.x - xRef.current;
        const dz = tgt.z - zRef.current;
        const arrivedX = Math.abs(dx) < ARRIVAL_X;
        const arrivedZ = Math.abs(dz) < ARRIVAL_Z;
        if (arrivedX && arrivedZ) {
          xRef.current = tgt.x;
          zRef.current = tgt.z;
          vx = 0;
          vz = 0;
          const r = tgt.resolve;
          targetRef.current = null;
          r();
        } else {
          if (!arrivedX) dirX = dx > 0 ? 1 : -1;
          if (!arrivedZ) dirZ = dz > 0 ? 1 : -1;
        }
      } else {
        if (inp.left && !inp.right) dirX = -1;
        else if (inp.right && !inp.left) dirX = 1;
        if (inp.up && !inp.down) dirZ = -1;
        else if (inp.down && !inp.up) dirZ = 1;
      }

      if (dirX !== 0) {
        vx += dirX * ACCEL_X * dt;
        if (vx > SPEED_X) vx = SPEED_X;
        if (vx < -SPEED_X) vx = -SPEED_X;
        setFacing(dirX > 0 ? 'right' : 'left');
      } else {
        if (vx > 0) vx = Math.max(0, vx - FRICTION_X * dt);
        else if (vx < 0) vx = Math.min(0, vx + FRICTION_X * dt);
      }

      if (dirZ !== 0) {
        vz += dirZ * ACCEL_Z * dt;
        if (vz > SPEED_Z) vz = SPEED_Z;
        if (vz < -SPEED_Z) vz = -SPEED_Z;
      } else {
        if (vz > 0) vz = Math.max(0, vz - FRICTION_Z * dt);
        else if (vz < 0) vz = Math.min(0, vz + FRICTION_Z * dt);
      }

      vxRef.current = vx;
      vzRef.current = vz;

      let nx = xRef.current + vx * dt;
      if (nx < minX) {
        nx = minX;
        vx = 0;
        vxRef.current = 0;
      } else if (nx > maxX) {
        nx = maxX;
        vx = 0;
        vxRef.current = 0;
      }
      xRef.current = nx;

      let nz = zRef.current + vz * dt;
      if (nz < minZ) {
        nz = minZ;
        vz = 0;
        vzRef.current = 0;
      } else if (nz > maxZ) {
        nz = maxZ;
        vz = 0;
        vzRef.current = 0;
      }
      zRef.current = nz;

      setX(nx);
      setZ(nz);
      onPositionChange?.(nx, nz);

      const planarSpeed = Math.hypot(vx, vz * Z_TRAVEL_PX);
      const isMoving = planarSpeed > 20;
      movingRef.current = isMoving;
      if (!reduced && isMoving) {
        if (t - lastFrameAt.current > 180) {
          setFrame((f) => (f === 0 ? 1 : 0));
          lastFrameAt.current = t;
        }
      } else {
        if (frame !== 0) setFrame(0);
      }

      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [minX, maxX, minZ, maxZ, reduced]);

  const def = frame === 0 ? spriteA : spriteB;
  const persp = lerp(backScaleFactor, 1, z);
  const effectiveScale = scale * persp;
  const w = def.width * effectiveScale;
  const h = def.height * effectiveScale;
  // Apply idle bob (raise by 1 sprite-pixel when bobbing). Bob only when not moving.
  const bobPx = movingRef.current || reduced ? 0 : idleBob * effectiveScale;
  const screenY = lerp(backY, frontY, z) - h - bobPx;
  const charZIndex = 19 + Math.round(z * 16);

  return (
    <PixelCharacterDisplay
      def={def}
      effectiveScale={effectiveScale}
      x={x}
      screenY={screenY}
      w={w}
      h={h}
      persp={persp}
      facing={facing}
      hatType={hatType}
      gogglesType={gogglesType}
      heldItem={heldItem}
      consumptionId={consumptionId}
      charZIndex={charZIndex}
      reduced={reduced}
    />
  );
});

// ===========================================================================
// PixelCharacterDisplay — pure render layer. Can also be used standalone
// (e.g. inside the avatar customization modal) by feeding it static props.
// ===========================================================================

export interface PixelCharacterDisplayProps {
  def: SpriteDef;
  effectiveScale: number;
  x: number;
  screenY: number;
  w: number;
  h: number;
  persp: number;
  facing: 'left' | 'right';
  hatType: HatType;
  gogglesType: GogglesType;
  heldItem: ReturnType<typeof usePlayerInventory.getState>['heldItem'];
  consumptionId: number;
  charZIndex: number;
  reduced: boolean;
}

function PixelCharacterDisplay({
  def,
  effectiveScale,
  x,
  screenY,
  w,
  h,
  persp,
  facing,
  hatType,
  gogglesType,
  heldItem,
  consumptionId,
  charZIndex,
  reduced,
}: PixelCharacterDisplayProps) {
  // --- Consumption animation state (drink tilt + eat munch + popup) ---
  type Popup = { id: number; text: string };
  const [popups, setPopups] = useState<Popup[]>([]);
  const [activeConsumeKey, setActiveConsumeKey] = useState<string | null>(null);
  // We use consumptionId + heldItem identity to detect new consumption events.
  const lastConsumeRef = useRef<{ id: number; itemId: string | null }>({
    id: 0,
    itemId: null,
  });
  // For drink-tilt rotation
  const [drinkTilt, setDrinkTilt] = useState(false);
  // For eat-munch (scale pulse) state
  const [eatMunch, setEatMunch] = useState(false);

  useEffect(() => {
    if (!heldItem) return;
    const last = lastConsumeRef.current;
    if (last.id === consumptionId && last.itemId === heldItem.id) return;
    lastConsumeRef.current = { id: consumptionId, itemId: heldItem.id };
    const key = `${heldItem.id}-${consumptionId}`;
    setActiveConsumeKey(key);
    const popText = heldItem.action === 'drink' ? '+1 SIP' : '+1 MUNCH';
    const popId = Date.now() + Math.random();
    setPopups((p) => [...p, { id: popId, text: popText }]);
    // Auto-remove popup after 1s
    const popTimer = window.setTimeout(() => {
      setPopups((p) => p.filter((x) => x.id !== popId));
    }, 1000);
    let tiltTimer: number | undefined;
    let munchTimer: number | undefined;
    if (heldItem.action === 'drink') {
      setDrinkTilt(true);
      tiltTimer = window.setTimeout(() => setDrinkTilt(false), 600);
    } else {
      setEatMunch(true);
      munchTimer = window.setTimeout(() => setEatMunch(false), 1500);
    }
    return () => {
      window.clearTimeout(popTimer);
      if (tiltTimer) window.clearTimeout(tiltTimer);
      if (munchTimer) window.clearTimeout(munchTimer);
    };
  }, [heldItem, consumptionId]);

  // Reset visual state when item clears
  useEffect(() => {
    if (!heldItem) {
      setActiveConsumeKey(null);
      setDrinkTilt(false);
      setEatMunch(false);
    }
  }, [heldItem]);

  // --- Geometry for overlays ---
  // Hat anchor: head crown center ~ col 12, row 0. We just use the overlay's
  // own offsetX/offsetY relative to the sprite top-left.
  const renderOverlay = (
    overlay: OverlayDef,
    keyPrefix: string,
  ): JSX.Element => {
    const ow = overlay.width * effectiveScale;
    const oh = overlay.height * effectiveScale;
    return (
      <div
        key={keyPrefix}
        className="pointer-events-none absolute"
        style={{
          left: overlay.offsetX * effectiveScale,
          top: overlay.offsetY * effectiveScale,
          width: ow,
          height: oh,
        }}
      >
        <Sprite
          def={{
            id: keyPrefix,
            width: overlay.width,
            height: overlay.height,
            palette: overlay.palette,
            rows: overlay.rows,
          }}
          scale={effectiveScale}
        />
      </div>
    );
  };

  const hatOverlay =
    hatType !== 'none' ? HAT_OVERLAYS[hatType] : null;
  const gogglesOverlay =
    gogglesType !== 'none' ? GOGGLES_OVERLAYS[gogglesType] : null;

  // --- Held item rendering ---
  // Hand anchor: right side of torso, around row 17 (~mid-body), col ~19.
  // In sprite units. The handheld sprite is 10w x 14h, so we anchor its
  // top-left at (col 17, row 14) so the item sits at hand height.
  const HAND_OFFSET_X_PX = 17 * effectiveScale;
  const HAND_OFFSET_Y_PX = 14 * effectiveScale;
  // For 'eat' action while munching, we override the position to be at mouth
  // (col 8-12, row 10-11) so the snack overlay appears in front of the face.
  const MOUTH_OFFSET_X_PX = 7 * effectiveScale;
  const MOUTH_OFFSET_Y_PX = 7 * effectiveScale;

  const isEating = !!heldItem && eatMunch && heldItem.action === 'eat';
  const handX = isEating ? MOUTH_OFFSET_X_PX : HAND_OFFSET_X_PX;
  const handY = isEating ? MOUTH_OFFSET_Y_PX : HAND_OFFSET_Y_PX;

  // Tilt animation transform for the entire flipped character group.
  // Drink: ~5deg tilt back (negative on the right-facing axis); flip-safe by
  // applying rotate INSIDE the scaleX so it visually leans backward regardless.
  const characterTilt = drinkTilt ? -5 : 0;

  return (
    <>
      {/* Soft drop shadow ellipse under the character */}
      <div
        aria-hidden
        className="pointer-events-none absolute"
        style={{
          left: x - (w * 0.64) / 2,
          top: screenY + h - 6,
          width: w * 0.64,
          height: 10 * persp,
          background:
            'radial-gradient(closest-side, rgba(0,0,0,0.55), transparent 80%)',
          filter: 'blur(2px)',
          zIndex: charZIndex - 1,
        }}
      />

      {/* === Floating "+1 MUNCH/SIP" popups (above head, world-space) === */}
      <AnimatePresence>
        {popups.map((p) => (
          <motion.div
            key={p.id}
            className="pointer-events-none absolute font-pixel text-[10px] tracking-widest"
            style={{
              left: x - 40,
              top: screenY - 14,
              width: 80,
              textAlign: 'center',
              color: '#ffe600',
              textShadow:
                '0 0 4px #ffe600, 0 0 10px rgba(255,230,0,0.6), 0 2px 0 #050009',
              zIndex: charZIndex + 5,
            }}
            initial={{ opacity: 0, y: 0 }}
            animate={{ opacity: 1, y: -14 }}
            exit={{ opacity: 0, y: -22 }}
            transition={{ duration: 1, ease: 'easeOut' }}
          >
            {p.text}
          </motion.div>
        ))}
      </AnimatePresence>

      {/* === Character + overlays — all transformed together === */}
      <div
        aria-label="Player character"
        role="img"
        className="pointer-events-none absolute"
        style={{
          left: x - w / 2,
          top: screenY,
          width: w,
          height: h,
          // scaleX(-1) flips horizontally for left-facing direction.
          // Rotate applied via a nested wrapper so flipping doesn't invert
          // the tilt visually.
          transform: facing === 'left' ? 'scaleX(-1)' : undefined,
          transformOrigin: 'center bottom',
          filter:
            'drop-shadow(0 4px 4px rgba(0,0,0,0.7)) drop-shadow(0 0 6px rgba(255,44,159,0.25))',
          zIndex: charZIndex,
        }}
      >
        <div
          className="absolute inset-0"
          style={{
            transform: `rotate(${characterTilt}deg)`,
            transformOrigin: '50% 100%',
            transition: reduced
              ? undefined
              : 'transform 240ms cubic-bezier(.4,.0,.2,1)',
          }}
        >
          {/* Base character sprite */}
          <Sprite def={def} scale={effectiveScale} />

          {/* Goggles (drawn before hat so hat can cover the top edge cleanly) */}
          {gogglesOverlay
            ? renderOverlay(gogglesOverlay, `goggles-${gogglesType}`)
            : null}

          {/* Hat */}
          {hatOverlay ? renderOverlay(hatOverlay, `hat-${hatType}`) : null}

          {/* Held item — drawn LAST so it sits on top */}
          {heldItem ? (
            <div
              className="pointer-events-none absolute"
              style={{
                left: handX,
                top: handY,
                width: heldItem.spriteHandheld.width * effectiveScale,
                height: heldItem.spriteHandheld.height * effectiveScale,
                transform: eatMunch ? 'scale(1.15)' : 'scale(1)',
                transformOrigin: 'center center',
                transition: reduced
                  ? undefined
                  : 'transform 220ms ease-in-out',
              }}
              // The consume key is used to remount when same item is consumed
              // again — ensures the scale pulse retriggers.
              key={activeConsumeKey ?? heldItem.id}
            >
              <Sprite
                def={heldItem.spriteHandheld}
                scale={effectiveScale}
              />
            </div>
          ) : null}
        </div>
      </div>
    </>
  );
}

// ===========================================================================
// Re-exported helpers — used by AvatarCustomizationModal to render a static
// preview of the character with current appearance.
// ===========================================================================

export interface CharacterPreviewProps {
  scale?: number;
  hoodieColor: HoodieColor;
  hatType: HatType;
  gogglesType: GogglesType;
  /** When true, runs the 1.4s idle bob. */
  animated?: boolean;
}

/** Renders a static (or gently-bobbing) preview of the character with the
 *  given appearance. Used by AvatarCustomizationModal. Inline-positioned
 *  (no absolute), so it fits in flex layouts. */
export function CharacterPreview({
  scale = 6,
  hoodieColor,
  hatType,
  gogglesType,
  animated = true,
}: CharacterPreviewProps) {
  const def = useMemo<SpriteDef>(
    () => buildSprite('preview', FRAME_A, hoodieColor),
    [hoodieColor],
  );
  const [bob, setBob] = useState(0);

  useEffect(() => {
    if (!animated) return;
    const id = window.setInterval(() => {
      setBob((b) => (b === 0 ? 1 : 0));
    }, 700);
    return () => window.clearInterval(id);
  }, [animated]);

  const w = def.width * scale;
  const h = def.height * scale;
  const hatOverlay =
    hatType !== 'none' ? HAT_OVERLAYS[hatType] : null;
  const gogglesOverlay =
    gogglesType !== 'none' ? GOGGLES_OVERLAYS[gogglesType] : null;

  return (
    <div
      className="relative"
      style={{
        width: w,
        height: h,
        transform: `translateY(${animated ? -bob * scale : 0}px)`,
        transition: animated ? 'transform 240ms ease-in-out' : undefined,
        filter:
          'drop-shadow(0 6px 8px rgba(0,0,0,0.7)) drop-shadow(0 0 14px rgba(0,240,255,0.35))',
      }}
    >
      <Sprite def={def} scale={scale} />
      {gogglesOverlay ? (
        <div
          className="pointer-events-none absolute"
          style={{
            left: gogglesOverlay.offsetX * scale,
            top: gogglesOverlay.offsetY * scale,
            width: gogglesOverlay.width * scale,
            height: gogglesOverlay.height * scale,
          }}
        >
          <Sprite
            def={{
              id: `preview-goggles-${gogglesType}`,
              width: gogglesOverlay.width,
              height: gogglesOverlay.height,
              palette: gogglesOverlay.palette,
              rows: gogglesOverlay.rows,
            }}
            scale={scale}
          />
        </div>
      ) : null}
      {hatOverlay ? (
        <div
          className="pointer-events-none absolute"
          style={{
            left: hatOverlay.offsetX * scale,
            top: hatOverlay.offsetY * scale,
            width: hatOverlay.width * scale,
            height: hatOverlay.height * scale,
          }}
        >
          <Sprite
            def={{
              id: `preview-hat-${hatType}`,
              width: hatOverlay.width,
              height: hatOverlay.height,
              palette: hatOverlay.palette,
              rows: hatOverlay.rows,
            }}
            scale={scale}
          />
        </div>
      ) : null}
    </div>
  );
}

// Export the overlay maps for any other UI that wants tiny swatch previews.
export { HAT_OVERLAYS, GOGGLES_OVERLAYS, HOODIE_HEX };

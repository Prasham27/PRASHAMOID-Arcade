'use client';

import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import type { SpriteDef } from '@/lib/sprites';
import { Sprite } from '@/components/icons/Sprite';

/** Hooded pixel figure — 24w x 32h. Two-frame walk cycle.
 *  Palette key:
 *   .  transparent
 *   K  ink outline / shadow
 *   H  hood / hoodie body (dark purple)
 *   D  hood deep-shadow
 *   C  cyan trim
 *   P  pink accent strip
 *   S  skin (face)
 *   F  face shadow
 *   E  eye dark
 *   N  pants (near-black violet)
 *   B  belt
 *   Y  belt buckle
 *   W  shoes (off-white)
 */
const PALETTE = {
  '.': 'transparent',
  K: '#0b0014',
  H: '#3d1c66',
  D: '#22093f',
  C: '#00f0ff',
  P: '#ff2c9f',
  S: '#f1c9a5',
  F: '#c79680',
  E: '#0b0014',
  N: '#14001f',
  B: '#5a2c8a',
  Y: '#ffe600',
  W: '#f5e8ff',
} as const;

// Shared rows for head + torso (24 wide, 18 tall)
const HEAD_AND_TORSO: string[] = [
  '........KKKKKKKK........', // 0  hood crown
  '......KKHHHHHHHHKK......', // 1
  '.....KHHHHHHHHHHHHK.....', // 2
  '....KHHHDDDDDDDDHHHK....', // 3
  '....KHHDSSSSSSSSDHHK....', // 4  hood opening / face top
  '...KHHDSSSSSSSSSSDHHK...', // 5
  '...KHHDSFFEEFFEEFSDHHK..', // 6  eyes row
  '...KHHDSSSSSSSSSSDHHK...', // 7
  '...KHHDDSSSSSSSSDDHHK...', // 8  jaw
  '....KHHDDDDDDDDDHHHK....', // 9  neck
  '....KHHHHHHHHHHHHHK.....', // 10
  '...KHHHHHHHCCHHHHHHK....', // 11  shoulders + cyan trim collar
  '..KHHHCHHHHCCHHHHCHHK...', // 12  hoodie body, cyan strap
  '..KHHHCHHHHCCHHHHCHHK...', // 13
  '..KHHHCHHHHCCHHHHCHHK...', // 14
  '..KHHHCHHHHPPHHHHCHHK...', // 15  pink pocket
  '..KHHHHHHHHPPHHHHHHHK...', // 16
  '..KHHHHHBBBBBBBBHHHHK...', // 17  belt
];

// Frame A — standing / step 1 (legs vertical)
const FRAME_A: string[] = [
  ...HEAD_AND_TORSO,
  '..KHHHHHBYYYYYBBHHHHK...', // 18  belt buckle
  '..KHHHHHHHHHHHHHHHHHK...', // 19  bottom of hoodie hem
  '...KNNNNN....NNNNNK.....', // 20  pants start
  '...KNNNNN....NNNNNK.....', // 21
  '...KNNNNN....NNNNNK.....', // 22
  '...KNNNNN....NNNNNK.....', // 23
  '...KNNNNN....NNNNNK.....', // 24
  '...KNNNNN....NNNNNK.....', // 25
  '...KNNNNN....NNNNNK.....', // 26
  '...KNNNNN....NNNNNK.....', // 27
  '..KWWWWWWK..KWWWWWWK....', // 28  shoes
  '..KWWWWWWK..KWWWWWWK....', // 29
  '..KKKKKKKK..KKKKKKKK....', // 30  shoe outline
  '........................', // 31
];

// Frame B — mid-step (one leg forward)
const FRAME_B: string[] = [
  ...HEAD_AND_TORSO,
  '..KHHHHHBYYYYYBBHHHHK...', // 18  belt buckle
  '..KHHHHHHHHHHHHHHHHHK...', // 19
  '...KNNNNN....NNNNNK.....', // 20
  '...KNNNNN....NNNNNK.....', // 21
  '...KNNNNN....NNNNNK.....', // 22
  '....KNNNN....NNNNNK.....', // 23  rear leg lifts (chars shift)
  '....KNNNN.....NNNNK.....', // 24
  '.....KNNN......NNNK.....', // 25
  '.....KNNN......NNNK.....', // 26
  '.....KNNN.......NNK.....', // 27
  '...KWWWWWWK..KWWWWWWK...', // 28  shoes
  '...KWWWWWWK..KWWWWWWK...', // 29
  '...KKKKKKKK..KKKKKKKK...', // 30
  '........................', // 31
];

const SPRITE_A: SpriteDef = {
  id: 'char_a',
  width: 24,
  height: 32,
  palette: PALETTE,
  rows: FRAME_A,
};
const SPRITE_B: SpriteDef = {
  id: 'char_b',
  width: 24,
  height: 32,
  palette: PALETTE,
  rows: FRAME_B,
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

// Depth movement. z is normalized 0..1 but conceptually maps to ~400px of
// screen-y travel, so vz limits feel comparable to x speeds.
const Z_TRAVEL_PX = 400; // visual screen-y span of full z=0..1 traversal
const SPEED_VZ_PX = 180; // px-per-sec of screen-y travel along z
const SPEED_Z = SPEED_VZ_PX / Z_TRAVEL_PX; // → z-units / sec
const ACCEL_Z = 1100 / Z_TRAVEL_PX;
const FRICTION_Z = 900 / Z_TRAVEL_PX;

const ARRIVAL_X = 4;
const ARRIVAL_Z = 0.012; // ~4.8 px at Z_TRAVEL_PX=400

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

      // X axis dynamics
      if (dirX !== 0) {
        vx += dirX * ACCEL_X * dt;
        if (vx > SPEED_X) vx = SPEED_X;
        if (vx < -SPEED_X) vx = -SPEED_X;
        setFacing(dirX > 0 ? 'right' : 'left');
      } else {
        if (vx > 0) vx = Math.max(0, vx - FRICTION_X * dt);
        else if (vx < 0) vx = Math.min(0, vx + FRICTION_X * dt);
      }

      // Z axis dynamics (slightly weightier)
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

      // Walk-cycle frame swap — driven by combined planar speed
      const planarSpeed = Math.hypot(vx, vz * Z_TRAVEL_PX);
      if (!reduced && planarSpeed > 20) {
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

  const def = frame === 0 ? SPRITE_A : SPRITE_B;
  // Perspective scale: backScaleFactor at z=0, scale at z=1
  const persp = lerp(backScaleFactor, 1, z);
  const effectiveScale = scale * persp;
  const w = def.width * effectiveScale;
  const h = def.height * effectiveScale;
  const screenY = lerp(backY, frontY, z) - h; // foot rests at the projected y
  // z-order: deeper into scene → smaller zIndex; near viewer → larger.
  // Range chosen so the character sits BEHIND back-wall cabinets (z-index 20)
  // when at the back of the room (z=0), in front of them when stepping
  // forward to interact (standZ≈0.14), and clearly in front of mid-floor
  // props when near the viewer (z=1).
  const charZIndex = 19 + Math.round(z * 16); // 19 (back) → 35 (front)

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
      <div
        aria-label="Player character"
        role="img"
        className="pointer-events-none absolute"
        style={{
          left: x - w / 2,
          top: screenY,
          width: w,
          height: h,
          transform: facing === 'left' ? 'scaleX(-1)' : undefined,
          transformOrigin: 'center',
          filter:
            'drop-shadow(0 4px 4px rgba(0,0,0,0.7)) drop-shadow(0 0 6px rgba(255,44,159,0.25))',
          zIndex: charZIndex,
        }}
      >
        <Sprite def={def} scale={effectiveScale} />
      </div>
    </>
  );
});

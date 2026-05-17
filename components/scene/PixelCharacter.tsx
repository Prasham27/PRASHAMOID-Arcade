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
  /** Walk to a target world-x; returns once arrived. */
  walkTo: (targetX: number) => Promise<void>;
  getX: () => number;
}

export interface PixelCharacterProps {
  /** Initial world-x in scene coordinates. */
  initialX: number;
  /** Y position (top-left of sprite in scene coordinates). */
  y: number;
  /** Scene min/max bounds for horizontal movement. */
  minX: number;
  maxX: number;
  /** Sprite scale (pixel cell size). */
  scale?: number;
  /** Whether arrow keys/WASD should drive the character. */
  inputEnabled?: boolean;
  /** Notified each frame with the current x. Used for proximity highlight. */
  onPositionChange?: (x: number) => void;
  /** Reduced motion → use static frame, no walk cycle. */
  reduced?: boolean;
}

const SPEED = 240; // px / sec
const ACCEL = 1400;
const FRICTION = 1100;

export const PixelCharacter = forwardRef<
  PixelCharacterHandle,
  PixelCharacterProps
>(function PixelCharacter(
  {
    initialX,
    y,
    minX,
    maxX,
    scale = 3,
    inputEnabled = true,
    onPositionChange,
    reduced = false,
  },
  ref,
) {
  const [x, setX] = useState(initialX);
  const [frame, setFrame] = useState<0 | 1>(0);
  const [facing, setFacing] = useState<'left' | 'right'>('right');
  const xRef = useRef(initialX);
  const vRef = useRef(0);
  const targetRef = useRef<{ x: number; resolve: () => void } | null>(null);
  const inputRef = useRef<{ left: boolean; right: boolean }>({
    left: false,
    right: false,
  });
  const lastFrameAt = useRef(0);
  const rafRef = useRef<number | null>(null);

  useImperativeHandle(ref, () => ({
    walkTo(targetX: number) {
      const clamped = Math.max(minX, Math.min(maxX, targetX));
      return new Promise<void>((resolve) => {
        if (targetRef.current) targetRef.current.resolve();
        targetRef.current = { x: clamped, resolve };
      });
    },
    getX: () => xRef.current,
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
    const down = (e: KeyboardEvent) => {
      if (isTypingTarget(e.target)) return;
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        inputRef.current.left = true;
        targetRef.current?.resolve();
        targetRef.current = null;
      } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        inputRef.current.right = true;
        targetRef.current?.resolve();
        targetRef.current = null;
      }
    };
    const up = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A')
        inputRef.current.left = false;
      else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D')
        inputRef.current.right = false;
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
      let v = vRef.current;
      const inp = inputRef.current;
      const tgt = targetRef.current;

      let dir = 0;
      if (tgt) {
        const delta = tgt.x - xRef.current;
        if (Math.abs(delta) < 3) {
          xRef.current = tgt.x;
          v = 0;
          const r = tgt.resolve;
          targetRef.current = null;
          r();
        } else {
          dir = delta > 0 ? 1 : -1;
        }
      } else {
        if (inp.left && !inp.right) dir = -1;
        else if (inp.right && !inp.left) dir = 1;
      }

      if (dir !== 0) {
        v += dir * ACCEL * dt;
        if (v > SPEED) v = SPEED;
        if (v < -SPEED) v = -SPEED;
        setFacing(dir > 0 ? 'right' : 'left');
      } else {
        if (v > 0) v = Math.max(0, v - FRICTION * dt);
        else if (v < 0) v = Math.min(0, v + FRICTION * dt);
      }
      vRef.current = v;

      let nx = xRef.current + v * dt;
      if (nx < minX) {
        nx = minX;
        v = 0;
        vRef.current = 0;
      } else if (nx > maxX) {
        nx = maxX;
        v = 0;
        vRef.current = 0;
      }
      xRef.current = nx;
      setX(nx);
      onPositionChange?.(nx);

      if (!reduced && Math.abs(v) > 20) {
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
  }, [minX, maxX, reduced]);

  const def = frame === 0 ? SPRITE_A : SPRITE_B;
  const w = def.width * scale;
  const h = def.height * scale;

  return (
    <>
      {/* Soft drop shadow ellipse under the character */}
      <div
        aria-hidden
        className="pointer-events-none absolute z-20"
        style={{
          left: x - w / 2 + w * 0.18,
          top: y + h - 6,
          width: w * 0.64,
          height: 10,
          background:
            'radial-gradient(closest-side, rgba(0,0,0,0.55), transparent 80%)',
          filter: 'blur(2px)',
        }}
      />
      <div
        aria-label="Player character"
        role="img"
        className="pointer-events-none absolute z-30"
        style={{
          left: x - w / 2,
          top: y,
          width: w,
          height: h,
          transform: facing === 'left' ? 'scaleX(-1)' : undefined,
          transformOrigin: 'center',
          filter:
            'drop-shadow(0 4px 4px rgba(0,0,0,0.7)) drop-shadow(0 0 6px rgba(255,44,159,0.25))',
        }}
      >
        <Sprite def={def} scale={scale} />
      </div>
    </>
  );
});

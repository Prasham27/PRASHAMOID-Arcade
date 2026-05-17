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

/** Hooded pixel figure — 16w x 24h. Two-frame walk cycle. */
const PALETTE = {
  '.': 'transparent',
  K: '#0b0014', // shadow / outline
  H: '#361052', // hood
  P: '#ff2c9f', // hood trim accent
  F: '#c7a8e8', // face shadow
  W: '#f5e8ff', // face highlight
  Y: '#ffe600', // belt/coin
  B: '#14001f', // boots
  C: '#00f0ff', // cyan trim
} as const;

const COMMON_HEAD = [
  '....HHHHHHHH....',
  '...HKKKKKKKKH...',
  '..HKHHHHHHHHHK..',
  '..HKHFFFFFFFHK..',
  '..HKHFWWFWWFHK..',
  '..HKHFFFFFFFHK..',
  '..HKHHHHHHHHHK..',
  '..HKKHHHHHHKKH..',
  '...HHHHHHHHHH...',
  '....KCCCCCCK....',
  '....KCYYCYCK....',
  '....KCCCCCCK....',
  '...HKKKKKKKKH...',
];

const FRAME_A: string[] = [
  ...COMMON_HEAD,
  '...HHHHHHHHHH...',
  '...HHHHHHHHHH...',
  '...HH......HH...',
  '...HH......HH...',
  '...HH......HH...',
  '...BB......BB...',
  '..BBBB....BBBB..',
  '..BBBB....BBBB..',
  '................',
  '................',
];

const FRAME_B: string[] = [
  ...COMMON_HEAD,
  '...HHHHHHHHHH...',
  '...HHHHHHHHHH...',
  '....HH....HH....',
  '....HH....HH....',
  '...HH......HH...',
  '...BB......BB...',
  '..BBBB......BB..',
  '..BBBB.....BBB..',
  '................',
  '................',
];

const SPRITE_A: SpriteDef = {
  id: 'char_a',
  width: 16,
  height: 24,
  palette: PALETTE,
  rows: FRAME_A,
};
const SPRITE_B: SpriteDef = {
  id: 'char_b',
  width: 16,
  height: 24,
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

const SPEED = 220; // px / sec
const ACCEL = 1200;
const FRICTION = 1000;

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
  const vRef = useRef(0); // velocity px/s
  const targetRef = useRef<{ x: number; resolve: () => void } | null>(null);
  const inputRef = useRef<{ left: boolean; right: boolean }>({
    left: false,
    right: false,
  });
  const lastFrameAt = useRef(0);
  const rafRef = useRef<number | null>(null);

  // Imperative API
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

  // Keyboard input → only if inputEnabled and not focused on a field
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

  // Main loop — RAF integration of velocity
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
        // friction
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

      // walk cycle
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
        filter: 'drop-shadow(0 6px 8px rgba(0,0,0,0.65))',
      }}
    >
      <Sprite def={def} scale={scale} />
    </div>
  );
});

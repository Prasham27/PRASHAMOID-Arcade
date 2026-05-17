'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import type { SpriteDef } from '@/lib/sprites';
import { Sprite } from '@/components/icons/Sprite';

/** Pixel-art beagle pet that lags behind the player.
 *
 *  18x14 grid, side-view. Palette:
 *   .  transparent
 *   K  ink outline / nose / eye dot (black #000)
 *   W  white body (#f0e8dc)
 *   B  brown patch — main (#8b5a2b)
 *   D  brown — darker shadow / ear edge (#5a3a1d)
 *   P  pink tongue (#ff8aa8)
 */

type PaletteMap = Record<string, string>;

const BEAGLE_PALETTE: PaletteMap = {
  '.': 'transparent',
  K: '#000000',
  W: '#f0e8dc',
  B: '#8b5a2b',
  D: '#5a3a1d',
  P: '#ff8aa8',
};

const SPRITE_W = 18;
const SPRITE_H = 14;

/* Coordinate notes (18 wide × 14 tall):
 *   rows 0..5  → upper body / head / back (with ear + tail above)
 *   rows 6..10 → lower body + legs
 *   rows 11..13 → ground row (legs end, mostly transparent)
 *
 * Beagle faces RIGHT by default: head on the right, tail on the left.
 * The wrapper flips with scaleX(-1) when facing left.
 */

// Frame A — legs paired (standing / mid-stride home position)
const FRAME_A: string[] = [
  '..................', // 0
  '..K...............', // 1  tail tip up
  '.KBK....KKKKK.....', // 2  tail body + head top
  '.KBBK..KBBBBBK....', // 3  tail + head/back outline
  '.KBBBKKBBBBBBBK...', // 4  back curve + brown head patch
  '.KWWWBBBBBWWWBK...', // 5  body white + ear (D = darker brown ear)
  '.KWWWWWWWWWDWBKK..', // 6  belly + ear hangs down + snout starts
  '..KWWWWWWWWDWWKK..', // 7  underbelly + ear bottom + snout tip
  '..KWWWWWWWWKKK....', // 8  snout end (K = nose)
  '..KKKWWKKKK.......', // 9  legs split
  '..KWKWWKWWK.......', // 10 legs middle
  '..KWKWWKWWK.......', // 11 legs lower
  '..KKKWWKKKK.......', // 12 paws (ink at base)
  '..................', // 13
];

// Frame B — back leg lifted forward, tail flicks down 1px
const FRAME_B: string[] = [
  '..................', // 0
  '..................', // 1  (tail dropped 1px → no tip here)
  '..K.....KKKKK.....', // 2  tail tip (1px lower than A)
  '.KBK...KBBBBBK....', // 3
  '.KBBK.KBBBBBBBK...', // 4
  '.KBBBBBBBBWWWBK...', // 5
  '.KWWWWWWWWWDWBKK..', // 6
  '..KWWWWWWWWDWWKK..', // 7
  '..KWWWWWWWWKKK....', // 8
  '...KKWWKKKWW......', // 9  front leg planted, back leg lifts
  '...KWWKWWKWW......', // 10
  '...KWWKWWKKK......', // 11
  '...KKKKKKK........', // 12
  '..................', // 13
];

function buildBeagleSprite(id: string, rows: string[]): SpriteDef {
  return {
    id,
    width: SPRITE_W,
    height: SPRITE_H,
    palette: BEAGLE_PALETTE,
    rows,
  };
}

export interface PixelBeagleProps {
  /** Target X to follow — typically the character's current x. */
  targetX: number;
  /** Target Z to follow — character's depth so the beagle gets the
   *  same perspective scale. */
  targetZ: number;
  /** Scene's back-y / front-y for perspective projection (same model
   *  as PixelCharacter). */
  backY: number;
  frontY: number;
  /** Base scale (matches PixelCharacter's scale, default 3). */
  scale?: number;
  /** Reduced motion — disable walk cycle, hold idle frame. */
  reduced?: boolean;
  /** Horizontal lag distance behind the character, in pixels (default 50). */
  lagPx?: number;
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

/** Pet beagle that trails the player with smooth lerping. */
export function PixelBeagle({
  targetX,
  targetZ,
  backY,
  frontY,
  scale = 3,
  reduced = false,
  lagPx = 50,
}: PixelBeagleProps) {
  // === Position state ===
  const initialFacing: 1 | -1 = 1;
  const xRef = useRef<number>(targetX - lagPx * initialFacing);
  const zRef = useRef<number>(targetZ);
  const facingRef = useRef<1 | -1>(initialFacing);
  const lastTargetXRef = useRef<number>(targetX);
  const targetXRef = useRef<number>(targetX);
  const targetZRef = useRef<number>(targetZ);
  const rafRef = useRef<number | null>(null);

  // === Render state ===
  const [x, setX] = useState<number>(xRef.current);
  const [z, setZ] = useState<number>(zRef.current);
  const [facing, setFacing] = useState<'left' | 'right'>('right');
  const [frame, setFrame] = useState<0 | 1>(0);
  const lastFrameAt = useRef<number>(0);

  // Keep refs synced with prop changes (driven by parent each frame).
  useEffect(() => {
    // Update target refs, and detect facing direction from x deltas.
    const prev = lastTargetXRef.current;
    const dx = targetX - prev;
    if (Math.abs(dx) > 0.5) {
      const newFacing: 1 | -1 = dx > 0 ? 1 : -1;
      if (newFacing !== facingRef.current) {
        facingRef.current = newFacing;
        setFacing(newFacing === 1 ? 'right' : 'left');
      }
    }
    lastTargetXRef.current = targetX;
    targetXRef.current = targetX;
    targetZRef.current = targetZ;
  }, [targetX, targetZ]);

  // RAF loop — lerp current toward (targetX - lag*facing, targetZ).
  useEffect(() => {
    let last = performance.now();
    const tick = (t: number) => {
      const dt = Math.min(0.05, (t - last) / 1000);
      last = t;

      const facingDir = facingRef.current;
      const desiredX = targetXRef.current - lagPx * facingDir;
      const desiredZ = targetZRef.current;

      // Lerp rates: 6/s for x, 3/s for z. dt-correct exponential approach.
      const xRate = 1 - Math.exp(-6 * dt);
      const zRate = 1 - Math.exp(-3 * dt);
      const newX = lerp(xRef.current, desiredX, xRate);
      const newZ = lerp(zRef.current, desiredZ, zRate);

      const vxApprox = (newX - xRef.current) / Math.max(dt, 0.001);
      const vzApproxPx = ((newZ - zRef.current) * (frontY - backY)) /
        Math.max(dt, 0.001);
      const planarSpeed = Math.hypot(vxApprox, vzApproxPx);

      xRef.current = newX;
      zRef.current = newZ;
      setX(newX);
      setZ(newZ);

      // Walk-cycle toggle when moving meaningfully.
      if (!reduced && planarSpeed > 20) {
        if (t - lastFrameAt.current > 160) {
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
  }, [lagPx, reduced, backY, frontY]);

  // === Sprites ===
  const spriteA = useMemo<SpriteDef>(
    () => buildBeagleSprite('beagle_a', FRAME_A),
    [],
  );
  const spriteB = useMemo<SpriteDef>(
    () => buildBeagleSprite('beagle_b', FRAME_B),
    [],
  );
  const def = frame === 0 || reduced ? spriteA : spriteB;

  // === Perspective + screen positioning (same model as PixelCharacter) ===
  const persp = lerp(0.62, 1.0, z);
  const effectiveScale = scale * persp;
  const w = def.width * effectiveScale;
  const h = def.height * effectiveScale;
  // Render slightly forward of the character so it doesn't visually overlap.
  const forwardZBias = 0.02;
  const renderZ = Math.min(1, z + forwardZBias);
  const screenY = lerp(backY, frontY, renderZ) - h;
  // Side offset so the beagle doesn't sit directly under the player's feet.
  const sideOffsetPx = 6 * effectiveScale * facingRef.current;
  const screenX = x - w / 2 - sideOffsetPx;

  // Z-index follows depth so the beagle layers like the character.
  const beagleZIndex = 19 + Math.round(z * 16);

  return (
    <>
      {/* Drop shadow — small ellipse scaled with perspective */}
      <div
        aria-hidden
        className="pointer-events-none absolute"
        style={{
          left: screenX + (w - w * 0.55) / 2,
          top: screenY + h - 4,
          width: w * 0.55,
          height: 6 * persp,
          background:
            'radial-gradient(closest-side, rgba(0,0,0,0.5), transparent 80%)',
          filter: 'blur(2px)',
          zIndex: beagleZIndex - 1,
        }}
      />
      <div
        aria-label="Pet beagle"
        role="img"
        className="pointer-events-none absolute"
        style={{
          left: screenX,
          top: screenY,
          width: w,
          height: h,
          transform: facing === 'left' ? 'scaleX(-1)' : undefined,
          transformOrigin: 'center bottom',
          filter:
            'drop-shadow(0 3px 3px rgba(0,0,0,0.55)) drop-shadow(0 0 4px rgba(139,90,43,0.25))',
          zIndex: beagleZIndex,
        }}
      >
        <Sprite def={def} scale={effectiveScale} />
      </div>
    </>
  );
}

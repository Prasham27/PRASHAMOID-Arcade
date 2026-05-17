export interface PinballMachineProps {
  /** World-x of the machine's left edge. */
  x: number;
  /** World-y of the machine's top edge. */
  y: number;
}

/** Tall, narrow pinball machine — decorative only.
 *  ~130px wide, ~260px tall. Back-glass, slanted playfield with bumpers,
 *  flippers, coin slot. No click, no [E] prompt, no walk-to.
 */
export function PinballMachine({ x, y }: PinballMachineProps) {
  const W = 130;
  const H = 260;
  const PINK = '#ff2c9f';
  const CYAN = '#00f0ff';
  const RED = '#ff3344';

  return (
    <div
      className="absolute"
      style={{ left: x, top: y, width: W, height: H, zIndex: 16 }}
      aria-hidden
    >
      {/* Halo */}
      <div
        className="pointer-events-none absolute"
        style={{
          left: -16,
          top: -8,
          width: W + 32,
          height: H + 16,
          background:
            'radial-gradient(ellipse at center, rgba(255,44,159,0.18) 0%, transparent 70%)',
          filter: 'blur(6px)',
          zIndex: -1,
        }}
      />

      {/* === Cabinet outer body === */}
      <div
        className="relative h-full w-full"
        style={{
          background:
            'linear-gradient(180deg, #1c0e30 0%, #14072a 50%, #07000f 100%)',
          border: '2px solid #050009',
          boxShadow: [
            '0 8px 14px rgba(0,0,0,0.85)',
            'inset 2px 2px 0 rgba(255,255,255,0.08)',
            'inset -2px -2px 0 rgba(0,0,0,0.7)',
            `0 0 16px ${PINK}33`,
          ].join(', '),
        }}
      >
        {/* === Back-glass (top vertical panel) === */}
        <div
          className="absolute left-2 right-2 overflow-hidden border-2"
          style={{
            top: 4,
            height: 78,
            borderColor: '#050009',
            background:
              'linear-gradient(180deg, #04000a 0%, #1a0030 60%, #04000a 100%)',
            boxShadow: [
              'inset 0 0 14px 4px rgba(0,0,0,0.85)',
              `inset 0 0 16px ${RED}22`,
            ].join(', '),
          }}
        >
          {/* TILT! pixel text */}
          <div
            className="absolute left-0 right-0 text-center font-pixel uppercase tracking-widest"
            style={{
              top: 14,
              fontSize: 18,
              color: RED,
              textShadow: `0 0 6px ${RED}, 0 0 16px ${RED}aa`,
              letterSpacing: '0.18em',
            }}
          >
            TILT!
          </div>
          <div
            className="absolute left-0 right-0 text-center font-pixel uppercase tracking-widest"
            style={{
              top: 40,
              fontSize: 7,
              color: CYAN,
              textShadow: `0 0 4px ${CYAN}`,
            }}
          >
            HIGH SCORE
          </div>
          <div
            className="absolute left-0 right-0 text-center font-pixel"
            style={{
              top: 52,
              fontSize: 12,
              color: '#ffe600',
              textShadow: '0 0 4px #ffe600, 0 0 10px #ffe600aa',
              letterSpacing: '0.1em',
            }}
          >
            042000
          </div>

          {/* Scanlines */}
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              backgroundImage:
                'repeating-linear-gradient(0deg, rgba(0,0,0,0.32) 0 1px, transparent 1px 3px)',
            }}
          />
          {/* Glass reflection */}
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                'linear-gradient(135deg, rgba(255,255,255,0.08) 0%, transparent 50%)',
            }}
          />
        </div>

        {/* === Side accent stripes (pink + cyan chevrons) === */}
        <div
          className="absolute"
          style={{
            left: 0,
            top: 86,
            bottom: 50,
            width: 3,
            background: `repeating-linear-gradient(180deg, ${PINK} 0 4px, transparent 4px 8px)`,
            opacity: 0.65,
          }}
        />
        <div
          className="absolute"
          style={{
            right: 0,
            top: 86,
            bottom: 50,
            width: 3,
            background: `repeating-linear-gradient(180deg, ${CYAN} 0 4px, transparent 4px 8px)`,
            opacity: 0.65,
          }}
        />

        {/* === Slanted playfield (mid-cabinet) === */}
        <div
          className="absolute left-2 right-2 overflow-hidden"
          style={{
            top: 86,
            height: 122,
            background:
              'linear-gradient(180deg, #2a1448 0%, #170828 60%, #0c0218 100%)',
            border: '2px solid #050009',
            // tiny perspective shear so it reads "slanted"
            transform: 'perspective(220px) rotateX(8deg)',
            transformOrigin: 'center top',
            boxShadow:
              'inset 0 4px 12px rgba(0,0,0,0.75), inset 0 -4px 8px rgba(0,0,0,0.6)',
          }}
        >
          {/* Center lane */}
          <div
            className="absolute left-1/2 -translate-x-1/2"
            style={{
              top: 6,
              bottom: 28,
              width: 2,
              background:
                'linear-gradient(180deg, rgba(255,230,0,0.4), rgba(255,230,0,0.1))',
              boxShadow: '0 0 4px rgba(255,230,0,0.5)',
            }}
          />

          {/* Bumpers (3-4 colored circles) */}
          {[
            { left: 22, top: 16, color: PINK },
            { left: 78, top: 14, color: CYAN },
            { left: 50, top: 38, color: '#ffe600' },
            { left: 30, top: 60, color: '#39ff14' },
          ].map((b, i) => (
            <div
              key={`bump-${i}`}
              className="absolute rounded-full"
              style={{
                left: b.left,
                top: b.top,
                width: 10,
                height: 10,
                background: `radial-gradient(circle at 35% 30%, #ffffff, ${b.color} 55%, ${b.color}cc)`,
                boxShadow: `0 0 8px ${b.color}aa, inset 0 -2px 0 rgba(0,0,0,0.4)`,
                border: '1px solid #050009',
              }}
            />
          ))}

          {/* Ball (white pixel) */}
          <div
            className="absolute rounded-full"
            style={{
              left: 64,
              top: 80,
              width: 5,
              height: 5,
              background:
                'radial-gradient(circle at 30% 30%, #ffffff, #c7a8e8 70%)',
              boxShadow: '0 0 6px rgba(245,232,255,0.9)',
            }}
          />

          {/* Flippers (2 angled rectangles at the bottom) */}
          <div
            className="absolute"
            style={{
              left: 26,
              bottom: 14,
              width: 22,
              height: 5,
              background:
                'linear-gradient(180deg, #f5e8ff 0%, #7a5a96 100%)',
              border: '1px solid #050009',
              transform: 'rotate(20deg)',
              transformOrigin: '0% 50%',
              boxShadow: '0 1px 0 rgba(0,0,0,0.5)',
            }}
          />
          <div
            className="absolute"
            style={{
              right: 26,
              bottom: 14,
              width: 22,
              height: 5,
              background:
                'linear-gradient(180deg, #f5e8ff 0%, #7a5a96 100%)',
              border: '1px solid #050009',
              transform: 'rotate(-20deg)',
              transformOrigin: '100% 50%',
              boxShadow: '0 1px 0 rgba(0,0,0,0.5)',
            }}
          />

          {/* Drain gap (the channel below the flippers) */}
          <div
            className="absolute left-1/2 -translate-x-1/2"
            style={{
              bottom: 0,
              width: 16,
              height: 8,
              background:
                'linear-gradient(180deg, #04000a 0%, #000000 100%)',
              border: '1px solid #050009',
            }}
          />

          {/* Scanlines (subtle) */}
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              backgroundImage:
                'repeating-linear-gradient(0deg, rgba(0,0,0,0.2) 0 1px, transparent 1px 3px)',
            }}
          />
        </div>

        {/* === Coin slot + PUSH START === */}
        <div
          className="absolute left-2 right-2 border-2"
          style={{
            top: 212,
            height: 22,
            borderColor: '#050009',
            background:
              'linear-gradient(180deg, #2a1448, #170828 60%, #0c0218 100%)',
            boxShadow:
              'inset 0 1px 0 rgba(255,255,255,0.08), inset 0 -2px 0 rgba(0,0,0,0.7)',
          }}
        >
          <div className="flex h-full w-full items-center justify-between px-2">
            {/* Coin slot */}
            <div className="flex items-center gap-1">
              <div
                className="rounded-sm"
                style={{
                  width: 8,
                  height: 2,
                  background: '#ffe600',
                  boxShadow: '0 0 4px #ffe600',
                }}
              />
              <span
                className="font-pixel tracking-widest"
                style={{ fontSize: 6, color: '#7a5a96' }}
              >
                25¢
              </span>
            </div>
            {/* PUSH START button */}
            <div
              className="flex items-center gap-1 border px-1"
              style={{
                borderColor: PINK,
                background: 'rgba(255,44,159,0.18)',
                boxShadow: `0 0 6px ${PINK}66`,
              }}
            >
              <span
                className="rounded-full"
                style={{
                  width: 5,
                  height: 5,
                  background: `radial-gradient(circle at 35% 30%, #fff, ${PINK} 60%)`,
                  boxShadow: `0 0 4px ${PINK}aa`,
                }}
              />
              <span
                className="font-pixel uppercase tracking-widest"
                style={{
                  fontSize: 6,
                  color: PINK,
                  textShadow: `0 0 3px ${PINK}`,
                }}
              >
                PUSH START
              </span>
            </div>
          </div>
        </div>

        {/* === Base plinth === */}
        <div
          className="absolute inset-x-0"
          style={{
            bottom: 0,
            height: 22,
            background:
              'linear-gradient(180deg, #15082a 0%, #07000f 60%, #000000 100%)',
            borderTop: '2px solid #050009',
            boxShadow:
              'inset 0 2px 0 rgba(255,255,255,0.04), inset 0 -2px 0 rgba(0,0,0,0.7)',
          }}
        />
      </div>
    </div>
  );
}

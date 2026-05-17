'use client';

/** Top-left HUD: PLAYER 1 profile card with avatar, name, LV, XP bar. */
export function PlayerCard() {
  return (
    <div
      className="pointer-events-none fixed left-3 top-16 z-40 hidden md:block"
      style={{ width: 196 }}
    >
      <div
        className="relative border-2 border-pink p-2 font-pixel"
        style={{
          background:
            'linear-gradient(180deg, rgba(28,4,41,0.92) 0%, rgba(11,0,20,0.92) 100%)',
          boxShadow:
            '0 0 14px rgba(255,44,159,0.45), 0 0 32px rgba(255,44,159,0.18), inset 0 0 0 1px rgba(255,44,159,0.25)',
        }}
      >
        {/* Corner ticks for a chunky-pixel border feel */}
        <CornerTicks color="#ff2c9f" />

        <div className="flex items-center gap-2">
          {/* Avatar — glowing P with hoodie silhouette */}
          <div
            className="relative flex items-center justify-center border-2 border-pink"
            style={{
              width: 32,
              height: 32,
              background:
                'radial-gradient(circle at 35% 30%, #3d1c66 0%, #14001f 80%)',
              boxShadow:
                'inset 0 0 8px rgba(255,44,159,0.4), 0 0 8px rgba(255,44,159,0.4)',
            }}
          >
            <span
              className="font-pixel text-base text-pink"
              style={{ textShadow: '0 0 6px #ff2c9f' }}
            >
              P
            </span>
          </div>

          <div className="flex-1">
            <div
              className="text-[8px] tracking-widest text-text-muted"
              style={{ lineHeight: '10px' }}
            >
              PLAYER 1
            </div>
            <div
              className="text-[11px] tracking-widest text-pink"
              style={{
                textShadow: '0 0 4px #ff2c9f, 0 0 10px rgba(255,44,159,0.4)',
                lineHeight: '14px',
              }}
            >
              PRASHAM
            </div>
            <div className="mt-0.5 flex items-center justify-between">
              <span className="text-[8px] tracking-widest text-yellow">
                LV 23
              </span>
              <span className="text-[7px] tracking-widest text-text-muted">
                EXP 8400
              </span>
            </div>
          </div>
        </div>

        {/* XP bar */}
        <div
          className="relative mt-2 border border-pink"
          style={{
            height: 6,
            background: '#04000a',
            boxShadow: 'inset 0 0 4px rgba(0,0,0,0.8)',
          }}
        >
          <div
            className="absolute left-0 top-0 h-full"
            style={{
              width: '78%',
              background:
                'linear-gradient(90deg, #ff2c9f 0%, #ffe600 100%)',
              boxShadow:
                '0 0 6px #ff2c9f, inset 0 -1px 0 rgba(0,0,0,0.4)',
            }}
          />
          {/* XP segment ticks */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              backgroundImage:
                'repeating-linear-gradient(90deg, rgba(0,0,0,0.4) 0 1px, transparent 1px 14px)',
            }}
          />
        </div>
      </div>
    </div>
  );
}

function CornerTicks({ color }: { color: string }) {
  const tick = (
    style: React.CSSProperties,
  ): React.CSSProperties => ({
    position: 'absolute',
    width: 4,
    height: 4,
    background: color,
    boxShadow: `0 0 4px ${color}`,
    ...style,
  });
  return (
    <>
      <span style={tick({ left: -2, top: -2 })} />
      <span style={tick({ right: -2, top: -2 })} />
      <span style={tick({ left: -2, bottom: -2 })} />
      <span style={tick({ right: -2, bottom: -2 })} />
    </>
  );
}

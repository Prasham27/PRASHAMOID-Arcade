'use client';

/** Bottom-left HUD: "NOW PLAYING — 8-BIT DREAMS" with pulsing waveform bars. */
export function NowPlayingCard() {
  return (
    <div
      className="pointer-events-none fixed left-3 bottom-3 z-40 hidden min-[1500px]:block"
      style={{ width: 200 }}
    >
      <style jsx>{`
        @keyframes bar0 {
          0%, 100% { transform: scaleY(0.3); }
          50% { transform: scaleY(1); }
        }
        @keyframes bar1 {
          0%, 100% { transform: scaleY(0.5); }
          40% { transform: scaleY(0.9); }
          80% { transform: scaleY(0.4); }
        }
        @keyframes bar2 {
          0%, 100% { transform: scaleY(0.8); }
          30% { transform: scaleY(0.4); }
          70% { transform: scaleY(1); }
        }
        @keyframes bar3 {
          0%, 100% { transform: scaleY(0.4); }
          50% { transform: scaleY(0.7); }
        }
        @keyframes bar4 {
          0%, 100% { transform: scaleY(0.6); }
          25% { transform: scaleY(1); }
          75% { transform: scaleY(0.3); }
        }
        @media (prefers-reduced-motion: reduce) {
          .wf-bar { animation: none !important; transform: scaleY(0.7); }
        }
      `}</style>

      <div
        className="relative border-2 border-cyan p-2 font-pixel"
        style={{
          background:
            'linear-gradient(180deg, rgba(28,4,41,0.92) 0%, rgba(11,0,20,0.92) 100%)',
          boxShadow:
            '0 0 14px rgba(0,240,255,0.4), 0 0 28px rgba(0,240,255,0.15), inset 0 0 0 1px rgba(0,240,255,0.25)',
        }}
      >
        <CornerTicks color="#00f0ff" />

        <div className="flex items-center gap-2">
          <span
            className="text-[12px] text-cyan animate-pulse"
            style={{ textShadow: '0 0 6px #00f0ff' }}
          >
            ♪
          </span>
          <div className="flex-1">
            <div
              className="text-[8px] tracking-widest text-text-muted"
              style={{ lineHeight: '10px' }}
            >
              NOW PLAYING
            </div>
            <div
              className="text-[10px] tracking-widest text-cyan"
              style={{
                textShadow: '0 0 4px #00f0ff',
                lineHeight: '12px',
              }}
            >
              8-BIT DREAMS
            </div>
          </div>
        </div>

        {/* Waveform bars */}
        <div
          className="mt-2 flex items-end justify-between gap-1"
          style={{ height: 18 }}
        >
          {[0, 1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="wf-bar"
              style={{
                width: 6,
                height: '100%',
                transformOrigin: 'bottom',
                background:
                  'linear-gradient(180deg, #00f0ff 0%, #ff2c9f 100%)',
                boxShadow: '0 0 6px rgba(0,240,255,0.6)',
                animation: `bar${i} ${0.9 + i * 0.15}s ease-in-out infinite`,
              }}
            />
          ))}
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

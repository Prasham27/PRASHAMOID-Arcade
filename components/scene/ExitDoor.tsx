export interface ExitDoorProps {
  /** World-x of the door's left edge. */
  x: number;
  /** World-y of the door's top edge (the sign sits above this). */
  y: number;
}

/** Decorative wooden EXIT door with a red neon "EMERGENCY EXIT" sign above.
 *  Not interactive — pure scenery for the left wing.
 */
export function ExitDoor({ x, y }: ExitDoorProps) {
  const W = 80;
  const H = 240; // door body
  const signH = 22;
  const signW = 96;

  return (
    <div
      className="absolute"
      style={{
        left: x,
        top: y - signH - 6,
        width: Math.max(W, signW),
        height: H + signH + 6,
        zIndex: 14,
      }}
      aria-hidden
    >
      {/* === EMERGENCY EXIT neon sign === */}
      <div
        className="absolute font-pixel uppercase tracking-widest"
        style={{
          left: (Math.max(W, signW) - signW) / 2,
          top: 0,
          width: signW,
          height: signH,
          lineHeight: `${signH - 4}px`,
          textAlign: 'center',
          fontSize: 8,
          color: '#ff3344',
          background:
            'linear-gradient(180deg, rgba(255,51,68,0.18), rgba(255,51,68,0.05) 50%, rgba(255,51,68,0.18))',
          border: '2px solid #ff3344',
          textShadow: '0 0 4px #ff3344, 0 0 10px #ff3344aa',
          boxShadow:
            '0 0 12px rgba(255,51,68,0.55), inset 0 0 8px rgba(255,51,68,0.35)',
        }}
      >
        EMERGENCY EXIT
      </div>

      {/* === Door frame === */}
      <div
        className="absolute"
        style={{
          left: (Math.max(W, signW) - (W + 8)) / 2,
          top: signH + 6,
          width: W + 8,
          height: H,
          background:
            'linear-gradient(180deg, #2a1448 0%, #15082a 100%)',
          border: '2px solid #050009',
          boxShadow:
            'inset 0 1px 0 rgba(255,255,255,0.05), 0 6px 12px rgba(0,0,0,0.8)',
        }}
      >
        {/* === Door body (wood grain) === */}
        <div
          className="absolute"
          style={{
            left: 4,
            top: 4,
            width: W,
            height: H - 8,
            background:
              'linear-gradient(180deg, #4a2818 0%, #3a1e10 50%, #2a1408 100%)',
            border: '2px solid #1a0c04',
            // Vertical wood-grain pixel stripes
            backgroundImage: [
              'linear-gradient(180deg, #4a2818 0%, #3a1e10 50%, #2a1408 100%)',
              'repeating-linear-gradient(90deg, rgba(0,0,0,0.18) 0 2px, transparent 2px 8px)',
              'repeating-linear-gradient(90deg, rgba(255,200,140,0.04) 0 1px, transparent 1px 12px)',
            ].join(', '),
            boxShadow:
              'inset 2px 2px 0 rgba(255,200,140,0.08), inset -2px -2px 0 rgba(0,0,0,0.6)',
          }}
        >
          {/* Recessed panel (upper) */}
          <div
            className="absolute"
            style={{
              left: 8,
              top: 12,
              right: 8,
              height: (H - 8) * 0.4,
              border: '2px solid #1a0c04',
              boxShadow:
                'inset 1px 1px 0 rgba(0,0,0,0.5), inset -1px -1px 0 rgba(255,200,140,0.06)',
            }}
          />
          {/* Recessed panel (lower) */}
          <div
            className="absolute"
            style={{
              left: 8,
              top: (H - 8) * 0.5,
              right: 8,
              bottom: 12,
              border: '2px solid #1a0c04',
              boxShadow:
                'inset 1px 1px 0 rgba(0,0,0,0.5), inset -1px -1px 0 rgba(255,200,140,0.06)',
            }}
          />

          {/* Hinges (left side) */}
          {[16, H - 40].map((ty) => (
            <div
              key={`hinge-${ty}`}
              className="absolute"
              style={{
                left: -2,
                top: ty,
                width: 5,
                height: 14,
                background:
                  'linear-gradient(180deg, #6a6a78 0%, #353540 100%)',
                border: '1px solid #1a1a22',
                boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.15)',
              }}
            />
          ))}

          {/* Door handle (right side) */}
          <div
            className="absolute rounded-sm"
            style={{
              right: 6,
              top: H / 2 - 12,
              width: 8,
              height: 4,
              background:
                'radial-gradient(circle at 30% 30%, #ffe9a5, #b8862a 70%, #6a4a14)',
              boxShadow:
                '0 0 4px rgba(255,233,165,0.5), 0 2px 0 rgba(0,0,0,0.6)',
            }}
          />
          {/* Lock plate below handle */}
          <div
            className="absolute"
            style={{
              right: 5,
              top: H / 2 - 4,
              width: 10,
              height: 6,
              background: '#22103a',
              border: '1px solid #050009',
            }}
          />
        </div>
      </div>
    </div>
  );
}

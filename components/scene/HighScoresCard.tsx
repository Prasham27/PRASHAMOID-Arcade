'use client';

import { SEED_SCORES } from '@/lib/seed-scores';

/** Top-right HUD: HIGH SCORES top-5 (uses seed-scores). Hidden under 1300px wide. */
export function HighScoresCard() {
  // Show first 5 entries + always pin PRASHAM 999999 on top for personality
  const top = SEED_SCORES.slice(0, 5);

  return (
    <div
      className="pointer-events-none fixed right-3 top-16 z-40 hidden min-[1300px]:block"
      style={{ width: 216 }}
    >
      <div
        className="relative border-2 border-cyan p-2 font-pixel"
        style={{
          background:
            'linear-gradient(180deg, rgba(28,4,41,0.92) 0%, rgba(11,0,20,0.92) 100%)',
          boxShadow:
            '0 0 14px rgba(0,240,255,0.45), 0 0 32px rgba(0,240,255,0.18), inset 0 0 0 1px rgba(0,240,255,0.25)',
        }}
      >
        <CornerTicks color="#00f0ff" />

        <div
          className="text-center text-[11px] tracking-widest text-cyan"
          style={{
            textShadow: '0 0 4px #00f0ff, 0 0 10px rgba(0,240,255,0.5)',
            lineHeight: '14px',
          }}
        >
          HIGH SCORES
        </div>
        <div
          className="mt-1 border-t border-cyan/40"
          style={{ borderColor: 'rgba(0,240,255,0.4)' }}
        />

        <ul className="mt-1 space-y-0.5 font-pixel">
          <ScoreRow rank={1} name="PRASHAM" score={999999} color="#ffe600" />
          {top.map((s, i) => (
            <ScoreRow
              key={s.name}
              rank={i + 2}
              name={s.name}
              score={s.score}
              color="#c7a8e8"
            />
          ))}
        </ul>
      </div>
    </div>
  );
}

function ScoreRow({
  rank,
  name,
  score,
  color,
}: {
  rank: number;
  name: string;
  score: number;
  color: string;
}) {
  return (
    <li
      className="grid grid-cols-[18px_1fr_auto] items-center gap-1 text-[9px] tracking-widest"
      style={{ color }}
    >
      <span className="text-text-muted">{String(rank).padStart(2, '0')}</span>
      <span>{name}</span>
      <span style={{ fontFamily: 'var(--font-score), monospace' }}>
        {score.toString().padStart(6, '0')}
      </span>
    </li>
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

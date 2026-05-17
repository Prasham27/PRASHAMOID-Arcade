import { content } from '@/content/data';
import { PixelText } from '@/components/effects/PixelText';

export const metadata = { title: 'Levels' };

const typeColor: Record<string, 'pink' | 'cyan' | 'yellow' | 'green'> = {
  education: 'cyan',
  project: 'pink',
  course: 'yellow',
  'open-source': 'green',
  role: 'pink',
};

export default function LevelsPage() {
  return (
    <div className="mx-auto max-w-4xl px-6 pb-24 pt-12 md:px-10 md:pt-16">
      <header className="mb-10">
        <p className="font-pixel text-[10px] tracking-widest text-text-muted">
          LEVELS //
        </p>
        <h1 className="mt-3 font-pixel text-2xl text-yellow phosphor-yellow md:text-4xl">
          XP PROGRESSION
        </h1>
        <p className="mt-4 max-w-2xl font-body text-base leading-relaxed text-text-dim md:text-lg">
          A vertical run through coursework, contributions, and projects.
          Each level = a tier of XP earned by shipping something real.
        </p>
      </header>

      <ol className="relative space-y-6 border-l-2 border-border pl-6">
        {content.experience.map((entry, i) => {
          const color = typeColor[entry.type] ?? 'cyan';
          return (
            <li key={entry.id} className="relative">
              <span
                aria-hidden
                className={`absolute -left-[36px] top-3 inline-block h-3 w-3 border-2 ${
                  color === 'pink'
                    ? 'border-pink bg-pink'
                    : color === 'cyan'
                      ? 'border-cyan bg-cyan'
                      : color === 'yellow'
                        ? 'border-yellow bg-yellow'
                        : 'border-green bg-green'
                }`}
              />
              <article className="border-2 border-border bg-bg-2 p-5">
                <div className="flex items-center justify-between gap-4">
                  <PixelText size="xs" color="text-dim">
                    LV{(i + 1).toString().padStart(2, '0')} //{' '}
                    {entry.type.toUpperCase()}
                  </PixelText>
                  <PixelText size="xs" color={color}>
                    {entry.period}
                  </PixelText>
                </div>
                <h2 className="mt-3 font-pixel text-sm text-text">
                  {entry.title.toUpperCase()}
                </h2>
                <p className="mt-1 font-body text-base text-text-dim">
                  {entry.organization}
                </p>

                {/* XP BAR — proportional to highlights count, fully populated */}
                <div className="mt-4">
                  <div className="flex items-center justify-between font-pixel text-[9px] tracking-widest text-text-muted">
                    <span>XP</span>
                    <span>FULL</span>
                  </div>
                  <div className="mt-1 h-3 w-full border-2 border-border bg-bg">
                    <div
                      className={`h-full ${
                        color === 'pink'
                          ? 'bg-pink'
                          : color === 'cyan'
                            ? 'bg-cyan'
                            : color === 'yellow'
                              ? 'bg-yellow'
                              : 'bg-green'
                      }`}
                      style={{ width: '100%' }}
                    />
                  </div>
                </div>

                {entry.highlights.length > 0 && (
                  <ul className="mt-4 list-none space-y-1 font-body text-base text-text">
                    {entry.highlights.map((h) => (
                      <li
                        key={h}
                        className="flex items-start gap-2 leading-relaxed"
                      >
                        <span className="mt-1 text-cyan">▶</span>
                        <span>{h}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </article>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

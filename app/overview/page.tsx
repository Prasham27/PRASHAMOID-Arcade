import { content } from '@/content/data';
import { PixelText } from '@/components/effects/PixelText';
import { CoinSlotButton } from '@/components/hud/CoinSlotButton';
import { Sprite } from '@/components/icons/Sprite';
import { spriteForSkill } from '@/lib/sprites';

export const metadata = { title: 'Operator Profile' };

const HEART_FULL = '♥';
const HEART_EMPTY = '♡';

export default function OverviewPage() {
  const { identity, projects, skills, experience } = content;

  // Featured cabinet — first explicitly-featured project, fallback to first.
  const featured = projects.find((p) => p.featured) ?? projects[0];

  // Top 3 power-ups: level desc, then yearsUsed desc.
  const topSkills = [...skills]
    .sort((a, b) => b.level - a.level || b.yearsUsed - a.yearsUsed)
    .slice(0, 3);

  const projectsShipped = projects.length;
  const yearsCoding = 3;
  const openSourceCount = experience.filter(
    (e) => e.type === 'open-source',
  ).length;

  return (
    <div className="mx-auto max-w-5xl px-6 pb-24 pt-10 md:px-10 md:pt-14">
      {/* TOP ACCENT BAR + scanline overlay */}
      <div className="relative mb-8 overflow-hidden border-2 border-cyan bg-bg-2 py-3 text-center">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-30"
          style={{
            background:
              'repeating-linear-gradient(0deg, transparent 0 2px, rgba(0,240,255,0.18) 2px 3px)',
          }}
        />
        <PixelText size="xs" color="cyan" glow className="relative">
          [ ◆ OPERATOR TERMINAL ONLINE ◆ ]
        </PixelText>
      </div>

      {/* HEADER */}
      <header className="mb-10">
        <p className="font-pixel text-[10px] tracking-widest text-text-muted">
          OPERATOR PROFILE //
        </p>
        <h1 className="mt-3 font-pixel text-5xl text-pink phosphor-pink md:text-6xl">
          {identity.name.toUpperCase()}
        </h1>
        <p className="mt-4 font-pixel text-xs tracking-widest text-cyan phosphor-cyan">
          {identity.role}
        </p>
        <p className="mt-2 font-pixel text-[10px] tracking-widest text-text-muted">
          ◆ {identity.location.toUpperCase()}
        </p>
        <p className="mt-6 max-w-[60ch] font-body text-lg leading-relaxed text-text-dim md:text-xl">
          {identity.bio}
        </p>
      </header>

      {/* FEATURED CABINET */}
      <section className="mb-10">
        <PixelText size="xs" color="cyan" glow as="h2">
          ◆ FEATURED CABINET //
        </PixelText>
        <article className="mt-3 border-2 border-cyan bg-bg-2 p-6">
          <div className="flex flex-wrap items-baseline justify-between gap-3">
            <h3 className="font-pixel text-xl text-cyan phosphor-cyan md:text-2xl">
              {featured.name.toUpperCase()}
            </h3>
            <PixelText size="xs" color="text-dim">
              {featured.category.toUpperCase()} · {featured.status.toUpperCase()}
            </PixelText>
          </div>
          <p className="mt-3 max-w-[60ch] font-body text-base text-text-dim md:text-lg">
            {featured.tagline}
          </p>

          {featured.metrics && featured.metrics.length > 0 && (
            <ul className="mt-5 grid gap-3 sm:grid-cols-2">
              {featured.metrics.slice(0, 2).map((m) => (
                <li
                  key={m.label}
                  className="border-2 border-border bg-bg p-3"
                >
                  <p className="font-pixel text-[10px] tracking-widest text-text-muted">
                    {m.label.toUpperCase()} //
                  </p>
                  <p className="mt-1 font-score text-2xl text-yellow phosphor-yellow">
                    {m.value}
                  </p>
                  {m.context && (
                    <p className="mt-1 font-body text-sm text-text-dim">
                      {m.context}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          )}

          {featured.links.github && (
            <div className="mt-5">
              <CoinSlotButton href={featured.links.github} color="cyan" size="sm">
                ▶ GITHUB
              </CoinSlotButton>
            </div>
          )}
        </article>
      </section>

      {/* TWO-COLUMN GRID — STATS + POWER-UPS */}
      <div className="mb-10 grid gap-6 md:grid-cols-2">
        {/* STATS */}
        <section>
          <PixelText size="xs" color="cyan" glow as="h2">
            ◆ STATS //
          </PixelText>
          <div className="mt-3 grid gap-3 sm:grid-cols-3 md:grid-cols-1 lg:grid-cols-3">
            <StatCard label="PROJECTS SHIPPED" value={projectsShipped} />
            <StatCard label="YEARS CODING" value={yearsCoding} />
            <StatCard label="OPEN SOURCE" value={openSourceCount} />
          </div>
        </section>

        {/* POWER-UPS */}
        <section>
          <PixelText size="xs" color="cyan" glow as="h2">
            ◆ POWER-UPS //
          </PixelText>
          <ul className="mt-3 space-y-3">
            {topSkills.map((s) => (
              <li
                key={s.name}
                className="flex items-center gap-4 border-2 border-border bg-bg-2 p-3"
              >
                <div className="shrink-0">
                  <Sprite
                    def={spriteForSkill(s.name)}
                    scale={2}
                    ariaLabel={s.name}
                  />
                </div>
                <div className="flex-1">
                  <p className="font-pixel text-xs tracking-widest text-text">
                    {s.name.toUpperCase()}
                  </p>
                  <p
                    aria-label={`Level ${s.level} of 5`}
                    className="mt-1 font-pixel text-sm text-pink phosphor-pink"
                  >
                    {HEART_FULL.repeat(s.level)}
                    <span className="text-text-muted">
                      {HEART_EMPTY.repeat(5 - s.level)}
                    </span>
                  </p>
                  <p className="mt-1 font-pixel text-[10px] tracking-widest text-text-muted">
                    LV {s.level} · {s.yearsUsed} YR
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </section>
      </div>

      {/* QUICK NAV */}
      <section>
        <PixelText size="xs" color="cyan" glow as="h2">
          ◆ QUICK NAV //
        </PixelText>
        <div className="mt-3 grid gap-3 sm:grid-cols-2 md:grid-cols-4">
          <CoinSlotButton href="/arcade" color="pink" size="md">
            ◀ BACK TO ARCADE
          </CoinSlotButton>
          <CoinSlotButton href="/inventory" color="cyan" size="md">
            INVENTORY
          </CoinSlotButton>
          <CoinSlotButton href="/levels" color="yellow" size="md">
            LEVELS
          </CoinSlotButton>
          <CoinSlotButton href="/comms" color="green" size="md">
            COMMS
          </CoinSlotButton>
        </div>
      </section>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="border-2 border-border bg-bg-2 p-4 text-center">
      <p className="font-pixel text-[10px] tracking-widest text-text-muted">
        {label} //
      </p>
      <p className="mt-2 font-score text-4xl text-yellow phosphor-yellow">
        {value.toString().padStart(2, '0')}
      </p>
    </div>
  );
}

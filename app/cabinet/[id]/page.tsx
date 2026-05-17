import { notFound } from 'next/navigation';
import Link from 'next/link';
import { content } from '@/content/data';
import { PixelText } from '@/components/effects/PixelText';
import { CoinSlotButton } from '@/components/hud/CoinSlotButton';
import { ScoreReadout } from '@/components/hud/ScoreReadout';
import { Marquee } from '@/components/cabinet/Marquee';
import { VisitTracker } from './VisitTracker';

const accentByCategory: Record<string, 'pink' | 'cyan' | 'yellow' | 'green'> = {
  ml: 'pink',
  finance: 'cyan',
  systems: 'yellow',
  vlsi: 'green',
  'open-source': 'cyan',
};

export function generateStaticParams() {
  return content.projects.map((p) => ({ id: p.id }));
}

export function generateMetadata({ params }: { params: { id: string } }) {
  const project = content.projects.find((p) => p.id === params.id);
  return { title: project ? project.name : 'Cabinet' };
}

export default function CabinetDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const project = content.projects.find((p) => p.id === params.id);
  if (!project) notFound();

  const idx = content.projects.findIndex((p) => p.id === params.id);
  const prev = content.projects[idx - 1] ?? content.projects[content.projects.length - 1];
  const next = content.projects[idx + 1] ?? content.projects[0];
  const color = accentByCategory[project.category] ?? 'pink';

  return (
    <div className="mx-auto max-w-5xl px-6 pb-24 pt-10 md:px-10 md:pt-14">
      <VisitTracker id={project.id} />

      <Link
        href="/arcade"
        className="inline-block font-pixel text-[10px] tracking-widest text-text-muted hover:text-pink"
      >
        ← BACK TO ARCADE
      </Link>

      <div className="mt-6">
        <Marquee name={project.name.toUpperCase()} color={color} size="lg" />
      </div>

      <p className="mt-6 max-w-3xl font-body text-lg leading-relaxed text-text-dim">
        {project.tagline}
      </p>

      <div className="mt-10 grid gap-6 lg:grid-cols-[2fr_1fr]">
        {/* GAME MANUAL = description */}
        <article className="border-2 border-border bg-bg-2 p-6">
          <PixelText size="xs" color="cyan">
            ▼ GAME MANUAL //
          </PixelText>
          <p className="mt-3 whitespace-pre-line font-prose text-base leading-relaxed text-text">
            {project.description}
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            {project.stack.map((s) => (
              <span
                key={s}
                className="border-2 border-border bg-bg px-2 py-1 font-pixel text-[10px] tracking-widest text-yellow phosphor-yellow"
              >
                {s.toUpperCase()}
              </span>
            ))}
          </div>
        </article>

        {/* HIGH SCORES = metrics */}
        <aside className="space-y-3">
          <div className="border-2 border-border bg-bg-2 p-4">
            <PixelText size="xs" color="pink">
              ▼ HIGH SCORES //
            </PixelText>
            <div className="mt-4 space-y-4">
              {(project.metrics ?? []).map((m, i) => (
                <ScoreReadout
                  key={m.label}
                  label={m.label}
                  value={m.value}
                  color={i % 2 === 0 ? 'yellow' : 'pink'}
                />
              ))}
              {(!project.metrics || project.metrics.length === 0) && (
                <p className="font-body text-sm text-text-muted">
                  No on-the-board scores reported for this run.
                </p>
              )}
            </div>
          </div>

          {project.links.github && (
            <CoinSlotButton
              href={project.links.github}
              color="green"
              size="md"
              className="w-full"
            >
              VIEW SOURCE ◆
            </CoinSlotButton>
          )}

          <div className="border-2 border-border bg-bg-2 p-4">
            <PixelText size="xs" color="cyan">
              ▼ TAGS //
            </PixelText>
            <div className="mt-3 flex flex-wrap gap-1">
              {project.tags.map((t) => (
                <span
                  key={t}
                  className="border border-border bg-bg px-2 py-1 font-pixel text-[9px] tracking-widest text-text-dim"
                >
                  #{t}
                </span>
              ))}
            </div>
          </div>
        </aside>
      </div>

      <div className="mt-12 flex flex-col items-stretch justify-between gap-3 sm:flex-row">
        <CoinSlotButton href={`/cabinet/${prev.id}`} color="cyan" size="md">
          ← PREV CABINET
        </CoinSlotButton>
        <CoinSlotButton href={`/cabinet/${next.id}`} color="pink" size="md">
          NEXT CABINET →
        </CoinSlotButton>
      </div>
    </div>
  );
}

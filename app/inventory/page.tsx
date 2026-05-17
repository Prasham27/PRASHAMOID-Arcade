import { content } from '@/content/data';
import { Sprite } from '@/components/icons/Sprite';
import { spriteForSkill } from '@/lib/sprites';
import { PixelText } from '@/components/effects/PixelText';

const HEART_FULL = '♥';
const HEART_EMPTY = '♡';

const categoryLabel: Record<string, string> = {
  languages: '◢ LANGUAGES',
  ml: '◣ MACHINE LEARNING',
  systems: '◤ SYSTEMS',
  theory: '◥ THEORY',
  tools: '◆ TOOLS',
};

const categoryColor: Record<
  string,
  'pink' | 'cyan' | 'yellow' | 'green' | 'text'
> = {
  languages: 'pink',
  ml: 'cyan',
  systems: 'yellow',
  theory: 'green',
  tools: 'pink',
};

export const metadata = { title: 'Inventory' };

export default function InventoryPage() {
  const grouped = content.skills.reduce<
    Record<string, typeof content.skills>
  >((acc, s) => {
    (acc[s.category] ??= [] as typeof content.skills).push(s);
    return acc;
  }, {});

  return (
    <div className="mx-auto max-w-6xl px-6 pb-24 pt-12 md:px-10 md:pt-16">
      <header className="mb-10">
        <p className="font-pixel text-[10px] tracking-widest text-text-muted">
          INVENTORY //
        </p>
        <h1 className="mt-3 font-pixel text-2xl text-cyan phosphor-cyan md:text-4xl">
          POWER-UPS COLLECTED
        </h1>
        <p className="mt-4 max-w-2xl font-body text-base leading-relaxed text-text-dim md:text-lg">
          Skills accumulated through coursework, projects, and a lot of late
          nights. Hearts = mastery (1–5). Hover for context.
        </p>
      </header>

      <div className="space-y-10">
        {Object.entries(grouped).map(([category, skills]) => (
          <section key={category}>
            <PixelText
              size="sm"
              color={categoryColor[category] ?? 'cyan'}
              glow
              as="h2"
            >
              {categoryLabel[category] ?? `◆ ${category.toUpperCase()}`}
            </PixelText>
            <ul className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {skills.map((s) => (
                <li
                  key={s.name}
                  className="group flex items-center gap-4 border-2 border-border bg-bg-2 p-4 transition-colors hover:border-pink"
                  title={`${s.name} · ${s.yearsUsed} year${s.yearsUsed === 1 ? '' : 's'}`}
                >
                  <div className="shrink-0">
                    <Sprite def={spriteForSkill(s.name)} scale={3} ariaLabel={s.name} />
                  </div>
                  <div className="flex-1">
                    <p className="font-pixel text-xs tracking-widest text-text">
                      {s.name.toUpperCase()}
                    </p>
                    <p className="mt-1 font-pixel text-[10px] tracking-widest text-text-muted">
                      LV {s.level} · {s.yearsUsed} YR
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
                  </div>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}

import { PixelText } from '@/components/effects/PixelText';
import { CoinSlotButton } from '@/components/hud/CoinSlotButton';
import { headers } from 'next/headers';

export const metadata = { title: 'Hi-Scores' };
export const revalidate = 60;

interface Score {
  name: string;
  score: number;
  created_at: string;
  seed?: boolean;
}

interface Repo {
  name: string;
  description: string | null;
  html_url: string;
  stargazers_count: number;
  language: string | null;
  pushed_at: string;
}

interface GithubData {
  user: {
    login: string;
    name: string | null;
    public_repos: number;
    followers: number;
  } | null;
  topRepos: Repo[];
  totalStars: number;
  topLanguages: { name: string; bytes: number }[];
  offline: boolean;
}

async function getScores(): Promise<{ scores: Score[]; mode: 'global' | 'local' }> {
  const h = headers();
  const host = h.get('host') ?? 'localhost:3000';
  const proto = h.get('x-forwarded-proto') ?? 'http';
  try {
    const res = await fetch(`${proto}://${host}/api/scores`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return { scores: [], mode: 'local' };
    return (await res.json()) as { scores: Score[]; mode: 'global' | 'local' };
  } catch {
    return { scores: [], mode: 'local' };
  }
}

async function getGithub(): Promise<GithubData> {
  const h = headers();
  const host = h.get('host') ?? 'localhost:3000';
  const proto = h.get('x-forwarded-proto') ?? 'http';
  try {
    const res = await fetch(`${proto}://${host}/api/github`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) {
      return {
        user: null,
        topRepos: [],
        totalStars: 0,
        topLanguages: [],
        offline: true,
      };
    }
    return (await res.json()) as GithubData;
  } catch {
    return {
      user: null,
      topRepos: [],
      totalStars: 0,
      topLanguages: [],
      offline: true,
    };
  }
}

export default async function ScoresPage() {
  const [scoresPayload, gh] = await Promise.all([getScores(), getGithub()]);

  return (
    <div className="mx-auto max-w-5xl px-6 pb-24 pt-12 md:px-10 md:pt-16">
      <header className="mb-10">
        <p className="font-pixel text-[10px] tracking-widest text-text-muted">
          HI-SCORES //
        </p>
        <h1 className="mt-3 font-pixel text-2xl text-green phosphor-green md:text-4xl">
          TOP 10 + GITHUB STATS
        </h1>
        <p className="mt-4 max-w-2xl font-body text-base leading-relaxed text-text-dim md:text-lg">
          Top scores from PRASHAMOID + lifetime contributions from github.com/Prasham27.
        </p>
      </header>

      <section className="mb-12">
        <div className="flex items-baseline justify-between border-b-2 border-border pb-2">
          <PixelText size="sm" color="yellow" glow as="h2">
            ▼ PRASHAMOID LEADERBOARD
          </PixelText>
          <PixelText size="xs" color="text-dim">
            {scoresPayload.mode === 'global' ? '★ GLOBAL' : '◆ LOCAL ONLY'}
          </PixelText>
        </div>

        <ol className="mt-4 divide-y-2 divide-border border-2 border-border bg-bg-2">
          {scoresPayload.scores.map((s, i) => (
            <li
              key={`${s.name}-${s.created_at}`}
              className="flex items-center justify-between px-4 py-3"
            >
              <div className="flex items-center gap-4">
                <span
                  className={`font-pixel text-sm ${
                    i === 0
                      ? 'text-yellow phosphor-yellow'
                      : i === 1
                        ? 'text-cyan phosphor-cyan'
                        : i === 2
                          ? 'text-pink phosphor-pink'
                          : 'text-text-muted'
                  }`}
                >
                  #{(i + 1).toString().padStart(2, '0')}
                </span>
                <span className="font-pixel text-lg text-text">{s.name}</span>
                {s.seed && (
                  <span className="font-pixel text-[8px] tracking-widest text-text-muted">
                    [SEEDED]
                  </span>
                )}
              </div>
              <span className="font-score text-2xl tracking-widest text-yellow phosphor-yellow">
                {s.score.toString().padStart(7, '0')}
              </span>
            </li>
          ))}
        </ol>

        <div className="mt-4 text-center">
          <CoinSlotButton href="/play" color="pink">
            ◆ PLAY PRASHAMOID ◆
          </CoinSlotButton>
        </div>
      </section>

      <section>
        <div className="flex items-baseline justify-between border-b-2 border-border pb-2">
          <PixelText size="sm" color="cyan" glow as="h2">
            ▼ GITHUB BLOCK STATS
          </PixelText>
          {gh.offline && (
            <PixelText size="xs" color="pink">
              OFFLINE
            </PixelText>
          )}
        </div>

        {gh.user && (
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            <Stat label="REPOS" value={gh.user.public_repos} color="pink" />
            <Stat label="FOLLOWERS" value={gh.user.followers} color="cyan" />
            <Stat label="TOTAL STARS" value={gh.totalStars} color="yellow" />
          </div>
        )}

        {gh.topLanguages.length > 0 && (
          <div className="mt-6 border-2 border-border bg-bg-2 p-4">
            <PixelText size="xs" color="text-dim">
              LANGUAGE BREAKDOWN //
            </PixelText>
            <div className="mt-3 flex h-3 w-full overflow-hidden border-2 border-border bg-bg">
              {gh.topLanguages.map((lang) => {
                const total = gh.topLanguages.reduce((a, b) => a + b.bytes, 0);
                const pct = (lang.bytes / total) * 100;
                const color = LANGUAGE_COLOR[lang.name] ?? '#7a5a96';
                return (
                  <span
                    key={lang.name}
                    style={{ width: `${pct}%`, background: color }}
                    title={`${lang.name} — ${pct.toFixed(1)}%`}
                  />
                );
              })}
            </div>
            <ul className="mt-3 flex flex-wrap gap-3 font-pixel text-[10px] tracking-widest">
              {gh.topLanguages.map((lang) => (
                <li key={lang.name} className="flex items-center gap-2">
                  <span
                    className="inline-block h-2 w-2"
                    style={{ background: LANGUAGE_COLOR[lang.name] ?? '#7a5a96' }}
                  />
                  <span className="text-text">{lang.name}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {gh.topRepos.length > 0 && (
          <ul className="mt-6 grid gap-3 md:grid-cols-2">
            {gh.topRepos.map((r) => (
              <li key={r.name}>
                <a
                  href={r.html_url}
                  target="_blank"
                  rel="noreferrer"
                  className="block border-2 border-border bg-bg-2 p-4 transition-colors hover:border-green"
                >
                  <p className="font-pixel text-xs tracking-widest text-green phosphor-green">
                    ◆ {r.name.toUpperCase()}
                  </p>
                  <p className="mt-2 font-body text-base text-text-dim line-clamp-2">
                    {r.description ?? 'No description.'}
                  </p>
                  <p className="mt-2 flex items-center gap-3 font-pixel text-[10px] tracking-widest text-text-muted">
                    <span>★ {r.stargazers_count}</span>
                    {r.language && (
                      <span style={{ color: LANGUAGE_COLOR[r.language] ?? '#7a5a96' }}>
                        {r.language}
                      </span>
                    )}
                  </p>
                </a>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function Stat({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: 'pink' | 'cyan' | 'yellow';
}) {
  const colorMap = {
    pink: 'text-pink phosphor-pink',
    cyan: 'text-cyan phosphor-cyan',
    yellow: 'text-yellow phosphor-yellow',
  };
  return (
    <div className="border-2 border-border bg-bg-2 p-4 text-center">
      <p className="font-pixel text-[10px] tracking-widest text-text-muted">
        {label} //
      </p>
      <p className={`mt-2 font-score text-4xl tracking-widest ${colorMap[color]}`}>
        {value.toLocaleString()}
      </p>
    </div>
  );
}

const LANGUAGE_COLOR: Record<string, string> = {
  Python: '#3572A5',
  TypeScript: '#3178c6',
  JavaScript: '#f1e05a',
  MATLAB: '#e16737',
  'C++': '#f34b7d',
  C: '#555555',
  HTML: '#e34c26',
  CSS: '#563d7c',
  Shell: '#89e051',
  Jupyter: '#DA5B0B',
};

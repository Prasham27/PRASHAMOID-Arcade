import { NextResponse } from 'next/server';

export const revalidate = 3600;

const USER = 'Prasham27';

interface RepoRaw {
  id: number;
  name: string;
  description: string | null;
  fork: boolean;
  stargazers_count: number;
  language: string | null;
  size: number;
  pushed_at: string;
  html_url: string;
}

interface UserRaw {
  login: string;
  name: string | null;
  public_repos: number;
  followers: number;
}

function authHeader(): Record<string, string> {
  const token = process.env.GITHUB_TOKEN;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

const HEADERS = {
  Accept: 'application/vnd.github+json',
  'X-GitHub-Api-Version': '2022-11-28',
  'User-Agent': 'arcade-portfolio',
};

export async function GET(): Promise<Response> {
  try {
    const [userRes, reposRes] = await Promise.all([
      fetch(`https://api.github.com/users/${USER}`, {
        headers: { ...HEADERS, ...authHeader() },
        next: { revalidate: 3600 },
      }),
      fetch(
        `https://api.github.com/users/${USER}/repos?per_page=100&sort=updated`,
        {
          headers: { ...HEADERS, ...authHeader() },
          next: { revalidate: 3600 },
        },
      ),
    ]);
    if (!userRes.ok || !reposRes.ok) {
      return NextResponse.json(
        {
          user: null,
          topRepos: [],
          totalStars: 0,
          topLanguages: [],
          offline: true,
        },
        { status: 200 },
      );
    }
    const user = (await userRes.json()) as UserRaw;
    const reposRaw = (await reposRes.json()) as RepoRaw[];
    const repos = reposRaw.filter((r) => !r.fork || r.stargazers_count > 5);

    const totalStars = repos.reduce((s, r) => s + r.stargazers_count, 0);

    const topRepos = [...repos]
      .sort((a, b) => {
        // Score: 40% stars + 30% recency + 15% size + 15% pinned-pick (omit pinned)
        const aRecency = Date.parse(a.pushed_at);
        const bRecency = Date.parse(b.pushed_at);
        const aScore = a.stargazers_count * 4 + aRecency / 1e10 + a.size / 1e4;
        const bScore = b.stargazers_count * 4 + bRecency / 1e10 + b.size / 1e4;
        return bScore - aScore;
      })
      .slice(0, 8);

    const langTotals = new Map<string, number>();
    for (const r of repos) {
      if (!r.language) continue;
      langTotals.set(r.language, (langTotals.get(r.language) ?? 0) + r.size);
    }
    const topLanguages = Array.from(langTotals.entries())
      .map(([name, bytes]) => ({ name, bytes }))
      .sort((a, b) => b.bytes - a.bytes)
      .slice(0, 6);

    return NextResponse.json(
      {
        user: {
          login: user.login,
          name: user.name,
          public_repos: user.public_repos,
          followers: user.followers,
        },
        topRepos: topRepos.map((r) => ({
          name: r.name,
          description: r.description,
          html_url: r.html_url,
          stargazers_count: r.stargazers_count,
          language: r.language,
          pushed_at: r.pushed_at,
        })),
        totalStars,
        topLanguages,
        offline: false,
      },
      {
        headers: {
          'Cache-Control':
            'public, s-maxage=3600, stale-while-revalidate=86400',
        },
      },
    );
  } catch {
    return NextResponse.json({
      user: null,
      topRepos: [],
      totalStars: 0,
      topLanguages: [],
      offline: true,
    });
  }
}

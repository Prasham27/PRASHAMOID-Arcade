'use client';

import { useCallback, useEffect, useState } from 'react';
import { PixelText } from '@/components/effects/PixelText';
import { CoinSlotButton } from '@/components/hud/CoinSlotButton';
import { cn } from '@/lib/cn';

interface PathHit {
  path: string;
  timestamp: number;
  sessionId?: string;
}

interface VisitorRecord {
  visitorId: string;
  firstSeenAt: number;
  lastSeenAt: number;
  visitCount: number;
  totalHits: number;
  sessionIds: string[];
  paths: PathHit[];
  ua?: string;
}

interface AnalyticsSummary {
  totalHits: number;
  uniqueSessions: number;
  uniqueVisitors: number;
  topPages: { path: string; hits: number }[];
  recentEvents: {
    timestamp: number;
    path: string;
    ua: string;
    ip?: string;
    referrer?: string;
    sessionId?: string;
    visitorId?: string;
  }[];
  visitors: VisitorRecord[];
  snapshotAt: string;
  firstHitAt: string | null;
  serverUptimeMs: number;
}

export default function AdminPage() {
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [stats, setStats] = useState<AnalyticsSummary | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadStats = useCallback(async () => {
    setError(null);
    const res = await fetch('/api/admin/stats', { cache: 'no-store' });
    if (res.status === 401) {
      setAuthed(false);
      return;
    }
    if (!res.ok) {
      setError(`STATS UNREACHABLE (${res.status})`);
      setAuthed(false);
      return;
    }
    const data = (await res.json()) as AnalyticsSummary;
    setStats(data);
    setAuthed(true);
  }, []);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  const handleLogout = useCallback(async () => {
    await fetch('/api/admin/logout', { method: 'POST' });
    setAuthed(false);
    setStats(null);
  }, []);

  if (authed === null) {
    return (
      <main className="min-h-screen bg-bg p-6 text-text">
        <PixelText size="xs" color="text-dim">
          AUTHENTICATING //
        </PixelText>
      </main>
    );
  }

  if (!authed) {
    return <LoginScreen onAuthed={loadStats} error={error} />;
  }

  return <Dashboard stats={stats} onLogout={handleLogout} onRefresh={loadStats} />;
}

interface LoginScreenProps {
  onAuthed: () => void;
  error: string | null;
}

function LoginScreen({ onAuthed, error: initialError }: LoginScreenProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(initialError);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setErr(null);
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok) {
        setErr(data.error ?? 'LOGIN FAILED');
        setBusy(false);
        return;
      }
      onAuthed();
    } catch {
      setErr('NETWORK ERROR');
      setBusy(false);
    }
  };

  return (
    <main className="min-h-screen bg-bg p-6 text-text">
      <div className="mx-auto mt-16 max-w-md border-2 border-pink bg-bg-2 p-8"
        style={{ boxShadow: '0 0 24px rgba(255,44,159,0.15)' }}
      >
        <PixelText size="xs" color="pink" glow>
          ◆ OPERATOR TERMINAL ◆
        </PixelText>
        <h1 className="mt-3 font-pixel text-lg text-text">ADMIN ACCESS</h1>
        <p className="mt-2 font-body text-base text-text-dim">
          Enter credentials to view visitor analytics.
        </p>

        <form onSubmit={submit} className="mt-6 space-y-4">
          <Field
            label="USERNAME"
            type="text"
            value={username}
            onChange={setUsername}
            disabled={busy}
            autoFocus
          />
          <Field
            label="PASSWORD"
            type="password"
            value={password}
            onChange={setPassword}
            disabled={busy}
          />
          {err && (
            <p className="font-pixel text-[10px] tracking-widest text-pink">
              {err}
            </p>
          )}
          <CoinSlotButton type="submit" color="green" disabled={busy} className="w-full">
            {busy ? 'CHECKING…' : '[ AUTHENTICATE ]'}
          </CoinSlotButton>
        </form>
      </div>
    </main>
  );
}

interface FieldProps {
  label: string;
  type: 'text' | 'password';
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;
  autoFocus?: boolean;
}
function Field({
  label,
  type,
  value,
  onChange,
  disabled,
  autoFocus,
}: FieldProps) {
  return (
    <div>
      <label className="block font-pixel text-[10px] tracking-widest text-text-muted">
        {label} //
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        autoFocus={autoFocus}
        autoComplete={type === 'password' ? 'current-password' : 'username'}
        className={cn(
          'mt-2 w-full border-2 border-border bg-bg px-3 py-2',
          'font-body text-base text-text focus:border-cyan focus:outline-none',
          'disabled:opacity-60',
        )}
      />
    </div>
  );
}

interface DashboardProps {
  stats: AnalyticsSummary | null;
  onLogout: () => void;
  onRefresh: () => void;
}

function Dashboard({ stats, onLogout, onRefresh }: DashboardProps) {
  const [expandedVisitor, setExpandedVisitor] = useState<string | null>(null);

  if (!stats) {
    return (
      <main className="min-h-screen bg-bg p-6 text-text">
        <PixelText size="xs" color="text-dim">
          NO DATA YET //
        </PixelText>
      </main>
    );
  }

  const uptimeMin = Math.floor(stats.serverUptimeMs / 60000);
  const maxHits = stats.topPages[0]?.hits ?? 1;

  return (
    <main className="mx-auto max-w-6xl px-6 pb-24 pt-8 md:px-10">
      <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <PixelText size="xs" color="pink" glow>
            ◆ OPERATOR TERMINAL ◆
          </PixelText>
          <h1 className="mt-3 font-pixel text-2xl text-yellow phosphor-yellow md:text-3xl">
            VISITOR ANALYTICS
          </h1>
          <p className="mt-2 font-body text-base text-text-dim">
            Snapshot {new Date(stats.snapshotAt).toLocaleString()} · Server up{' '}
            {uptimeMin}m
          </p>
        </div>
        <div className="flex gap-2">
          <CoinSlotButton onClick={onRefresh} color="cyan" size="sm">
            [ REFRESH ]
          </CoinSlotButton>
          <CoinSlotButton onClick={onLogout} color="pink" size="sm">
            [ LOG OUT ]
          </CoinSlotButton>
        </div>
      </header>

      <section className="mb-8 grid gap-3 sm:grid-cols-3">
        <Stat label="TOTAL HITS" value={stats.totalHits} color="yellow" />
        <Stat label="UNIQUE SESSIONS" value={stats.uniqueSessions} color="cyan" />
        <Stat label="UNIQUE VISITORS" value={stats.uniqueVisitors} color="pink" />
      </section>

      <section className="mb-8">
        <PixelText size="sm" color="cyan" glow as="h2">
          ▼ TOP PAGES
        </PixelText>
        <ul className="mt-3 space-y-1">
          {stats.topPages.map((p) => (
            <li
              key={p.path}
              className="flex items-center gap-3 border-2 border-border bg-bg-2 px-3 py-2"
            >
              <span className="w-32 flex-shrink-0 truncate font-pixel text-xs text-text">
                {p.path}
              </span>
              <span className="relative h-3 flex-1 bg-bg">
                <span
                  className="absolute inset-y-0 left-0 bg-cyan"
                  style={{ width: `${(p.hits / maxHits) * 100}%` }}
                />
              </span>
              <span className="w-12 text-right font-pixel text-xs text-yellow phosphor-yellow">
                {p.hits}
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section className="mb-8">
        <PixelText size="sm" color="pink" glow as="h2">
          ▼ VISITORS ({stats.visitors.length})
        </PixelText>
        <ul className="mt-3 space-y-1">
          {stats.visitors.map((v) => {
            const expanded = expandedVisitor === v.visitorId;
            return (
              <li key={v.visitorId} className="border-2 border-border bg-bg-2">
                <button
                  type="button"
                  onClick={() =>
                    setExpandedVisitor(expanded ? null : v.visitorId)
                  }
                  className="flex w-full items-center justify-between gap-3 px-3 py-2 text-left"
                >
                  <span className="flex-1 font-score text-sm text-text">
                    {v.visitCount > 1 && (
                      <span className="mr-2 text-yellow phosphor-yellow">◆</span>
                    )}
                    {v.visitorId.slice(0, 18)}
                  </span>
                  <span className="font-pixel text-[10px] tracking-widest text-text-muted">
                    {v.visitCount} VISIT{v.visitCount === 1 ? '' : 'S'} ·{' '}
                    {v.totalHits} HITS
                  </span>
                  <span className="font-pixel text-[10px] tracking-widest text-text-muted">
                    {new Date(v.lastSeenAt).toLocaleTimeString()}
                  </span>
                </button>
                {expanded && (
                  <div className="border-t-2 border-border px-3 py-2">
                    <p className="font-pixel text-[10px] tracking-widest text-text-muted">
                      FIRST SEEN //{' '}
                      {new Date(v.firstSeenAt).toLocaleString()}
                    </p>
                    <p className="mt-1 font-pixel text-[10px] tracking-widest text-text-muted">
                      UA // {v.ua?.slice(0, 80) ?? '-'}
                    </p>
                    <p className="mt-2 font-pixel text-[10px] tracking-widest text-cyan">
                      JOURNEY ({v.paths.length})
                    </p>
                    <ul className="mt-1 max-h-48 overflow-y-auto font-score text-xs">
                      {v.paths.map((p, i) => (
                        <li
                          key={`${p.timestamp}-${i}`}
                          className="flex justify-between gap-2 py-0.5 text-text-dim"
                        >
                          <span className="truncate">{p.path}</span>
                          <span className="flex-shrink-0 text-text-muted">
                            {new Date(p.timestamp).toLocaleTimeString()}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </section>

      <section>
        <PixelText size="sm" color="yellow" glow as="h2">
          ▼ RECENT EVENTS ({stats.recentEvents.length})
        </PixelText>
        <ul className="mt-3 max-h-96 space-y-1 overflow-y-auto">
          {stats.recentEvents.map((e, i) => (
            <li
              key={`${e.timestamp}-${i}`}
              className="flex items-center gap-3 border-2 border-border bg-bg-2 px-3 py-1 font-score text-xs"
            >
              <span className="w-24 flex-shrink-0 text-text-muted">
                {new Date(e.timestamp).toLocaleTimeString()}
              </span>
              <span className="flex-1 truncate text-text">{e.path}</span>
              <span className="w-32 truncate text-cyan">
                {e.visitorId?.slice(0, 14) ?? '-'}
              </span>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}

interface StatProps {
  label: string;
  value: number;
  color: 'pink' | 'cyan' | 'yellow';
}
function Stat({ label, value, color }: StatProps) {
  const map = {
    pink: 'text-pink phosphor-pink',
    cyan: 'text-cyan phosphor-cyan',
    yellow: 'text-yellow phosphor-yellow',
  };
  return (
    <div className="border-2 border-border bg-bg-2 p-4">
      <p className="font-pixel text-[10px] tracking-widest text-text-muted">
        {label} //
      </p>
      <p className={`mt-2 font-score text-4xl tracking-widest ${map[color]}`}>
        {value.toLocaleString()}
      </p>
    </div>
  );
}

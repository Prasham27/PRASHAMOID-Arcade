'use client';

import { useState } from 'react';
import { CoinSlotButton } from '@/components/hud/CoinSlotButton';
import { PixelText } from '@/components/effects/PixelText';
import { cn } from '@/lib/cn';

type State = 'idle' | 'sending' | 'sent' | 'error';

export default function CommsPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [honeypot, setHoneypot] = useState('');
  const [state, setState] = useState<State>('idle');
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (state === 'sending') return;
    setError(null);
    setState('sending');
    try {
      const res = await fetch('/api/comms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, message, honeypot }),
      });
      const data = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok) {
        setError(data.error ?? 'TRANSMISSION FAILED');
        setState('error');
        return;
      }
      setState('sent');
      setName('');
      setEmail('');
      setMessage('');
    } catch {
      setError('NETWORK UNREACHABLE');
      setState('error');
    }
  };

  const locked = state === 'sending' || state === 'sent';

  return (
    <div className="mx-auto max-w-3xl px-6 pb-24 pt-12 md:px-10 md:pt-16">
      <header className="mb-10 text-center">
        <p className="font-pixel text-[10px] tracking-widest text-text-muted">
          COMMS //
        </p>
        <h1 className="mt-3 font-pixel text-2xl text-cyan phosphor-cyan md:text-4xl">
          PRESS START TO MESSAGE
        </h1>
        <p className="mt-4 mx-auto max-w-xl font-body text-base leading-relaxed text-text-dim md:text-lg">
          Drop a quarter, leave a message. I read everything.
        </p>
      </header>

      <form
        onSubmit={submit}
        className="relative border-2 border-pink bg-bg-2 p-6"
        style={{
          boxShadow:
            'inset 0 0 30px 4px rgba(0,0,0,0.5), 0 0 18px rgba(255,44,159,0.18)',
        }}
      >
        <PixelText size="xs" color="pink" glow>
          ◆ INSERT TRANSMISSION ◆
        </PixelText>

        <div className="mt-6 grid gap-5">
          <Field
            label="PLAYER NAME"
            value={name}
            onChange={setName}
            disabled={locked}
            required
          />
          <Field
            label="UPLINK ADDRESS"
            type="email"
            value={email}
            onChange={setEmail}
            disabled={locked}
            required
          />
          <div>
            <label className="block font-pixel text-[10px] tracking-widest text-text-muted">
              MESSAGE //
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              disabled={locked}
              required
              rows={5}
              maxLength={4000}
              className={cn(
                'mt-2 w-full border-2 border-border bg-bg px-3 py-2',
                'font-body text-base text-text placeholder:text-text-muted',
                'focus:border-cyan focus:outline-none disabled:opacity-60',
              )}
              placeholder="Drop a message..."
            />
          </div>
          {/* Honeypot */}
          <input
            type="text"
            value={honeypot}
            onChange={(e) => setHoneypot(e.target.value)}
            tabIndex={-1}
            autoComplete="off"
            className="absolute left-[-9999px] h-0 w-0"
            aria-hidden
          />
        </div>

        <div className="mt-6 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-pixel text-[10px] tracking-widest text-text-muted">
            {state === 'sent' ? (
              <span className="text-green phosphor-green">★ TRANSMISSION SENT</span>
            ) : state === 'sending' ? (
              <span className="text-yellow phosphor-yellow animate-blink">
                TRANSMITTING...
              </span>
            ) : error ? (
              <span className="text-pink phosphor-pink">{error}</span>
            ) : (
              'STATUS // READY'
            )}
          </p>
          <CoinSlotButton
            type="submit"
            color={state === 'sent' ? 'green' : 'pink'}
            disabled={locked}
          >
            {state === 'sending'
              ? '[ SENDING... ]'
              : state === 'sent'
                ? '[ SENT ★ ]'
                : '[ PRESS START ]'}
          </CoinSlotButton>
        </div>
      </form>

      <div className="mt-10 grid gap-3 sm:grid-cols-2">
        <a
          href="https://github.com/Prasham27"
          target="_blank"
          rel="noreferrer"
          className="border-2 border-border bg-bg-2 p-4 transition-colors hover:border-green"
        >
          <PixelText size="xs" color="green">
            GITHUB //
          </PixelText>
          <p className="mt-2 font-body text-base text-text">@Prasham27</p>
        </a>
        <div className="border-2 border-border bg-bg-2 p-4">
          <PixelText size="xs" color="cyan">
            LOCATION //
          </PixelText>
          <p className="mt-2 font-body text-base text-text">Gandhinagar, IN</p>
        </div>
      </div>
    </div>
  );
}

interface FieldProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: 'text' | 'email';
  required?: boolean;
  disabled?: boolean;
}

function Field({
  label,
  value,
  onChange,
  type = 'text',
  required,
  disabled,
}: FieldProps) {
  return (
    <div>
      <label className="block font-pixel text-[10px] tracking-widest text-text-muted">
        {label} //
      </label>
      <input
        type={type}
        value={value}
        required={required}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        className={cn(
          'mt-2 w-full border-2 border-border bg-bg px-3 py-2',
          'font-body text-base text-text placeholder:text-text-muted',
          'focus:border-cyan focus:outline-none disabled:opacity-60',
        )}
      />
    </div>
  );
}

import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

interface Body {
  name?: string;
  email?: string;
  message?: string;
  honeypot?: string;
}

export async function POST(req: Request): Promise<Response> {
  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }

  const name = (body.name ?? '').trim();
  const email = (body.email ?? '').trim();
  const message = (body.message ?? '').trim();
  if (!name || !email || !message) {
    return NextResponse.json({ error: 'All fields required' }, { status: 400 });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: 'Invalid email' }, { status: 400 });
  }
  if (name.length > 100 || email.length > 200 || message.length > 4000) {
    return NextResponse.json({ error: 'Field too long' }, { status: 400 });
  }
  if (body.honeypot && body.honeypot.length > 0) {
    // Silent drop on honeypot
    return NextResponse.json({ ok: true });
  }

  const apiKey = process.env.RESEND_API_KEY;
  const toEmail = process.env.CONTACT_TO_EMAIL;
  if (!apiKey || !toEmail) {
    return NextResponse.json(
      {
        error:
          'Comms offline — RESEND_API_KEY or CONTACT_TO_EMAIL not configured.',
      },
      { status: 503 },
    );
  }

  try {
    // Lazy-import Resend so the build doesn't require the dep at install time.
    const { Resend } = await import('resend').catch(() => ({ Resend: null as never }));
    if (!Resend) {
      return NextResponse.json(
        { error: 'Comms offline — resend package not installed.' },
        { status: 503 },
      );
    }
    const resend = new Resend(apiKey);
    const { error } = await resend.emails.send({
      from: 'PRASHAMOID Comms <onboarding@resend.dev>',
      to: toEmail,
      replyTo: email,
      subject: `[PRASHAMOID] ${name}`,
      text: `From: ${name} <${email}>\n\n${message}`,
    });
    if (error) {
      console.error('[comms] resend error:', error);
      return NextResponse.json(
        { error: 'Transmission failed.' },
        { status: 502 },
      );
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[comms] resend threw:', err);
    return NextResponse.json(
      { error: 'Transmission failed.' },
      { status: 502 },
    );
  }
}

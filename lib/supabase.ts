// Server-only Supabase client. Returns null if env vars are missing — the
// scores route falls back to in-memory storage so the app never breaks
// when Supabase isn't configured yet.

import { createClient, type SupabaseClient } from '@supabase/supabase-js';

let cached: SupabaseClient | null = null;
let triedInit = false;

export function getSupabase(): SupabaseClient | null {
  if (triedInit) return cached;
  triedInit = true;
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  cached = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return cached;
}

export function isSupabaseConfigured(): boolean {
  return !!(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

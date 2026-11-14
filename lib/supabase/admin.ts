// Owner: Oggy. Supabase client with the SERVICE-ROLE key: it bypasses RLS.
// Used ONLY by app/api/stripe/webhook/route.ts (plan approved by Karma 15 Nov 2026), because
// Stripe's webhook arrives without a user session. Every other part of the app uses
// lib/supabase/server.ts or client.ts so RLS protects the data (NFR-02).
// Never import this from a 'use client' file or anywhere else without an approved plan.
import 'server-only';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/lib/types';

export function createServiceRoleClient() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) throw new Error('SUPABASE_SERVICE_ROLE_KEY is not set');
  return createClient<Database>(process.env.NEXT_PUBLIC_SUPABASE_URL!, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

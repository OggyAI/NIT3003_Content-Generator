// Owner: Oggy. Who is an admin (migration 003, approved Admin plan 14 Nov 2026).
// The role lives in app_metadata, which users can't edit, and arrives in the signed JWT.
// This only decides what the app SHOWS (the Admin link, the /admin page); the database
// functions check the same claim themselves, so hiding the UI is not the security boundary.
import { cache } from 'react';
import { createClient } from '@/lib/supabase/server';

/** Request-scoped (React.cache), so the nav and the page share one check */
export const isAdmin = cache(async (): Promise<boolean> => {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const appMetadata = data?.claims?.app_metadata as { role?: unknown } | undefined;
  return appMetadata?.role === 'admin';
});

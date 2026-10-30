// Owner: Oggy. Supabase client for SERVER code: server components,
// server actions and route handlers (app/api/*).
// Usage:
//   const supabase = await createClient();
//   const { data: { user } } = await supabase.auth.getUser();
// Always check the user on the server before trusting a request.
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import type { Database } from '@/lib/types';

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // Called from a server component, where cookies are read-only.
            // Safe to ignore: proxy.ts refreshes the session on every request.
          }
        },
      },
    },
  );
}

/**
 * Returns the signed-in user's business id, or null if not signed in.
 * RLS already limits the query to the user's own row.
 */
export async function getMyBusinessId(): Promise<string | null> {
  const supabase = await createClient();
  const { data } = await supabase.from('business_profile').select('id').maybeSingle();
  return data?.id ?? null;
}

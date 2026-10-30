// Owner: Oggy. Supabase client for CLIENT components ('use client').
// Usage:
//   const supabase = createClient();
//   const { data, error } = await supabase.from('products').select('*');
// RLS means queries only ever return the logged-in user's own rows.
import { createBrowserClient } from '@supabase/ssr';
import type { Database } from '@/lib/types';

export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}

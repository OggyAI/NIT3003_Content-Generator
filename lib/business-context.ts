// Owner: Oggy. Loads everything the AI needs to know about the signed-in
// user's business (FR-03 to FR-06) and reports what is still missing.
// Used by /generate (to warn early) and /api/generate (to refuse with 400).
import type { SupabaseClient } from '@supabase/supabase-js';
import type { BrandVoiceOption, Database } from '@/lib/types';

export type BusinessContext = {
  businessId: string;
  businessName: string;
  industry: string | null;
  description: string | null;
  voice: BrandVoiceOption | null;
  audience: { description: string | null; ageRange: string | null; interests: string | null } | null;
  products: { name: string; description: string | null }[];
  /** Human-readable list of what still has to be filled in. Empty = complete. */
  missing: string[];
};

/**
 * Returns null when there is no business row (e.g. not signed in).
 * RLS guarantees every query only sees the signed-in user's own rows.
 */
export async function getBusinessContext(
  supabase: SupabaseClient<Database>,
): Promise<BusinessContext | null> {
  const { data: business } = await supabase
    .from('business_profile')
    .select('id, business_name, industry, description')
    .maybeSingle();
  if (!business) return null;

  const [voiceRes, audienceRes, productsRes] = await Promise.all([
    supabase.from('brand_voice').select('voice').eq('business_id', business.id).maybeSingle(),
    supabase
      .from('target_audience')
      .select('description, age_range, interests')
      .eq('business_id', business.id)
      .maybeSingle(),
    supabase
      .from('products')
      .select('name, description')
      .eq('business_id', business.id)
      .order('created_at', { ascending: true })
      .limit(10),
  ]);

  const voice = voiceRes.data?.voice ?? null;
  const audience = audienceRes.data
    ? {
        description: audienceRes.data.description,
        ageRange: audienceRes.data.age_range,
        interests: audienceRes.data.interests,
      }
    : null;

  // "Complete" = business name, industry, brand voice and audience description (PROJECT_CONTEXT.md).
  const missing: string[] = [];
  if (!business.business_name?.trim()) missing.push('business name');
  if (!business.industry?.trim()) missing.push('industry');
  if (!voice) missing.push('brand voice');
  if (!audience?.description?.trim()) missing.push('target audience');

  return {
    businessId: business.id,
    businessName: business.business_name,
    industry: business.industry,
    description: business.description,
    voice,
    audience,
    products: productsRes.data ?? [],
    missing,
  };
}

// Owner: Oggy. TypeScript shapes of our database tables and API contracts.
// Mirrors supabase/schema.sql — if the schema changes, update this file
// in the same pull request.

export type ContentType = 'blog' | 'social' | 'email';
export type Platform = 'instagram' | 'facebook';
export type BrandVoiceOption = 'professional' | 'friendly' | 'casual' | 'persuasive';
export type RequestStatus = 'success' | 'failed';

type Table<Row, Insert, Update = Partial<Insert>> = {
  Row: Row;
  Insert: Insert;
  Update: Update;
  Relationships: [];
};

export type BusinessProfile = {
  id: string;
  owner_id: string;
  business_name: string;
  industry: string | null;
  description: string | null;
  /** Settings defaults (migration 002). null = Generate starts on Social post / Instagram */
  default_content_type: ContentType | null;
  default_platform: Platform | null;
  created_at: string;
  updated_at: string;
};

export type BrandVoice = {
  id: string;
  business_id: string;
  voice: BrandVoiceOption;
  created_at: string;
  updated_at: string;
};

export type Product = {
  id: string;
  business_id: string;
  name: string;
  description: string | null;
  created_at: string;
};

export type TargetAudience = {
  id: string;
  business_id: string;
  description: string | null;
  age_range: string | null;
  interests: string | null;
  created_at: string;
  updated_at: string;
};

export type ContentRequest = {
  id: string;
  business_id: string;
  content_type: ContentType;
  platform: Platform | null;
  user_request: string;
  status: RequestStatus;
  generation_ms: number | null;
  created_at: string;
};

export type GeneratedContent = {
  id: string;
  business_id: string;
  request_id: string | null;
  content_type: ContentType;
  title: string | null;
  body: string;
  keywords: string[];
  is_draft: boolean;
  seo_score: number | null;
  tone_match: boolean | null;
  created_at: string;
  updated_at: string;
};

// Supabase client typing: createClient() returns typed .from('...') queries.
export type Database = {
  public: {
    Tables: {
      business_profile: Table<
        BusinessProfile,
        {
          owner_id: string;
          business_name: string;
          industry?: string | null;
          description?: string | null;
          default_content_type?: ContentType | null;
          default_platform?: Platform | null;
        }
      >;
      brand_voice: Table<BrandVoice, { business_id: string; voice: BrandVoiceOption }>;
      products: Table<Product, { business_id: string; name: string; description?: string | null }>;
      target_audience: Table<
        TargetAudience,
        { business_id: string; description?: string | null; age_range?: string | null; interests?: string | null }
      >;
      content_requests: Table<
        ContentRequest,
        {
          business_id: string;
          content_type: ContentType;
          platform?: Platform | null;
          user_request: string;
          status?: RequestStatus;
          generation_ms?: number | null;
        }
      >;
      generated_content: Table<
        GeneratedContent,
        {
          business_id: string;
          content_type: ContentType;
          body: string;
          request_id?: string | null;
          title?: string | null;
          keywords?: string[];
          is_draft?: boolean;
          seo_score?: number | null;
          tone_match?: boolean | null;
        }
      >;
      // Migration 004: written only by the Stripe webhook (service role); users can read their own row
      subscriptions: Table<
        Subscription,
        {
          business_id: string;
          stripe_customer_id: string;
          stripe_subscription_id?: string | null;
          status?: string;
          price_id?: string | null;
          current_period_end?: string | null;
          cancel_at_period_end?: boolean;
          updated_at?: string;
        }
      >;
      // Migration 004: read-only for users; changed only through record_generation()
      generation_usage: Table<
        { business_id: string; month: string; count: number },
        { business_id: string; month: string; count?: number }
      >;
    };
    Views: Record<string, never>;
    Functions: {
      my_business_id: { Args: Record<string, never>; Returns: string | null };
      // Migration 002: deletes the caller's own auth user (data cascades)
      delete_my_account: { Args: Record<string, never>; Returns: undefined };
      // Migration 003: admin functions (each checks app_metadata.role = 'admin' itself)
      is_admin: { Args: Record<string, never>; Returns: boolean };
      admin_business_overview: { Args: Record<string, never>; Returns: AdminBusinessRow[] };
      admin_set_account_disabled: { Args: { target_business: string; disable: boolean }; Returns: undefined };
      // Migration 004: this month's successful generations, and +1 for the caller's own business
      my_monthly_usage: { Args: Record<string, never>; Returns: number };
      record_generation: { Args: Record<string, never>; Returns: undefined };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};

// ---- API contracts (see docs/PROJECT_CONTEXT.md) ----

export type GenerateRequest = {
  contentType: ContentType;
  platform?: Platform;
  request: string;
  keywords?: string[];
};

/**
 * Why a model call failed, sent with 503 generation_failed so the UI can say something useful.
 * quota = the OpenAI account is out of credit; rate_limit = too many requests just now;
 * config = bad key or unknown model; timeout = no answer in time; unknown = anything else.
 */
export type GenerationFailureReason = 'quota' | 'rate_limit' | 'config' | 'timeout' | 'unknown';

export type GenerateResponse =
  | { contentId: string; title: string; body: string; generationMs: number }
  | {
      error:
        | 'profile_incomplete'
        | 'generation_failed'
        | 'save_failed'
        | 'invalid_request'
        | 'unauthorised'
        | 'limit_reached';
      message?: string;
      missing?: string[];
      /** Only with generation_failed (added in the UI overhaul; optional, so older clients ignore it) */
      reason?: GenerationFailureReason;
      /** Only with limit_reached (402, migration 004) */
      plan?: Plan;
      used?: number;
      limit?: number;
    };

export type AnalyseRequest = {
  contentId: string;
  analysisType: 'seo' | 'tone' | 'both';
};

export type KeywordStat = { keyword: string; occurrences: number; density: number };

export type AnalyseResponse = {
  seoScore: number | null;
  keywordStats: KeywordStat[];
  /** SEO tip (null when SEO wasn't requested). */
  seoSuggestion: string | null;
  toneMatch: boolean | null;
  detectedTone: string | null;
  /** Tone tip (null when tone wasn't requested or the tone check failed). */
  suggestion: string | null;
  /** Set when a tone check was requested but the AI service failed. */
  toneError?: string;
};

export type ContentSaveRequest = { title: string; body: string; keywords: string[] };

/** A business's Stripe subscription (migration 004). Pro while status is active or trialing. */
export type Subscription = {
  business_id: string;
  stripe_customer_id: string;
  stripe_subscription_id: string | null;
  status: string;
  price_id: string | null;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
  updated_at: string;
};

export type Plan = 'free' | 'pro';

/** Sent with 402 limit_reached from POST /api/generate when this month's generations are used up */
export type LimitReachedResponse = { error: 'limit_reached'; plan: Plan; used: number; limit: number };

/** One row of admin_business_overview() (migration 003): business-level totals only, no personal data */
export type AdminBusinessRow = {
  business_id: string;
  business_name: string;
  industry: string | null;
  joined_at: string;
  draft_count: number;
  request_count: number;
  failed_requests: number;
  /** Average generation_ms of successful requests; null when there are none */
  avg_generation_ms: number | null;
  last_active_at: string | null;
  is_admin: boolean;
  disabled: boolean;
};

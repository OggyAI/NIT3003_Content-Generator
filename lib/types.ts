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
        { owner_id: string; business_name: string; industry?: string | null; description?: string | null }
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
    };
    Views: Record<string, never>;
    Functions: { my_business_id: { Args: Record<string, never>; Returns: string | null } };
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

export type GenerateResponse =
  | { contentId: string; title: string; body: string; generationMs: number }
  | { error: 'profile_incomplete' | 'generation_failed' | 'invalid_request' | 'unauthorised' };

export type AnalyseRequest = {
  contentId: string;
  analysisType: 'seo' | 'tone' | 'both';
};

export type KeywordStat = { keyword: string; occurrences: number; density: number };

export type AnalyseResponse = {
  seoScore: number | null;
  keywordStats: KeywordStat[];
  toneMatch: boolean | null;
  detectedTone: string | null;
  suggestion: string | null;
};

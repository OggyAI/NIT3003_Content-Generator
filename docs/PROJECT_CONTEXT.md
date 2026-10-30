# Project context — paste or attach this before asking an LLM for help

This is the current version of the "Block 0" shared context. If it differs from the prompt you were sent earlier, **this file wins** (it reflects the real repo).

I'm one of 4 students building our IT Capstone 2 project at Victoria University: "AI-Powered Content Generation Engine for Small Businesses". It is a multi-tenant SaaS where a small business owner saves a business profile (industry, products, target audience, brand voice) and generates blog, social media and email content from it via the OpenAI API, then edits it, saves drafts, views history, and runs SEO and tone analysis. Our Capstone 1 proposal is the source of truth for requirements (FR-01–FR-16, NFR-01–NFR-12), use cases, the sequence diagram, pseudocode and UI mockups.

## Deadline
Progress report due Fri 6 Nov 2026, 11:59 pm: diary plus a live demo of 80% completion = all Must-Have requirements FR-01–FR-13 working end-to-end on the deployed app; FR-14–FR-16 may be basic. Final delivery Week 4. Prefer the simplest approach that works; don't add features outside the proposal.

## Team
- Oggy: repo, Supabase and Vercel setup, database schema; AI pipeline (FR-08–FR-16)
- Nicolas: authentication and business configuration (FR-01–FR-07)
- Harry: UI shell, shared components and styling from our Figma mockups
- Kerem: diary, test plan, demo slides, schedule

## Stack (fixed — check versions in package.json)
- **Next.js 16** App Router + TypeScript + **Tailwind CSS v4** + React 19. These are newer than many LLMs' training data:
  - `middleware.ts` is now **`proxy.ts`** exporting `export async function proxy(request)`.
  - Tailwind v4 has **no `tailwind.config.js`**: design tokens go in `app/globals.css` inside `@theme { ... }`.
  - Dynamic route `params` and `cookies()` are **async** (`await params`, `await cookies()`).
  - If unsure about a Next.js API, read the docs bundled in `node_modules/next/dist/docs/`.
- Supabase (Auth, Postgres, row-level security) via `@supabase/ssr`; OpenAI Node SDK with the model from env `OPENAI_MODEL`; Vercel hosting; GitHub.
- Env vars: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `OPENAI_API_KEY`, `OPENAI_MODEL`. `OPENAI_API_KEY` is server-only: never in client components; never commit `.env.local`.

## Ready-made helpers (use these, don't write your own)
- Client components: `import { createClient } from '@/lib/supabase/client'` → `const supabase = createClient()`
- Server components / server actions / route handlers: `import { createClient, getMyBusinessId } from '@/lib/supabase/server'` → `const supabase = await createClient()`
- Table and API types: `@/lib/types` (`BusinessProfile`, `Product`, `GeneratedContent`, `GenerateRequest`, …). Queries are typed: `supabase.from('products')` knows the columns.
- `proxy.ts` already refreshes the session and redirects logged-out users from protected pages to `/login?next=<path>`.

## Database contract (Oggy owns `supabase/schema.sql` — don't rename tables/columns without asking)
All ids are uuid; every table has `created_at`; RLS is on everywhere: a user can only read/write rows of their own business (`business_profile.owner_id = auth.uid()`). You never need to filter by user yourself for security, but you must still supply `business_id` on inserts (use `getMyBusinessId()`).
- `business_profile`: id, owner_id (unique), business_name, industry, description, updated_at — created automatically at sign-up from user metadata `business_name`. Users can't delete it.
- `brand_voice`: id, business_id (unique), voice ∈ professional | friendly | casual | persuasive, updated_at
- `products`: id, business_id, name, description
- `target_audience`: id, business_id (unique), description, age_range, interests, updated_at
- `content_requests`: id, business_id, content_type ∈ blog | social | email, platform ∈ instagram | facebook | null (social only), user_request, status ∈ success | failed, generation_ms
- `generated_content`: id, business_id, request_id, content_type, title, body, keywords text[], is_draft (default true), seo_score numeric(3,2) 0–1, tone_match boolean, updated_at

For one-per-business tables (brand_voice, target_audience) save with `.upsert({...}, { onConflict: 'business_id' })`.
A profile is "complete" when business_name, industry, a brand_voice row and a target_audience description all exist.

## API contract
- `POST /api/generate` `{contentType, platform?, request, keywords?}` → 200 `{contentId, title, body, generationMs}` | 400 `{error:"profile_incomplete"}` | 503 `{error:"generation_failed"}`. On failure the page keeps the user's typed request (NFR-05).
- `POST /api/analyse` `{contentId, analysisType: 'seo'|'tone'|'both'}` → 200 `{seoScore, keywordStats, toneMatch, detectedTone, suggestion}`

## Folder ownership (avoids merge conflicts)
- Harry: `app/layout.tsx`, `app/globals.css`, `components/ui/*`, `components/Sidebar.tsx`, `app/dashboard`, `app/styleguide`
- Nicolas: `app/(auth)/login`, `app/(auth)/register`, `app/profile`, `proxy.ts`
- Oggy: `supabase/*`, `lib/supabase/*`, `lib/types.ts`, `lib/prompt-builder.ts`, `lib/analysis/*`, `app/api/*`, `app/generate`, `app/editor/[id]`, `app/history`, `app/page.tsx`
Each person works on their own branch and opens small pull requests into `main` often.

## Design tokens (from our Figma)
Font Inter. Navy #1E3A8A (primary buttons, sidebar), teal #14B8A6 (selected/active), success #22C55E, warning #F59E0B, background #F8FAFC. 8px spacing grid, labels above inputs, WCAG 2.1 AA contrast, visible keyboard focus. Layout: navy left sidebar, centred white card on light grey.

## How to help me
I'm a student: explain briefly what each step does. Give complete files with paths, not fragments. Small steps, and tell me how to test each before moving on. If anything I ask conflicts with this file, point it out instead of silently changing it.

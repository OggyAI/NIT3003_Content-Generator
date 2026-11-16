# Project context: paste or attach this before asking an LLM for help

Updated 16 Nov 2026, after the UI overhaul (PR #15), Settings (#16), Admin (#17), the visual refresh (#18) and Billing (#19). If this differs from an earlier version or prompt, **this file wins**.

I'm one of 4 students building our IT Capstone 2 project at Victoria University: "AI-Powered Content Generation Engine for Small Businesses" (shown in the app as **AI Content Generator**).

**What it does:**
- It's a multi-tenant web app for small business owners (the running example is a local café).
- The owner saves a business profile: details, products and services, target audience and brand voice.
- They generate blog outlines, Instagram or Facebook posts, and marketing emails from it with the OpenAI API.
- They edit the drafts, save them, browse Draft History, and run a keyword (SEO) check and a brand-tone check.

Our Capstone 1 proposal is the source of truth for requirements (FR-01 to FR-16, NFR-01 to NFR-12).

Live site: https://nit-3003-content-generator.vercel.app (Vercel deploys `main`).

## Deadlines
- **UI freeze: Wed 18 Nov 2026.** After this, bug fixes only, and no visual changes, so screenshots for the manual and demo stay valid.
- **Final delivery: Mon 23 Nov 2026.** Code, demo video, user manual and technical document.

## Team
| Person | Role now | Built earlier |
|---|---|---|
| Karma Tenzin (GitHub `OggyAI`, "Oggy" in older notes) | Lead developer for the overhaul, Settings, Admin and Billing | Repo, Supabase and Vercel setup, schema and RLS, AI pipeline |
| Nicolas Gale | Demo video | Register, login, business profile, password reset |
| Harry Barbosa | User manual, README, installation guide | Original design system, app shell, dashboard; the visual refresh look |
| Kerem Oktay | Poster, slides, testing, peer reviews | Design review, SEO rubric |

## Features (what a user can do)
- **Sign up, log in, log out, reset password** by email. Passwords must meet the NFR-01 rules, shown as a live checklist.
- **Dashboard:**
  - greets the business by name;
  - one main action: "Complete business profile" (listing what's missing) or "Create content";
  - the 5 most recent drafts, and a "View all drafts" link.
- **Business profile:** four sections:
  - Business details;
  - Products and services (up to 20, **editable in place**);
  - Target audience;
  - Brand voice: professional, friendly, casual or persuasive.
  It shows "N of 4 required details filled in".
- **Create content** (`/generate`):
  - choose a format (social, blog or email), and Instagram or Facebook for social;
  - write a brief (5–500 characters), plus optional keywords (up to 10).
  - "Writing for <business> · <voice>" sits under the title.
  - The form stays visible while generating.
  - Errors say what went wrong (quota, rate limit, setup, timeout) and offer Retry, keeping everything typed.
  - The result has Open in editor, Copy, Regenerate (always a new draft) and Create another.
- **Editor** (`/editor/[id]`):
  - one header with the save state ("Saved 2 min ago" / "Unsaved changes");
  - Save draft, Save as new version, Duplicate, Copy, Export (.txt or .md), and Delete with two steps;
  - the text box grows with the text;
  - the analysis panel sits beside the text on wide screens and below it on mobile:
    - **Keyword score:** 70% keywords in the body, 30% in the title;
    - **Tone check:** does the draft sound like the saved brand voice?
  - Results are marked out of date as soon as the text changes.
- **Draft history** (`/history`):
  - a compact list with format filters (All, Social, Blog, Email);
  - search (`?q=`, title and body);
  - Open and Duplicate on each draft;
  - **Export CSV** of the listed drafts.
- **Settings** (`/settings`):
  - change password (needs the current one);
  - change email (applies straight away, because email confirmation is off);
  - content defaults: the format and platform Create content starts on;
  - **Plan and billing;**
  - delete account: two steps, type the business name and enter the password. It cancels any Pro subscription first.
- **Plans** (Stripe, **test mode only**):
  - Free: 10 generations a month (Melbourne calendar month).
  - Pro: A$19/month, fair use up to 200.
  - Only successful generations count.
  - Generate shows "X of 10 free generations used this month". At the limit it shows a message that keeps the brief and links to "See Pro".
  - Upgrading goes through Stripe Checkout (test card `4242 4242 4242 4242`, any future expiry and CVC).
  - "Manage billing" opens the Stripe portal, for cancelling or changing the card.
- **Admin** (`/admin`, admins only; everyone else gets the normal 404):
  - totals per business: drafts, requests, failures, average generation time, last active;
  - disable or re-enable an account.
  - It shows no emails and no draft text.
  - Admins are set by hand in the Supabase SQL editor (`app_metadata.role = 'admin'`).
- **`/styleguide`** (public): every UI component. It's the reference for the manual's screenshots.

## Look and layout (visual refresh v2; `app/globals.css` and `/styleguide` are the reference)
- **Sidebar:** white on every signed-in page, with the product mark, the business name, a "New content" button and SVG icons. Links: Dashboard, Create content, Draft history, Business profile, Settings, and Admin for admins only. Log out sits at the bottom. On mobile (below 768px), a top bar opens a slide-in menu with the same links.
- **Pages:** content aligned to the top and left, with a page header (title, description, actions).
- **Auth pages:** a navy brand panel with an example output on large screens.
- **Fonts:** Plus Jakarta Sans for headings, Inter for everything else.
- **Shapes:** pill-shaped buttons, badges and filters; cards with 20px radius.
- **Colours:**
  - navy `#1E3A8A` (primary, links, focus);
  - teal `#14B8A6` (accent fills only, never text);
  - teal-700 `#0F766E` (teal text);
  - page `#F6F8FC`, ink `#0F172A`, muted `#5E6B7F`;
  - form borders `#878E9C`, decorative lines `#E3E8F0`;
  - danger `#B91C1C`.
- **Format colours:** social teal, blog navy, email amber.
- **Accessibility:** WCAG 2.1 AA, a skip link, visible focus, a reduced-motion rule.

## Stack (check versions in package.json)
- **Next.js 16.4** App Router + TypeScript + **Tailwind CSS v4** + React 19. These are newer than many LLMs' training data:
  - Middleware is **`proxy.ts`**, which exports `proxy()`. Its `PROTECTED` list is `/dashboard`, `/profile`, `/generate`, `/editor`, `/history`, `/settings` and `/admin`.
  - There's no `tailwind.config.js`. Tokens live in `app/globals.css` under `@theme`.
  - `params`, `searchParams` and `cookies()` are async (`await params`).
  - When unsure, read `node_modules/next/dist/docs/`.
- **Services:**
  - Supabase: Auth, Postgres, row-level security; Sydney region.
  - OpenAI Responses API: model from `OPENAI_MODEL`, default `gpt-5.4-mini`.
  - Stripe: SDK `stripe`, test mode.
  - Vercel.
- **Env vars:**
  - Public: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
  - **Server-only:** `OPENAI_API_KEY`, `OPENAI_MODEL`, `STRIPE_SECRET_KEY`, `STRIPE_PRO_PRICE_ID`, `STRIPE_WEBHOOK_SECRET`, `SUPABASE_SERVICE_ROLE_KEY`. The last one is used only by the Stripe webhook.
  - Never commit `.env.local`, and never paste keys into an LLM or a screenshot.

## Database (never re-run `supabase/schema.sql` on the live project: it deletes all data)
**RLS:** it's on for every table, and a user only sees their own business's rows.

**Migrations:** changes go in numbered files in `supabase/migrations/`:
- `001` request and draft must share a business;
- `002` content defaults (`default_content_type` and `default_platform` on `business_profile`), plus `delete_my_account()`;
- `003` admin functions: `is_admin()`, `admin_business_overview()`, `admin_set_account_disabled()`;
- `004` billing: `subscriptions`, written only by the Stripe webhook, and `generation_usage`, a monthly counter that users can read but never write; `record_generation()` adds one.

**Tables:**
- `business_profile`, `brand_voice`, `products` (≤500 characters each), `target_audience`;
- `content_requests`: logs every generation, with `status` and `generation_ms`;
- `generated_content`: drafts, with `seo_score` and `tone_match`;
- `subscriptions`, `generation_usage`.

**Profile completeness rule:** the profile is complete when the business name, industry, brand voice and audience description are all set. Generation is only allowed then.

**Tests:** run in the Supabase SQL editor; every row should say pass.
- `supabase/tests/rls_isolation_test.sql`: the original isolation checks, plus admin and billing checks.
- `supabase/tests/settings_test.sql`.

## API contract
- **`POST /api/generate`**
  - Body: `{contentType, platform?, request, keywords?}`.
  - Success: 200 `{contentId, title, body, generationMs}`.
  - Errors:
    - 400 `invalid_request` / `profile_incomplete` (with `missing[]`);
    - 401 `unauthorised`;
    - **402 `limit_reached`** with `{plan, used, limit}`;
    - 503 `generation_failed` with `reason`: `quota`, `rate_limit`, `config`, `timeout` or `unknown`;
    - 500 `save_failed`.
  - `generation_ms` times the AI call only (NFR-03 evidence).
- **`POST /api/analyse`**
  - Body: `{contentId, analysisType: 'seo'|'tone'|'both'}`.
  - Errors: 404, 400 `too_short` (under 20 words), 400 `no_brand_voice`, 503 `analysis_failed`.
- **`POST /api/billing/checkout`** returns a Stripe Checkout `{url}`. **`POST /api/billing/portal`** returns a portal `{url}`.
- **`POST /api/stripe/webhook`** is Stripe only. It checks the signature, and anything unsigned or forged gets 400.

## How to help me
I'm a student, so explain each step briefly. Give complete files with paths, not fragments. Work in small steps, and tell me how to test each one. If my request conflicts with this file, say so instead of silently changing things. After the 18 Nov freeze, suggest bug fixes only, not visual changes.

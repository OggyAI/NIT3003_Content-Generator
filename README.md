# AI Content Generator

**AI-Powered Content Generation Engine for Small Businesses**
IT Capstone Project 2 (NIT3003), Victoria University, 2026

A web app that helps small business owners write marketing content. A business saves its profile once (industry, products and services, target audience and brand voice), then generates blog posts, social media captions and email newsletters in that voice with the OpenAI API. Drafts can be edited, saved as versions, checked for SEO and tone, and found again in Draft history.

- **Live site:** https://nit-3003-content-generator.vercel.app
- **Source code:** https://github.com/OggyAI/NIT3003_Content-Generator
- **Full installation guide:** [`docs/INSTALLATION.md`](docs/INSTALLATION.md) (also the Installation section of the user manual)

---

## Team

| Name | Student ID | Responsibilities |
|---|---|---|
| Karma Tenzin (GitHub `OggyAI`) | s8114299 | Lead developer: repository, Supabase and Vercel setup, database and row-level security, AI pipeline, UI overhaul, Settings, Admin and Billing |
| Nicolas Gale | s8110424 | Register, login, business profile and password reset; demo video |
| Harry Barbosa | s8125060 | Original design system, app shell and dashboard, and the visual refresh look; user manual, README and installation guide |
| Kerem Oktay | s8129835 | Design review and SEO rubric; poster, slides, testing and peer reviews |

---

## Features

| Area | What it does | Requirements |
|---|---|---|
| Accounts | Register, log in, log out and reset a forgotten password. Passwords need 8+ characters with upper and lower case, a number and a symbol. | FR-01, FR-02, NFR-01 |
| Business profile | Business name, industry, description, products and services, target audience and one of four brand voices | FR-03 to FR-06 |
| Generate | Choose Social post (Instagram or Facebook), Blog post or Email newsletter, describe the goal, add optional SEO keywords | FR-07 to FR-11 |
| Editor | Edit a draft, save it, save it as a new version, or delete it | FR-12, FR-13 |
| Draft history | Every saved draft, newest first, filterable by type, with search, Open, Duplicate and CSV export | FR-14 |
| Analysis | Keyword-based SEO score and an AI check of whether the tone matches the brand voice, with suggestions | FR-15, FR-16 |
| Data isolation | Each business can only ever see its own data (Postgres row-level security, tested by SQL scripts) | NFR-02 |
| Settings and plans | Default content type, account deletion, and a Free plan (10 generations a month) or Pro plan via Stripe **test mode** | |
| Admin | Business-level usage totals for admin accounts only (no emails or draft text) | |
| Accessibility | Keyboard navigation with visible focus, skip link, WCAG 2.1 AA colour contrast, works from phone width to desktop | NFR-10, NFR-11 |

---

## Tech stack

| Layer | Technology |
|---|---|
| Web app | Next.js 16 (App Router), React 19, TypeScript |
| Styling | Tailwind CSS 4, Inter and Plus Jakarta Sans fonts |
| Database and login | Supabase (Postgres, Auth, row-level security) through `@supabase/ssr` |
| AI | OpenAI Node SDK; model set by `OPENAI_MODEL` (defaults to `gpt-5.4-mini`) |
| Payments (optional) | Stripe, test mode only |
| Hosting | Vercel; code on GitHub |

---

## Quick start (run it on your computer)

You need **Node.js 20 or newer** (the LTS version from nodejs.org), **Git**, and a **Supabase project** with the database set up (see the [installation guide](docs/INSTALLATION.md#3-set-up-the-database-in-supabase)).

```bash
git clone https://github.com/OggyAI/NIT3003_Content-Generator.git
cd NIT3003_Content-Generator
npm install
cp .env.example .env.local        # Windows PowerShell: Copy-Item .env.example .env.local
```

Open `.env.local` and fill in at least `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` and `OPENAI_API_KEY`. Then:

```bash
npm run dev
```

Open http://localhost:3000, register an account, complete the business profile, and generate your first post.

| Command | What it does |
|---|---|
| `npm run dev` | Starts the app for development at http://localhost:3000 |
| `npm run lint` | Checks the code for problems |
| `npm run build` | Builds the production version (run this before every pull request) |
| `npm start` | Runs the production build |

---

## Environment variables

Copy `.env.example` to `.env.local` and fill it in. **Never commit `.env.local`**; it is already in `.gitignore`.

| Variable | Needed for | Where to find it |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Everything | Supabase → Project Settings → API Keys |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Everything | Same page: the publishable (`sb_publishable_…`) or legacy anon key |
| `OPENAI_API_KEY` | Generating content, tone analysis | platform.openai.com → API keys |
| `OPENAI_MODEL` | Optional | Leave blank to use `gpt-5.4-mini` |
| `STRIPE_SECRET_KEY` | Optional: Pro plan | Stripe (test mode) → Developers → API keys (`sk_test_…` only) |
| `STRIPE_PRO_PRICE_ID` | Optional: Pro plan | Stripe → the Pro product's price (`price_…`) |
| `STRIPE_WEBHOOK_SECRET` | Optional: Pro plan | Stripe webhook endpoint, or `stripe listen` locally |
| `SUPABASE_SERVICE_ROLE_KEY` | Optional: Pro plan (Stripe webhook only) | Supabase → API Keys → secret / service_role key |

Without the Stripe variables the app still works fully on the Free plan; Settings shows "Payments aren't set up on this site yet." The OpenAI key, Stripe secret key and service role key are **server-only**: never put them in a variable starting with `NEXT_PUBLIC_`, and never share them.

---

## Project structure

| Path | What it holds |
|---|---|
| `app/(auth)/` | Register, login, forgot and reset password (the folder name doesn't appear in the URL) |
| `app/dashboard/` | Home screen: create panel, recent drafts and shortcuts |
| `app/profile/` | Business profile form |
| `app/generate/` | Content type selection and generation |
| `app/editor/[id]/` | Editor with SEO and tone analysis |
| `app/history/` | Draft history and export |
| `app/settings/`, `app/admin/` | Settings and billing; admin overview |
| `app/api/` | Server routes: `generate`, `analyse`, `billing`, `stripe/webhook` |
| `app/styleguide/` | Every shared UI component on one page |
| `components/` | App shell, sidebar, mobile menu, and the shared UI components in `components/ui/` |
| `lib/` | Supabase clients, prompt builder, SEO and tone analysis, billing, types |
| `proxy.ts` | Refreshes the login session and protects pages (Next.js 16's name for middleware) |
| `supabase/schema.sql` | All tables, the sign-up trigger and row-level security (first-time setup only) |
| `supabase/migrations/` | Database changes after first setup, run once each in number order |
| `supabase/tests/` | SQL tests for data isolation, settings, admin and billing |
| `docs/` | `PROJECT_CONTEXT.md` (contracts and conventions), installation guide, UI screenshots |

---

## Testing

- **Code checks:** `npm run lint` and `npm run build` must both pass.
- **Data isolation and permissions:** in the Supabase SQL Editor, run `supabase/tests/rls_isolation_test.sql` and `supabase/tests/settings_test.sql`. Every row in the results must show `pass = true`. The tests create and then delete their own throwaway users.
- **Manual testing:** the team's test plan covers FR-01 to FR-16 and the testable NFRs, including a two-account test showing one business cannot see another's data.

---

## Contributing (team workflow)

```bash
git checkout main && git pull
git checkout -b yourname/short-description
# make changes, then:
npm run lint && npm run build
git add -A && git commit -m "Short description of the change (FR number if any)"
git push -u origin yourname/short-description
```

Open a pull request into `main` on GitHub. Vercel builds a preview link for every pull request; check it before merging. Database changes go in a new numbered file in `supabase/migrations/`. Never re-run `schema.sql` on the live project, because it deletes every table.

---

## About this code zip

The submitted zip contains the source code only. It does **not** include `node_modules/` (run `npm install`), `.next/` (built by `npm run dev` or `npm run build`), or `.env.local` (secret keys; create your own from `.env.example`).

## Acknowledgements

Built with Next.js, Supabase, Tailwind CSS, the OpenAI API and Stripe. The team used AI assistants (such as Claude) for guidance and code suggestions; all code was reviewed and tested by the team, as recorded in the project diary.

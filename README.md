# AI-Powered Content Generation Engine for Small Businesses

IT Capstone 2 — Victoria University. Team: Kerem Oktay, Nicolas Gale, Karma Tenzin (Oggy), Harry Barbosa.

A multi-tenant web app where a small business saves its profile (industry, products, audience, brand voice) and generates blog, social media and email content with the OpenAI API, then edits, saves, reviews and analyses it.

**Before asking an LLM for help, give it [`docs/PROJECT_CONTEXT.md`](docs/PROJECT_CONTEXT.md).** It holds the database and API contracts, folder ownership and design tokens, and notes where Next.js 16 differs from older versions.

---

## Teammate setup (Nicolas, Harry, Kerem)

You need Node.js 20 or newer and Git.

```bash
git clone <repo-url>
cd capstone-app
npm install
cp .env.example .env.local      # Windows PowerShell: copy .env.example .env.local
```

Put the Supabase URL and key Oggy shares in the group chat into `.env.local`. Leave `OPENAI_API_KEY` blank — test AI generation on the Vercel deployment instead.

```bash
npm run dev                     # open http://localhost:3000
```

### Daily workflow

```bash
git checkout main && git pull
git checkout -b nicolas/register-page    # your-name/what-you're-doing
# ...work, then:
npm run lint && npm run build            # must pass before you push
git add -A && git commit -m "Add register form with password validation (FR-01)"
git push -u origin nicolas/register-page
```

Then open a pull request into `main` on GitHub. Keep pull requests small and only touch files in your own folders (see PROJECT_CONTEXT.md). Mention the FR number in the commit message; it helps the diary and the peer review.

---

## Project layout

| Path | What it is | Owner |
|---|---|---|
| `supabase/schema.sql` | All tables, sign-up trigger, row-level security | Oggy |
| `supabase/tests/rls_isolation_test.sql` | Proves one business can't see another's data | Oggy |
| `lib/supabase/client.ts`, `server.ts` | Ready-made Supabase clients | Oggy |
| `lib/types.ts` | Table and API types | Oggy |
| `proxy.ts` | Session refresh + protected routes (Next 16's name for middleware) | Nicolas |
| `app/(auth)/*`, `app/profile` | Login, register, business profile | Nicolas |
| `app/layout.tsx`, `app/globals.css`, `components/*`, `app/dashboard`, `app/styleguide` | Design system and shell | Harry |
| `app/generate`, `app/editor/[id]`, `app/history`, `app/api/*`, `lib/prompt-builder.ts`, `lib/analysis/*` | AI pipeline | Oggy |

---

## One-time infrastructure setup (Oggy)

### 1. GitHub
Create an empty private repo (no README), then from this folder:

```bash
git init
git add -A
git commit -m "Initial scaffold: Next.js app, Supabase schema and RLS, project context"
git branch -M main
git remote add origin https://github.com/<you>/<repo>.git
git push -u origin main
```

Invite Nicolas, Harry and Kerem as collaborators (Settings → Collaborators). Optional: Settings → Branches → protect `main` so changes arrive by pull request.

### 2. Supabase
1. Create a project at supabase.com (region: Sydney).
2. **SQL Editor** → paste `supabase/schema.sql` → Run.
3. **SQL Editor** → paste `supabase/tests/rls_isolation_test.sql` → Run. Every row should show `pass = true`. Screenshot it for the test plan.
4. **Authentication → Sign In / Providers → Email**: turn off *Confirm email* for development (turn it back on before the final demo if you set up email).
5. **Authentication → Sign In / Providers → Email** (password settings): minimum length 8 and require lowercase, uppercase, digits and symbols (NFR-01). Nicolas validates this in the form too.
6. **Authentication → URL Configuration**: set Site URL to the Vercel production URL (after step 3 below); add `http://localhost:3000/**` and the Vercel URL with `/**` to Redirect URLs.
7. **Project Settings → API Keys**: copy the project URL and the publishable (or legacy anon) key for the team. Never share the secret / service_role key.

### 3. Vercel
1. vercel.com → Add New → Project → import the GitHub repo (framework: Next.js, defaults are fine).
2. Environment Variables (Production and Preview): `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `OPENAI_API_KEY`, `OPENAI_MODEL`.
3. Deploy. Every pull request now gets a preview URL.
4. So teammates can open preview links without your Vercel login: Settings → Deployment Protection → turn off Vercel Authentication (or test on production after merging).

### 4. OpenAI
Create a project API key at platform.openai.com, put it only in Vercel and your own `.env.local`, and set a monthly budget limit on the account (risk R9). Pick a cheap current model for `OPENAI_MODEL`.

---

## Requirement traceability (progress so far)

| Requirement | Where | Status |
|---|---|---|
| NFR-02, FR-13 data isolation | `supabase/schema.sql` RLS, verified by `supabase/tests/rls_isolation_test.sql` | Done |
| FR-01 account → business link | Sign-up trigger in `schema.sql` | Done (form pending) |
| Protected pages | `proxy.ts` | Starter version |
| FR-01–FR-16 pages and API | Placeholders in each owner's folder | In progress |

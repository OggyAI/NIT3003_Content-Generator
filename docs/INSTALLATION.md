# Installation guide

This guide sets up the AI Content Generator from the source code, either on your own computer or as your own online copy. It takes about 30–45 minutes the first time.

**Just want to use the app?** You don't need to install anything. Open https://nit-3003-content-generator.vercel.app in Chrome or Edge, click **Create an account**, and follow the user manual from "Getting started".

---

## What you need

| Item | Notes |
|---|---|
| A computer running Windows, macOS or Linux | A screen at least 1366 × 768 |
| **Node.js 20 or newer** | Download the **LTS** version from https://nodejs.org |
| **Git** | https://git-scm.com (only needed to clone the code; you can use the code zip instead) |
| A code editor | Visual Studio Code is recommended: https://code.visualstudio.com |
| A **Supabase** account (free) | https://supabase.com: provides the database and logins |
| An **OpenAI** account with API credit | https://platform.openai.com: needed to generate content |
| A **Stripe** account (optional) | https://stripe.com: only for testing the Pro plan, in test mode |

Check Node.js and Git are installed by opening a terminal (on Windows: **PowerShell** or the terminal inside VS Code) and typing:

```
node -v
git --version
```

Each should print a version number. If Node prints a number below 20, install the latest LTS version. If either says "not recognised", install it, then **close and reopen** the terminal (and VS Code) before trying again.

---

## 1. Get the code

**Option A: from the code zip.** Unzip it somewhere easy to find, such as your Desktop.

**Option B: from GitHub.**

```
git clone https://github.com/OggyAI/NIT3003_Content-Generator.git
```

Then open the folder in VS Code: **File → Open Folder → NIT3003_Content-Generator → Select Folder**. If VS Code asks whether you trust the authors, click **Yes, I trust the authors**.

Open the terminal in VS Code with **Terminal → New Terminal**. All the commands below are typed there.

---

## 2. Install the packages

```
npm install
```

This downloads the libraries the app uses into a `node_modules` folder. It takes a minute or two. Yellow "warn" messages are normal; red "ERR!" messages are not (see Troubleshooting).

---

## 3. Set up the database in Supabase

1. Sign in at https://supabase.com and click **New project**. Choose a name and a database password, and pick the region closest to you (the team used **Sydney**). Wait until the project is ready.
2. In the left menu, open **SQL Editor**.
3. Open `supabase/schema.sql` from the code in VS Code, copy all of it, paste it into the SQL Editor and click **Run**. This creates all the tables, the sign-up trigger and the security rules.
   **Only run `schema.sql` once, on a new project.** Running it again deletes every table and all data.
4. Run each file in `supabase/migrations/` the same way, **one at a time, in number order**:
   `001_request_same_business.sql`, `002_settings.sql`, `003_admin.sql`, `004_billing.sql`.
5. **Check it worked:** run `supabase/tests/rls_isolation_test.sql`, then `supabase/tests/settings_test.sql`. Every row in the results table must show `pass = true`. These tests prove one business can never see another business's data. They create their own test users and delete them afterwards.

### Login settings

In Supabase, open **Authentication**:

| Setting | Where | Value |
|---|---|---|
| Email confirmation | Sign In / Providers → Email → **Confirm email** | Off for quick testing; on for a real deployment |
| Password rules | Sign In / Providers → Email (password settings) | Minimum length **8**; require lowercase, uppercase, digits and symbols |
| Site URL | URL Configuration | `http://localhost:3000` (or your Vercel address, see step 7) |
| Redirect URLs | URL Configuration | Add `http://localhost:3000/**` and, if you deploy, `https://your-site.vercel.app/**` |

The redirect URLs are needed for the **Forgot password** email link to work.

### Copy your keys

Go to **Project Settings → API Keys** and keep this page open for the next step. You need the **Project URL** and the **publishable** key (or the legacy **anon** key).

---

## 4. Get an OpenAI API key

1. Sign in at https://platform.openai.com.
2. Go to **Settings → Billing** and add a small amount of credit (for example US$5). Keys don't work without credit.
3. Go to **Settings → Limits** and set a **monthly budget**, so the key can never cost more than you expect.
4. Go to **API keys → Create new secret key**, and copy it straight away. It starts with `sk-` and is only shown once.

Keep this key private. Anyone who has it can spend your credit.

---

## 5. Create your environment file

In the VS Code terminal:

```
cp .env.example .env.local
```

On Windows PowerShell use `Copy-Item .env.example .env.local` instead.

Open `.env.local` in VS Code and fill in the values after each `=` sign, then save:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_...
OPENAI_API_KEY=sk-...
OPENAI_MODEL=
```

- Leave `OPENAI_MODEL` blank to use the default model (`gpt-5.4-mini`).
- Leave the Stripe and `SUPABASE_SERVICE_ROLE_KEY` lines blank unless you set up payments (step 8). The app works fully on the Free plan without them.
- `.env.local` is listed in `.gitignore`, so it is never uploaded to GitHub. **Never put real keys in `.env.example`**, because that file is shared.

---

## 6. Run the app

```
npm run dev
```

When the terminal shows **Ready**, open http://localhost:3000 in Chrome or Edge. To stop the app, click in the terminal and press **Ctrl + C**.

### Check that everything works

1. Click **Create an account**, then register with your email, a password that meets the rules, and a business name.
2. Fill in the **Business profile** and click **Save and create content**.
3. On **Create content**, choose a format, describe what you want, and click **Generate draft**. A draft should appear within about 10 seconds.
4. Open it in the editor, click **Analyse draft** to see the SEO score and tone check, and save it.
5. Go back to the **Dashboard**: the draft appears under Recent activity and in **Draft history**.

If all five work, the installation is complete.

---

## 7. Put it online with Vercel (optional)

1. Upload the code to your own GitHub repository.
2. Sign in at https://vercel.com, click **Add New → Project**, and import the repository. The default settings for Next.js are correct.
3. Before deploying, open **Environment Variables** and add the same values as your `.env.local`, for both **Production** and **Preview**.
4. Click **Deploy**. Vercel gives you a web address such as `https://your-site.vercel.app`.
5. Back in Supabase (**Authentication → URL Configuration**), set the **Site URL** to that address and add `https://your-site.vercel.app/**` to the Redirect URLs.

Every pull request now gets its own preview link, so changes can be checked before they go live.

---

## 8. Payments with Stripe (optional, test mode only)

Only needed to test upgrading to the Pro plan. **Use test mode only:** test card numbers, no real money.

1. In the Stripe dashboard, turn on **Test mode**.
2. Create a product called **Pro** with a recurring price of **A$19 per month**, and copy its price id (`price_…`).
3. Go to **Developers → API keys** and copy the **secret key** (`sk_test_…`). Never use an `sk_live_` key.
4. Add a **webhook endpoint**:
   - Online: `https://your-site.vercel.app/api/stripe/webhook`
   - On your computer: install the Stripe CLI and run `stripe listen --forward-to localhost:3000/api/stripe/webhook`
   - Events to send: `checkout.session.completed`, `customer.subscription.created`, `customer.subscription.updated`, `customer.subscription.deleted`
   - Copy the **signing secret** (`whsec_…`).
5. In Supabase, go to **Project Settings → API Keys** and copy the **secret / service_role** key. It is used only by the webhook, to record subscriptions. Never share it.
6. Add these four values to `.env.local` (and to Vercel if you deployed), then restart the app:

```
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PRO_PRICE_ID=price_...
STRIPE_WEBHOOK_SECRET=whsec_...
SUPABASE_SERVICE_ROLE_KEY=...
```

Test the upgrade in **Settings** with Stripe's test card `4242 4242 4242 4242`, any future expiry date and any 3-digit CVC.

---

## 9. Make an admin account (optional)

The **Admin** page shows usage totals per business. To give an account access, run this in the Supabase **SQL Editor**, replacing the email address:

```sql
update auth.users
set raw_app_meta_data = coalesce(raw_app_meta_data, '{}'::jsonb) || '{"role":"admin"}'
where email = 'you@example.com';
```

Then log out of the app and log back in. To remove admin access:

```sql
update auth.users set raw_app_meta_data = raw_app_meta_data - 'role' where email = 'you@example.com';
```

---

## Troubleshooting

| Problem | Cause and fix |
|---|---|
| `npm` or `node` is "not recognised" | Node.js was installed after the terminal or VS Code was opened. Close VS Code completely and reopen it; if that fails, restart the computer. |
| "Your project's URL and Key are required to create a Supabase client" | `.env.local` is missing or still has the placeholder values. Fill it in (step 5), save, then stop the app with **Ctrl + C** and run `npm run dev` again. |
| "Port 3000 is in use" | The app is already running in another terminal. Use the address the message gives (for example http://localhost:3001), or close the other one. |
| Generation fails with "The AI service isn't set up correctly" | `OPENAI_API_KEY` is missing or wrong, or `OPENAI_MODEL` names a model that doesn't exist. Fix `.env.local` and restart the app. |
| Generation fails with "The AI service has reached its usage limit" | The OpenAI account is out of credit. Add credit at platform.openai.com → Settings → Billing. |
| Generation fails with "The AI service took too long to answer" | A temporary delay. Your typed request is kept, so try again. |
| "Finish your business profile first" on Create content | The profile needs a business name, industry, brand voice and audience description. Complete them on **Business profile**. |
| "You've used all 10 free generations this month" | The Free plan allows 10 generations per calendar month. Wait until the 1st, or upgrade to Pro (step 8). |
| Forgot password link says it has expired or doesn't work | Open the email link in the **same browser** you requested it from, and check the Redirect URLs in Supabase (step 3). |
| "Invalid Server Actions request" when logging in | Happens in GitHub Codespaces, where the browser address differs from the server's. Run the app on your own computer, or test on a Vercel deployment. |
| Payments section says "Payments aren't set up on this site yet." | The Stripe variables are empty. This is expected unless you completed step 8. |
| `npm run build` fails | Read the first red error; it names the file and line. Run `npm run lint` for more detail. |

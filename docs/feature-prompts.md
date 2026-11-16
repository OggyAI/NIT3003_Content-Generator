# Prompts for the new site features

Ready-to-paste prompts for the team's LLM chats.

**How to use them:**
1. Attach `docs/PROJECT_CONTEXT.md` first; it describes every feature.
2. Paste the prompt.
3. Add your screenshots where a prompt asks for them.

Use the **Test Cafe** account (or a throwaway one) for screenshots. Never include passwords, keys, real emails or Stripe dashboard pages. The UI is frozen from **Wed 18 Nov**, so take screenshots after that date.

---

## 1. Harry: user manual sections

### 1a. Whole-manual update
> I'm updating the user manual for our AI Content Generator. The attached PROJECT_CONTEXT.md describes the app as it is now. My existing manual describes the old look: a navy sidebar, Inter-only fonts, and no Settings, Admin or Billing.
>
> First, list every section of my manual (pasted below) that is now wrong or missing, with what changed.
>
> Then write replacement text for each one. For each section, give:
> - plain step-by-step instructions for a café owner who isn't technical;
> - Australian English;
> - the exact button and link labels from PROJECT_CONTEXT.md;
> - a "[Screenshot: …]" placeholder wherever a picture helps, saying which page and what state to capture.
>
> [paste current manual]

### 1b. New section: Settings
> Write the "Settings" chapter of the user manual. Cover the following, using the button labels in PROJECT_CONTEXT.md:
> - changing your password, including that the current password is needed and the password rules;
> - changing your email;
> - content defaults, and what they change on Create content;
> - deleting your account: the two steps, typing the business name, and that it can't be undone.
>
> Add a short "Troubleshooting" box covering a wrong current password, a new password that doesn't meet the rules, and a mistyped business name. Include screenshot placeholders.

### 1c. New section: Plans and billing
> Write the "Plans and billing" chapter of the user manual. The app has a Free plan (10 generations a month, resets on the 1st, Melbourne time) and Pro (A$19/month, up to 200). Payments use Stripe in **test mode**, so explain that this is a demonstration and no real money is charged. Testers use card 4242 4242 4242 4242 with any future date and any CVC.
>
> Cover:
> - where to see your usage: Settings, and the line on Create content;
> - what happens at the limit: your brief is kept and you get a "See Pro" link;
> - how to upgrade;
> - how "Manage billing" lets you cancel or change your card;
> - what "Your Pro plan ends on …" means;
> - that the app never sees card details.
>
> Include screenshot placeholders.

### 1d. New section: Admin (for the technical document or an appendix)
> Write a short "Admin view" section. Explain:
> - who is an admin, and that it's set by a developer in the Supabase SQL editor rather than in the app;
> - what the admin page shows: totals per business only, with no emails or draft text, and why that protects privacy;
> - how disabling and re-enabling an account works, and that admins can't disable themselves or another admin;
> - that non-admins see a normal "page not found".
>
> Keep it to about 250 words, with one screenshot placeholder.

### 1e. Updated walkthroughs for the core screens
> Using PROJECT_CONTEXT.md, rewrite the manual's walkthroughs for **Dashboard, Business profile, Create content, Editor and Draft history** to match the new UI. Points to cover:
> - products are now edited in place;
> - Create content keeps the form visible while generating, explains errors, and offers Retry, Copy and Regenerate;
> - the editor shows its save state, has Export, and the analysis panel explains the keyword score (70% body, 30% title) and the tone check;
> - history has search, filters and Export CSV.
>
> Write one numbered task per heading (e.g. "Create an Instagram post"), with screenshot placeholders.

---

## 2. Nicolas: demo video

### 2a. Script
> Write a demo video script for our AI Content Generator, about 5 to 6 minutes long. Use two columns: **On screen** (exactly what to click, with page names and button labels from PROJECT_CONTEXT.md) and **Voice-over** (spoken text, Australian English, friendly and clear).
>
> Story: a café owner signs up and finishes their business profile, including editing a product in place. Then they:
> 1. create an Instagram post;
> 2. edit it in the editor and run the keyword and tone checks;
> 3. find it in Draft history with search;
> 4. export the history as CSV;
> 5. change content defaults in Settings;
> 6. see their Free usage, and upgrade to Pro with a Stripe test card (say on camera that it's test mode).
>
> End with a 20-second admin view as a separate admin account, then a summary that names the requirements shown (FR-01 to FR-16).
>
> Add timing for each scene, and a checklist of accounts and data to prepare before recording.

### 2b. Recording checklist
> Make a pre-recording checklist for the demo. It should cover:
> - the test accounts I need (owner, admin, and a fresh one for sign-up);
> - which data to reset;
> - browser size: 1366×768, Chrome, 100% zoom;
> - hiding bookmarks and notifications;
> - closing tabs that show keys or the Stripe or Supabase dashboards;
> - the Stripe test card details;
> - what to do if generation is slow or fails on camera.

---

## 3. Kerem: testing and evidence

### 3a. Test cases for the new features
> Using PROJECT_CONTEXT.md, write test cases for **Settings, Admin and Billing** in a table with these columns: ID, requirement (FR/NFR), preconditions, steps, expected result, actual result (blank), pass/fail (blank).
>
> Include negative tests:
> - wrong current password;
> - a non-admin opening /admin, which should get a 404;
> - generating at 10 of 10 free, which should show the limit message with the brief kept;
> - a forged webhook, which should get 400;
> - account B trying to see account A's plan.

### 3b. Traceability table
> Build a traceability table: **PR → requirement → test case → evidence**. The merged PRs are:
> - #13: password reset;
> - #15: UI overhaul (dashboard, generate errors, editor, history search and export, editable products);
> - #16: Settings;
> - #17: Admin;
> - #18: visual refresh;
> - #19: Billing.
>
> Map each to FR-01 to FR-16 and NFR-01 to NFR-12 where it applies. For evidence, use:
> - SQL test results (`rls_isolation_test.sql`, `settings_test.sql`);
> - screenshots;
> - the NFR-03 timing from `content_requests.generation_ms`, which times the AI call only.
>
> Flag any requirement with no evidence yet.

### 3c. Poster and slides: the new features
> Write poster and slide copy, about 60 words each, for three new features. Make each one benefit-led for a small business owner, then add one line on how it works technically.
> - **Settings:** self-service account control.
> - **Plans and billing:** Free + Pro with Stripe. Mention test mode, and that the app never sees cards.
> - **Admin view:** usage totals and the ability to disable accounts, while protecting privacy.

---

## 4. Karma: technical document and final report

> Write the technical document sections for Settings, Admin and Billing. For each, cover:
> - the design;
> - the security decisions and why we made them:
>   - the `delete_my_account()` security-definer function;
>   - the admin role in `app_metadata`, and functions that return totals only;
>   - the webhook as the only service-role user;
>   - the usage counter that users can't write;
> - the database migrations (002–004);
> - the API changes (additive only: the 402 `limit_reached` response and the `reason` on 503);
> - testing.
>
> Use PROJECT_CONTEXT.md and the attached report-handoff.md. Write it as an academic technical report, in the third person and Australian English.

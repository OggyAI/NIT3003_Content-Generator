-- =====================================================================
-- AI-Powered Content Generation Engine — database schema
-- Owner: Oggy. Do not rename tables or columns without asking the group.
--
-- How to apply: Supabase dashboard → SQL Editor → New query → paste this
-- whole file → Run. Safe to re-run: it drops and recreates our objects.
-- WARNING: re-running deletes all data in these tables.
--
-- Traceability: FR-01..FR-16 and NFR-02 in the Capstone 1 proposal.
-- =====================================================================

-- ---------------------------------------------------------------------
-- 0. Clean slate (lets us re-run the file during development)
-- ---------------------------------------------------------------------
drop trigger if exists on_auth_user_created on auth.users;
drop function if exists public.handle_new_user() cascade;
drop table if exists public.generated_content cascade;
drop table if exists public.content_requests cascade;
drop table if exists public.target_audience cascade;
drop table if exists public.products cascade;
drop table if exists public.brand_voice cascade;
drop table if exists public.business_profile cascade;
drop function if exists public.my_business_id() cascade;
drop function if exists public.set_updated_at() cascade;

-- ---------------------------------------------------------------------
-- 1. Shared helper: keep updated_at current on every UPDATE
-- ---------------------------------------------------------------------
create function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------
-- 2. Tables
-- ---------------------------------------------------------------------

-- One business per user account (FR-03). owner_id links to Supabase Auth.
create table public.business_profile (
  id            uuid primary key default gen_random_uuid(),
  owner_id      uuid not null unique references auth.users (id) on delete cascade,
  business_name text not null check (char_length(trim(business_name)) between 1 and 120),
  industry      text check (char_length(industry) <= 80),
  description   text check (char_length(description) <= 1000),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- FR-04: one brand voice per business.
create table public.brand_voice (
  id          uuid primary key default gen_random_uuid(),
  business_id uuid not null unique references public.business_profile (id) on delete cascade,
  voice       text not null check (voice in ('professional', 'friendly', 'casual', 'persuasive')),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- FR-05: many products/services per business.
create table public.products (
  id          uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.business_profile (id) on delete cascade,
  name        text not null check (char_length(trim(name)) between 1 and 120),
  description text check (char_length(description) <= 500),
  created_at  timestamptz not null default now()
);

-- FR-06: one target audience per business.
create table public.target_audience (
  id          uuid primary key default gen_random_uuid(),
  business_id uuid not null unique references public.business_profile (id) on delete cascade,
  description text check (char_length(description) <= 1000),
  age_range   text check (char_length(age_range) <= 40),
  interests   text check (char_length(interests) <= 500),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- FR-07/FR-08–FR-10: every generation attempt, success or failure.
-- generation_ms is recorded so we can report against NFR-03.
create table public.content_requests (
  id            uuid primary key default gen_random_uuid(),
  business_id   uuid not null references public.business_profile (id) on delete cascade,
  content_type  text not null check (content_type in ('blog', 'social', 'email')),
  platform      text check (platform in ('instagram', 'facebook')),
  user_request  text not null check (char_length(user_request) <= 2000),
  status        text not null default 'success' check (status in ('success', 'failed')),
  generation_ms integer check (generation_ms >= 0),
  created_at    timestamptz not null default now(),
  -- a platform only makes sense for social posts
  constraint platform_only_for_social check (platform is null or content_type = 'social')
);

-- FR-12–FR-16: generated content, drafts, history and analysis results.
create table public.generated_content (
  id           uuid primary key default gen_random_uuid(),
  business_id  uuid not null references public.business_profile (id) on delete cascade,
  request_id   uuid references public.content_requests (id) on delete set null,
  content_type text not null check (content_type in ('blog', 'social', 'email')),
  title        text check (char_length(title) <= 200),
  body         text not null check (char_length(body) between 1 and 20000),
  keywords     text[] not null default '{}',
  is_draft     boolean not null default true,
  seo_score    numeric(3, 2) check (seo_score between 0 and 1),
  tone_match   boolean,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- Indexes for the queries we actually run (history lists, NFR-04)
create index products_business_idx          on public.products (business_id);
create index content_requests_business_idx  on public.content_requests (business_id, created_at desc);
create index generated_content_business_idx on public.generated_content (business_id, created_at desc);

-- updated_at triggers
create trigger business_profile_updated_at  before update on public.business_profile  for each row execute function public.set_updated_at();
create trigger brand_voice_updated_at       before update on public.brand_voice       for each row execute function public.set_updated_at();
create trigger target_audience_updated_at   before update on public.target_audience   for each row execute function public.set_updated_at();
create trigger generated_content_updated_at before update on public.generated_content for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------
-- 3. Sign-up trigger (FR-01): create the business_profile row automatically
--    from the business_name the register form passes in options.data.
-- ---------------------------------------------------------------------
create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.business_profile (owner_id, business_name)
  values (
    new.id,
    coalesce(nullif(trim(new.raw_user_meta_data ->> 'business_name'), ''), 'My Business')
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------
-- 4. Row-level security (NFR-02, FR-13 multi-tenant isolation)
--    Rule: a signed-in user can only touch rows of THEIR business.
-- ---------------------------------------------------------------------

-- Returns the signed-in user's business id (null when not signed in).
-- security definer so policies can call it without recursive RLS checks.
create function public.my_business_id()
returns uuid
language sql
stable
security definer
set search_path = ''
as $$
  select id from public.business_profile where owner_id = (select auth.uid());
$$;

alter table public.business_profile  enable row level security;
alter table public.brand_voice       enable row level security;
alter table public.products          enable row level security;
alter table public.target_audience   enable row level security;
alter table public.content_requests  enable row level security;
alter table public.generated_content enable row level security;

-- business_profile: read/update your own; insert only for yourself
-- (the trigger normally creates it); no delete (FR-03: admin only).
create policy "own profile: select" on public.business_profile
  for select to authenticated using (owner_id = (select auth.uid()));
create policy "own profile: insert" on public.business_profile
  for insert to authenticated with check (owner_id = (select auth.uid()));
create policy "own profile: update" on public.business_profile
  for update to authenticated
  using (owner_id = (select auth.uid()))
  with check (owner_id = (select auth.uid()));

-- Every child table: full access, but only to your own business's rows.
create policy "own business: all" on public.brand_voice
  for all to authenticated
  using (business_id = (select public.my_business_id()))
  with check (business_id = (select public.my_business_id()));
create policy "own business: all" on public.products
  for all to authenticated
  using (business_id = (select public.my_business_id()))
  with check (business_id = (select public.my_business_id()));
create policy "own business: all" on public.target_audience
  for all to authenticated
  using (business_id = (select public.my_business_id()))
  with check (business_id = (select public.my_business_id()));
create policy "own business: all" on public.content_requests
  for all to authenticated
  using (business_id = (select public.my_business_id()))
  with check (business_id = (select public.my_business_id()));
create policy "own business: all" on public.generated_content
  for all to authenticated
  using (business_id = (select public.my_business_id()))
  with check (business_id = (select public.my_business_id()));

-- Explicit table privileges: signed-in users only; logged-out (anon) none.
revoke all on public.business_profile, public.brand_voice, public.products,
              public.target_audience, public.content_requests, public.generated_content
  from anon;
grant select, insert, update on public.business_profile to authenticated;
grant select, insert, update, delete on public.brand_voice, public.products,
              public.target_audience, public.content_requests, public.generated_content
  to authenticated;
revoke execute on function public.my_business_id() from public, anon;
grant execute on function public.my_business_id() to authenticated;
revoke execute on function public.handle_new_user() from public, anon, authenticated;

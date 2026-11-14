-- =====================================================================
-- Migration 004: Billing, Free + Pro with Stripe in test mode (plan approved by Karma 15 Nov 2026)
-- Run in the Supabase dashboard → SQL Editor. Safe to run more than once.
-- Never re-run schema.sql on the live project: it drops every table.
--
-- 1. subscriptions: one row per business, written ONLY by the Stripe webhook route
--    (server-side, service-role key). Users can read their own row and nothing else,
--    so nobody can give themselves Pro.
-- 2. generation_usage: successful generations per business per Melbourne calendar
--    month. Users can read their own rows but never write them; the only way to change
--    a count is record_generation(), which can only ADD one for the caller's business.
--    (content_requests can't be used for this: users may delete their own rows there.)
-- Tests: supabase/tests/rls_isolation_test.sql (billing section)
-- =====================================================================

create table if not exists public.subscriptions (
  business_id            uuid primary key references public.business_profile (id) on delete cascade,
  stripe_customer_id     text not null unique,
  stripe_subscription_id text unique,
  status                 text not null default 'incomplete',
  price_id               text,
  current_period_end     timestamptz,
  cancel_at_period_end   boolean not null default false,
  updated_at             timestamptz not null default now()
);

create table if not exists public.generation_usage (
  business_id uuid not null references public.business_profile (id) on delete cascade,
  month       date not null,
  count       integer not null default 0 check (count >= 0),
  primary key (business_id, month)
);

alter table public.subscriptions    enable row level security;
alter table public.generation_usage enable row level security;

drop policy if exists "own business: read" on public.subscriptions;
create policy "own business: read" on public.subscriptions
  for select to authenticated
  using (business_id = (select public.my_business_id()));

drop policy if exists "own business: read" on public.generation_usage;
create policy "own business: read" on public.generation_usage
  for select to authenticated
  using (business_id = (select public.my_business_id()));

-- Read-only for signed-in users; nothing for anon. (service_role bypasses RLS.)
revoke all on public.subscriptions, public.generation_usage from anon, authenticated;
grant select on public.subscriptions, public.generation_usage to authenticated;

-- The current month in Melbourne time, e.g. 2026-11-01
create or replace function public.current_usage_month()
returns date
language sql
stable
set search_path = ''
as $$
  select date_trunc('month', now() at time zone 'Australia/Melbourne')::date;
$$;

-- This business's successful generations this month (0 if none yet)
create or replace function public.my_monthly_usage()
returns integer
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce(
    (select u.count from public.generation_usage u
      where u.business_id = public.my_business_id() and u.month = public.current_usage_month()),
    0);
$$;

-- Adds one generation to the caller's own business. No parameters, so it can't touch anyone else,
-- and it can only increase the count.
create or replace function public.record_generation()
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  biz uuid := public.my_business_id();
begin
  if biz is null then
    raise exception 'No business for this user' using errcode = '42501';
  end if;
  insert into public.generation_usage (business_id, month, count)
  values (biz, public.current_usage_month(), 1)
  on conflict (business_id, month) do update set count = public.generation_usage.count + 1;
end;
$$;

revoke execute on function public.current_usage_month() from public, anon;
revoke execute on function public.my_monthly_usage()    from public, anon;
revoke execute on function public.record_generation()   from public, anon;
grant execute on function public.current_usage_month() to authenticated;
grant execute on function public.my_monthly_usage()    to authenticated;
grant execute on function public.record_generation()   to authenticated;

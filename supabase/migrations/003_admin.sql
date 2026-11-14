-- =====================================================================
-- Migration 003: Admin (UI overhaul Phase 2, plan approved by Karma 14 Nov 2026)
-- Run in the Supabase dashboard → SQL Editor. Safe to run more than once.
-- Never re-run schema.sql on the live project: it drops every table.
--
-- The admin role lives in app_metadata (users cannot edit it; user_metadata they can).
-- Admins read data only through these security-definer functions, which check the role
-- themselves and return business-level totals: no emails, no draft text. The existing
-- tenant RLS policies and my_business_id() are NOT changed.
-- Tests: supabase/tests/rls_isolation_test.sql (admin section)
--
-- To make an account an admin (run by hand, then log out and back in):
--   update auth.users
--   set raw_app_meta_data = coalesce(raw_app_meta_data, '{}'::jsonb) || '{"role":"admin"}'
--   where email = 'you@example.com';
-- To remove it:
--   update auth.users set raw_app_meta_data = raw_app_meta_data - 'role' where email = 'you@example.com';
-- =====================================================================

-- True when the signed JWT says this user is an admin
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin', false);
$$;

-- One row per business with usage totals. Admins only.
create or replace function public.admin_business_overview()
returns table (
  business_id uuid,
  business_name text,
  industry text,
  joined_at timestamptz,
  draft_count bigint,
  request_count bigint,
  failed_requests bigint,
  avg_generation_ms numeric,
  last_active_at timestamptz,
  is_admin boolean,
  disabled boolean
)
language plpgsql
stable
security definer
set search_path = ''
as $$
#variable_conflict use_column
begin
  if not public.is_admin() then
    raise exception 'Admins only' using errcode = '42501';
  end if;

  return query
  select
    b.id,
    b.business_name,
    b.industry,
    b.created_at,
    (select count(*) from public.generated_content g where g.business_id = b.id),
    (select count(*) from public.content_requests r where r.business_id = b.id),
    (select count(*) from public.content_requests r where r.business_id = b.id and r.status = 'failed'),
    (select round(avg(r.generation_ms)) from public.content_requests r
       where r.business_id = b.id and r.status = 'success' and r.generation_ms is not null),
    greatest(
      (select max(g.updated_at) from public.generated_content g where g.business_id = b.id),
      (select max(r.created_at) from public.content_requests r where r.business_id = b.id),
      u.last_sign_in_at
    ),
    coalesce(u.raw_app_meta_data ->> 'role' = 'admin', false),
    coalesce(u.banned_until > now(), false)
  from public.business_profile b
  join auth.users u on u.id = b.owner_id
  order by b.created_at;
end;
$$;

-- Disable (ban) or re-enable the owner of a business. Admins only; never yourself or another admin.
-- Disabling sets Supabase's own banned_until (so sign-in and token refresh are refused) and ends
-- the user's sessions. A tab that's already open keeps working until its access token expires.
create or replace function public.admin_set_account_disabled(target_business uuid, disable boolean)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  target_user uuid;
  target_is_admin boolean;
begin
  if not public.is_admin() then
    raise exception 'Admins only' using errcode = '42501';
  end if;

  select b.owner_id into target_user from public.business_profile b where b.id = target_business;
  if target_user is null then
    raise exception 'Business not found' using errcode = 'P0002';
  end if;
  if target_user = auth.uid() then
    raise exception 'You can''t disable your own account' using errcode = '42501';
  end if;

  select coalesce(u.raw_app_meta_data ->> 'role' = 'admin', false) into target_is_admin
  from auth.users u where u.id = target_user;
  if target_is_admin then
    raise exception 'Admin accounts can''t be disabled here' using errcode = '42501';
  end if;

  if disable then
    -- A far-future date rather than 'infinity', which the auth server may not read
    update auth.users set banned_until = now() + interval '100 years' where id = target_user;
    delete from auth.sessions where user_id = target_user;
  else
    update auth.users set banned_until = null where id = target_user;
  end if;
end;
$$;

revoke execute on function public.is_admin() from public, anon;
revoke execute on function public.admin_business_overview() from public, anon;
revoke execute on function public.admin_set_account_disabled(uuid, boolean) from public, anon;
grant execute on function public.is_admin() to authenticated;
grant execute on function public.admin_business_overview() to authenticated;
grant execute on function public.admin_set_account_disabled(uuid, boolean) to authenticated;

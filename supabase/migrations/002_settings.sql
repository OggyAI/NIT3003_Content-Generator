-- =====================================================================
-- Migration 002: Settings (UI overhaul Phase 2, plan approved by Karma 14 Nov 2026)
-- Run in the Supabase dashboard → SQL Editor. Safe to run more than once.
-- Never re-run schema.sql on the live project: it drops every table.
--
-- 1. Default content preferences: two nullable columns on business_profile.
--    NULL means Generate starts on Social post / Instagram, as before.
--    Covered by the existing "own profile" policies and the update grant,
--    so no policy changes are needed.
-- 2. delete_my_account(): lets a signed-in user delete their OWN account and
--    nothing else. Deleting the auth user cascades to business_profile and from
--    there to brand_voice, target_audience, products, content_requests and
--    generated_content (on delete cascade in schema.sql). No service-role key.
-- Tests: supabase/tests/settings_test.sql
-- =====================================================================

alter table public.business_profile
  add column if not exists default_content_type text
    check (default_content_type in ('blog', 'social', 'email'));

alter table public.business_profile
  add column if not exists default_platform text
    check (default_platform in ('instagram', 'facebook'));

create or replace function public.delete_my_account()
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  uid uuid := auth.uid();
begin
  -- Only ever the caller: there is no parameter to name another account
  if uid is null then
    raise exception 'Not signed in' using errcode = '42501';
  end if;
  delete from auth.users where id = uid;
end;
$$;

revoke execute on function public.delete_my_account() from public, anon;
grant execute on function public.delete_my_account() to authenticated;

-- =====================================================================
-- Settings test (migration 002: content defaults and delete_my_account()).
-- Run AFTER supabase/migrations/002_settings.sql.
-- Supabase dashboard → SQL Editor → paste → Run.
--
-- Same style as rls_isolation_test.sql: two throwaway users (C and D), act as
-- each, check what they can change, then a results table. Every row should say
-- pass = true. Re-run rls_isolation_test.sql afterwards: it must still pass 14/14.
-- =====================================================================

create temp table settings_results (n serial, test text, pass boolean) on commit drop;
grant insert, select on settings_results to authenticated, anon;
grant usage on sequence settings_results_n_seq to authenticated, anon;

-- Two test users. The sign-up trigger creates a business for each.
insert into auth.users (id, email, raw_user_meta_data)
values ('00000000-0000-4000-a000-00000000000c', 'settings-test-c@example.test', '{"business_name":"Cafe C"}'),
       ('00000000-0000-4000-a000-00000000000d', 'settings-test-d@example.test', '{"business_name":"Shop D"}');

insert into settings_results (test, pass)
select 'New businesses start with no content defaults (NULL)',
       count(*) = 2 and bool_and(default_content_type is null and default_platform is null)
from public.business_profile
where owner_id in ('00000000-0000-4000-a000-00000000000c', '00000000-0000-4000-a000-00000000000d');

-- Remember C's business id, to check the cascade after the delete
select set_config('test.c_business',
  (select id::text from public.business_profile where owner_id = '00000000-0000-4000-a000-00000000000c'), true);

-- ---------------- act as user C ----------------
set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"00000000-0000-4000-a000-00000000000c","role":"authenticated"}', true);

-- Something for the delete to cascade through
insert into public.products (business_id, name) values (public.my_business_id(), 'Flat white');
insert into public.generated_content (business_id, content_type, body)
values (public.my_business_id(), 'social', 'C''s draft');

do $$
declare n int;
begin
  -- C saves their own defaults
  update public.business_profile set default_content_type = 'social', default_platform = 'facebook'
  where owner_id = '00000000-0000-4000-a000-00000000000c';
  get diagnostics n = row_count;
  insert into settings_results (test, pass) values ('C can save their own content defaults', n = 1);

  -- C tries to change D's defaults: RLS hides the row, so 0 rows change
  update public.business_profile set default_content_type = 'email'
  where owner_id = '00000000-0000-4000-a000-00000000000d';
  get diagnostics n = row_count;
  insert into settings_results (test, pass) values ('C cannot change D''s content defaults', n = 0);

  -- Values outside the allow-list are rejected by the check constraints
  begin
    update public.business_profile set default_content_type = 'video'
    where owner_id = '00000000-0000-4000-a000-00000000000c';
    insert into settings_results (test, pass) values ('Unknown format is rejected', false);
  exception when check_violation then
    insert into settings_results (test, pass) values ('Unknown format is rejected', true);
  end;
  begin
    update public.business_profile set default_platform = 'tiktok'
    where owner_id = '00000000-0000-4000-a000-00000000000c';
    insert into settings_results (test, pass) values ('Unknown platform is rejected', false);
  exception when check_violation then
    insert into settings_results (test, pass) values ('Unknown platform is rejected', true);
  end;
end $$;

insert into settings_results (test, pass)
select 'C''s saved defaults read back correctly',
       count(*) = 1 and bool_and(default_content_type = 'social' and default_platform = 'facebook')
from public.business_profile;

-- ---------------- logged-out visitor ----------------
set local role anon;
select set_config('request.jwt.claims', '{"role":"anon"}', true);
do $$
begin
  perform public.delete_my_account();
  insert into settings_results (test, pass) values ('Logged-out visitor cannot call delete_my_account()', false);
exception when insufficient_privilege then
  insert into settings_results (test, pass) values ('Logged-out visitor cannot call delete_my_account()', true);
end $$;

-- ---------------- signed-in role but no user id ----------------
set local role authenticated;
select set_config('request.jwt.claims', '{"role":"authenticated"}', true);
do $$
begin
  perform public.delete_my_account();
  insert into settings_results (test, pass) values ('delete_my_account() refuses a request with no user id', false);
exception when insufficient_privilege then
  insert into settings_results (test, pass) values ('delete_my_account() refuses a request with no user id', true);
end $$;

-- ---------------- user C deletes their own account ----------------
select set_config('request.jwt.claims', '{"sub":"00000000-0000-4000-a000-00000000000c","role":"authenticated"}', true);
select public.delete_my_account();

-- ---------------- back to admin: check what was deleted ----------------
reset role;

insert into settings_results (test, pass)
select 'C''s login is gone', count(*) = 0
from auth.users where id = '00000000-0000-4000-a000-00000000000c';

insert into settings_results (test, pass)
select 'C''s business, products and drafts are gone (cascade)',
       (select count(*) from public.business_profile where id = current_setting('test.c_business')::uuid) = 0
   and (select count(*) from public.products where business_id = current_setting('test.c_business')::uuid) = 0
   and (select count(*) from public.generated_content where business_id = current_setting('test.c_business')::uuid) = 0;

insert into settings_results (test, pass)
select 'D''s account and business are untouched',
       (select count(*) from auth.users where id = '00000000-0000-4000-a000-00000000000d') = 1
   and (select count(*) from public.business_profile
          where owner_id = '00000000-0000-4000-a000-00000000000d' and business_name = 'Shop D') = 1;

-- Clean up D
delete from auth.users where id = '00000000-0000-4000-a000-00000000000d';

insert into settings_results (test, pass)
select 'Test users and their data cleaned up', count(*) = 0
from public.business_profile
where owner_id in ('00000000-0000-4000-a000-00000000000c', '00000000-0000-4000-a000-00000000000d');

select n, test, pass from settings_results order by n;

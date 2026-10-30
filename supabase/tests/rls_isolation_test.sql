-- =====================================================================
-- Data-isolation test (NFR-02, FR-13). Run AFTER schema.sql.
-- Supabase dashboard → SQL Editor → paste → Run.
--
-- It creates two throwaway users (A and B), acts as each one, checks what
-- they can see and change, deletes the test users, and finishes with a
-- results table. Every row should say pass = true.
-- Screenshot the result for the diary / test plan.
-- =====================================================================

create temp table rls_results (n serial, test text, pass boolean) on commit drop;
grant insert, select on rls_results to authenticated, anon;
grant usage on sequence rls_results_n_seq to authenticated, anon;

-- Two test users. The sign-up trigger should create a business for each.
insert into auth.users (id, email, raw_user_meta_data)
values ('00000000-0000-4000-a000-00000000000a', 'rls-test-a@example.test', '{"business_name":"Cafe A"}'),
       ('00000000-0000-4000-a000-00000000000b', 'rls-test-b@example.test', '{"business_name":"Shop B"}');

insert into rls_results (test, pass)
select 'Sign-up trigger created both businesses', count(*) = 2
from public.business_profile
where owner_id in ('00000000-0000-4000-a000-00000000000a', '00000000-0000-4000-a000-00000000000b');

select set_config('test.a_business',
  (select id::text from public.business_profile where owner_id = '00000000-0000-4000-a000-00000000000a'), true);

-- ---------------- act as user A ----------------
set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"00000000-0000-4000-a000-00000000000a","role":"authenticated"}', true);

insert into public.brand_voice (business_id, voice) values (public.my_business_id(), 'friendly');
insert into public.products (business_id, name) values (public.my_business_id(), 'Flat white');
insert into public.generated_content (business_id, content_type, body)
values (public.my_business_id(), 'social', 'A''s private draft');
select set_config('test.a_content', (select id::text from public.generated_content limit 1), true);

insert into rls_results (test, pass)
select 'A sees exactly one business (their own)', count(*) = 1 and bool_and(business_name = 'Cafe A')
from public.business_profile;
insert into rls_results (test, pass)
select 'A sees their own draft', count(*) = 1 from public.generated_content;

-- ---------------- act as user B ----------------
select set_config('request.jwt.claims', '{"sub":"00000000-0000-4000-a000-00000000000b","role":"authenticated"}', true);

insert into rls_results (test, pass)
select 'B sees only their own business', count(*) = 1 and bool_and(business_name = 'Shop B')
from public.business_profile;
insert into rls_results (test, pass)
select 'B cannot see A''s drafts', count(*) = 0 from public.generated_content;
insert into rls_results (test, pass)
select 'B cannot see A''s products', count(*) = 0 from public.products;
insert into rls_results (test, pass)
select 'B cannot see A''s brand voice', count(*) = 0 from public.brand_voice;

do $$
declare n int;
begin
  -- B tries to edit A's draft: RLS hides the row, so 0 rows change.
  update public.generated_content set body = 'hacked'
  where id = current_setting('test.a_content')::uuid;
  get diagnostics n = row_count;
  insert into rls_results (test, pass) values ('B cannot edit A''s draft', n = 0);

  -- B tries to delete A's draft.
  delete from public.generated_content where id = current_setting('test.a_content')::uuid;
  get diagnostics n = row_count;
  insert into rls_results (test, pass) values ('B cannot delete A''s draft', n = 0);

  -- B tries to write a row into A's business: must be rejected.
  begin
    insert into public.generated_content (business_id, content_type, body)
    values (current_setting('test.a_business')::uuid, 'blog', 'injected');
    insert into rls_results (test, pass) values ('B cannot write into A''s business', false);
  exception when insufficient_privilege then
    insert into rls_results (test, pass) values ('B cannot write into A''s business', true);
  end;

  -- B tries to rename A's business.
  update public.business_profile set business_name = 'hacked'
  where id = current_setting('test.a_business')::uuid;
  get diagnostics n = row_count;
  insert into rls_results (test, pass) values ('B cannot edit A''s business profile', n = 0);
end $$;

-- ---------------- logged-out visitor ----------------
set local role anon;
select set_config('request.jwt.claims', '{"role":"anon"}', true);
do $$
begin
  perform 1 from public.generated_content;
  insert into rls_results (test, pass) values ('Logged-out visitor cannot read content', false);
exception when insufficient_privilege then
  insert into rls_results (test, pass) values ('Logged-out visitor cannot read content', true);
end $$;

-- ---------------- back to admin: confirm A's data untouched, clean up ----------------
reset role;

insert into rls_results (test, pass)
select 'A''s draft is unchanged after B''s attempts', count(*) = 1
from public.generated_content
where id = current_setting('test.a_content')::uuid and body = 'A''s private draft';

delete from auth.users
where id in ('00000000-0000-4000-a000-00000000000a', '00000000-0000-4000-a000-00000000000b');

insert into rls_results (test, pass)
select 'Test users and their data cleaned up', count(*) = 0
from public.business_profile
where owner_id in ('00000000-0000-4000-a000-00000000000a', '00000000-0000-4000-a000-00000000000b');

select n, test, pass from rls_results order by n;

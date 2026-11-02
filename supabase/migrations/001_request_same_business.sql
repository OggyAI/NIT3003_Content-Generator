-- =====================================================================
-- Migration 001 — a draft can only link to a generation request of the
-- SAME business (raised in Kerem's proposal review).
--
-- Before: generated_content.request_id → content_requests.id only, so a
-- row could in theory point at another business's request.
-- After:  (request_id, business_id) must match a content_requests row with
-- the same (id, business_id). If the request is deleted, only request_id
-- is cleared; the draft and its business_id stay.
--
-- Apply once: Supabase → SQL Editor → paste → Run. Safe on live data
-- (adds constraints, deletes nothing). Fails only if existing rows already
-- break the rule — the check query at the bottom finds those.
-- =====================================================================

alter table public.content_requests
  add constraint content_requests_id_business_key unique (id, business_id);

alter table public.generated_content
  drop constraint if exists generated_content_request_id_fkey;

alter table public.generated_content
  add constraint generated_content_request_same_business
  foreign key (request_id, business_id)
  references public.content_requests (id, business_id)
  on delete set null (request_id);

-- Check (should return 0 rows):
-- select g.id from public.generated_content g
-- join public.content_requests r on r.id = g.request_id
-- where r.business_id <> g.business_id;

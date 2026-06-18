-- Demo seed for the Sun* Kudos Live board (DEV ONLY — fake users + kudos graph).
-- Apply after migrations on a throwaway/dev DB:
--   psql "$DB_URL" -f supabase/seeds/dev/kudos_demo.sql
-- or include via SUPABASE_EXTRA_SEEDS for `supabase db reset`.
--
-- Idempotent-ish: uses fixed UUIDs + ON CONFLICT so re-running is safe.

-- ── Departments + hashtags (reference) ────────────────────────────────────────
insert into public.departments (id, code, name) values
  ('11111111-0000-0000-0000-000000000001', 'CEVC2', 'CEVC2'),
  ('11111111-0000-0000-0000-000000000002', 'CEVC3', 'CEVC3'),
  ('11111111-0000-0000-0000-000000000003', 'CEVC4', 'CEVC4'),
  ('11111111-0000-0000-0000-000000000004', 'CEVC1', 'CEVC1'),
  ('11111111-0000-0000-0000-000000000005', 'OPD',   'OPD'),
  ('11111111-0000-0000-0000-000000000006', 'Infra', 'Infra')
on conflict (code) do nothing;

insert into public.hashtags (name) values
  ('Dedicated'), ('Inspiring'), ('Teamwork'), ('Creative'), ('Wasshoi'), ('IDOL GIỚI TRẺ')
on conflict (name) do nothing;

-- ── Demo auth users → profiles (trigger handle_new_user creates profile rows) ──
insert into auth.users (id, instance_id, aud, role, email, raw_user_meta_data, created_at, updated_at)
values
  ('22222222-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000000','authenticated','authenticated','sunner1@example.com','{"full_name":"Huỳnh Dương Xuân Nhật","avatar_url":""}', now(), now()),
  ('22222222-0000-0000-0000-000000000002','00000000-0000-0000-0000-000000000000','authenticated','authenticated','sunner2@example.com','{"full_name":"Nguyễn Bá Chúc","avatar_url":""}', now(), now()),
  ('22222222-0000-0000-0000-000000000003','00000000-0000-0000-0000-000000000000','authenticated','authenticated','sunner3@example.com','{"full_name":"Nguyễn Hoàng Linh","avatar_url":""}', now(), now()),
  ('22222222-0000-0000-0000-000000000004','00000000-0000-0000-0000-000000000000','authenticated','authenticated','sunner4@example.com','{"full_name":"Lê Văn Quý","avatar_url":""}', now(), now())
on conflict (id) do nothing;

-- Assign departments to the demo profiles (profiles auto-created by the trigger).
update public.profiles set department_id = '11111111-0000-0000-0000-000000000001' where id = '22222222-0000-0000-0000-000000000001';
update public.profiles set department_id = '11111111-0000-0000-0000-000000000002' where id = '22222222-0000-0000-0000-000000000002';
update public.profiles set department_id = '11111111-0000-0000-0000-000000000003' where id = '22222222-0000-0000-0000-000000000003';
update public.profiles set department_id = '11111111-0000-0000-0000-000000000004' where id = '22222222-0000-0000-0000-000000000004';

-- ── Kudos graph (senders -> receivers) ────────────────────────────────────────
insert into public.kudos (id, sender_id, receiver_id, message, hashtags, created_at) values
  ('33333333-0000-0000-0000-000000000001','22222222-0000-0000-0000-000000000001','22222222-0000-0000-0000-000000000002','Cảm ơn người em bình thường nhưng phi thường :D Cảm ơn sự chăm chỉ, cần mẫn của em đã tạo động lực cho cả team.', '{Dedicated,Inspiring}', now() - interval '1 hour'),
  ('33333333-0000-0000-0000-000000000002','22222222-0000-0000-0000-000000000003','22222222-0000-0000-0000-000000000001','Luôn nhiệt huyết và truyền cảm hứng cho mọi người xung quanh.', '{Inspiring,Teamwork}', now() - interval '2 hour'),
  ('33333333-0000-0000-0000-000000000003','22222222-0000-0000-0000-000000000004','22222222-0000-0000-0000-000000000001','Hỗ trợ team rất nhiệt tình, cảm ơn anh nhiều!', '{Teamwork}', now() - interval '3 hour'),
  ('33333333-0000-0000-0000-000000000004','22222222-0000-0000-0000-000000000002','22222222-0000-0000-0000-000000000003','Ý tưởng sáng tạo và tinh thần Wasshoi tuyệt vời.', '{Creative,Wasshoi}', now() - interval '5 hour')
on conflict (id) do nothing;

-- ── Likes (hearts credit the kudos SENDER) ────────────────────────────────────
insert into public.kudos_likes (kudos_id, user_id, is_special) values
  ('33333333-0000-0000-0000-000000000001','22222222-0000-0000-0000-000000000003', false),
  ('33333333-0000-0000-0000-000000000001','22222222-0000-0000-0000-000000000004', false),
  ('33333333-0000-0000-0000-000000000002','22222222-0000-0000-0000-000000000002', true)
on conflict (kudos_id, user_id) do nothing;

-- ── Admin special day (drives +2 hearts) — active now for demo ─────────────────
insert into public.special_days (id, starts_at, ends_at, multiplier) values
  ('44444444-0000-0000-0000-000000000001', now() - interval '1 day', now() + interval '7 day', 2)
on conflict (id) do nothing;

-- ── Display-only extras: secret boxes, gift grants, rank-ups ───────────────────
insert into public.secret_boxes (user_id, opened) values
  ('22222222-0000-0000-0000-000000000001', true),
  ('22222222-0000-0000-0000-000000000001', false),
  ('22222222-0000-0000-0000-000000000001', false)
on conflict do nothing;

insert into public.gift_grants (user_id, gift_name, created_at) values
  ('22222222-0000-0000-0000-000000000002','Nhận được 1 áo phông SAA', now() - interval '10 min'),
  ('22222222-0000-0000-0000-000000000003','Nhận được 1 áo phông SAA', now() - interval '20 min')
on conflict do nothing;

insert into public.rank_ups (user_id, badge, created_at) values
  ('22222222-0000-0000-0000-000000000001','rising', now() - interval '15 min'),
  ('22222222-0000-0000-0000-000000000003','new', now() - interval '25 min')
on conflict do nothing;

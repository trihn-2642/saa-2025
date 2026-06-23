-- Seeds the fixed 13 hashtags required by the Write Kudos spec.
--
-- Idempotent: ON CONFLICT (name) DO NOTHING — safe to re-run.
-- The hashtags table has a unique constraint on name (see 20260617140000_kudos.sql).
--
-- Apply on the cloud project:
--   supabase db push  OR  psql "$DB_URL" -f supabase/migrations/20260622100002_kudos_hashtags_seed.sql

insert into public.hashtags (name) values
  ('Toàn diện'),
  ('Giỏi chuyên môn'),
  ('Hiệu suất cao'),
  ('Truyền cảm hứng'),
  ('Cống hiến'),
  ('Aim High'),
  ('Be Agile'),
  ('Wasshoi'),
  ('Hướng mục tiêu'),
  ('Hướng khách hàng'),
  ('Chuẩn quy trình'),
  ('Giải pháp sáng tạo'),
  ('Quản lý xuất sắc')
on conflict (name) do nothing;

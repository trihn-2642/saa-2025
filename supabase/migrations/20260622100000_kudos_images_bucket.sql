-- Creates the `images` Storage bucket and its RLS policies for Kudos image uploads.
--
-- Idempotent: uses ON CONFLICT DO NOTHING for the bucket insert; policies are
-- dropped and recreated so re-running is safe.
--
-- Apply on the cloud project (Supabase dashboard → SQL editor, or supabase db push):
--   supabase db push  OR  psql "$DB_URL" -f supabase/migrations/20260622100000_kudos_images_bucket.sql

-- ── Bucket ────────────────────────────────────────────────────────────────────
-- Public bucket: uploaded images are served without auth (kudos are public on the board).
insert into storage.buckets (id, name, public)
values ('images', 'images', true)
on conflict (id) do nothing;

-- ── RLS ───────────────────────────────────────────────────────────────────────
-- Only authenticated users may upload; anyone may read (public bucket).

drop policy if exists "kudos images: authenticated insert" on storage.objects;
create policy "kudos images: authenticated insert"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'images');

drop policy if exists "kudos images: public select" on storage.objects;
create policy "kudos images: public select"
  on storage.objects for select
  to public
  using (bucket_id = 'images');

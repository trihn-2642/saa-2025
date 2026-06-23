-- Allow self-likes on kudos.
--
-- The original "like as self" RLS policy forbade liking a kudos you sent
-- (the `not exists (... sender_id = auth.uid())` clause). A like credits the
-- RECEIVER, not the liker, so self-likes are harmless — recreate the policy
-- with only the ownership check.
--
-- Apply on the cloud project:
--   supabase db push  OR  psql "$DB_URL" -f supabase/migrations/20260623104000_kudos_likes_allow_self.sql

drop policy if exists "like as self" on public.kudos_likes;
create policy "like as self" on public.kudos_likes for insert to authenticated
  with check (auth.uid() = user_id);

-- Adds anonymous_name to kudos: the display nickname shown on the card when
-- is_anonymous is true (e.g. "Doraemon"). NULL when the kudos is not anonymous.
--
-- Idempotent: ADD COLUMN IF NOT EXISTS.
--
-- Apply on the cloud project:
--   supabase db push  OR  psql "$DB_URL" -f supabase/migrations/20260623093900_kudos_anonymous_name.sql

alter table public.kudos
  add column if not exists anonymous_name text;

-- Re-create the view to expose anonymous_name. Columns are listed explicitly
-- with anonymous_name LAST (after is_anonymous): `create or replace view`
-- forbids reordering/renaming existing columns, so new columns must be appended.
create or replace view public.kudos_with_counts as
select
  k.id, k.sender_id, k.receiver_id, k.message, k.hashtags, k.images, k.created_at,
  coalesce(count(l.id), 0)::int as like_count,
  coalesce(sum(case when l.is_special then 2 else 1 end), 0)::int as heart_weight,
  k.is_anonymous,
  k.anonymous_name
from public.kudos k
left join public.kudos_likes l on l.kudos_id = k.id
group by k.id;

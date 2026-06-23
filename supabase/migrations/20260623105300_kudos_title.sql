-- Adds `title` to kudos: the "Danh hiệu" (award title) shown as the centered
-- heading on the card, e.g. "IDOL". Previously it was prepended into the message
-- HTML; now it's a dedicated column so the message body stays clean.
--
-- Idempotent: ADD COLUMN IF NOT EXISTS.
--
-- Apply on the cloud project:
--   supabase db push  OR  psql "$DB_URL" -f supabase/migrations/20260623105300_kudos_title.sql

alter table public.kudos
  add column if not exists title text;

-- Re-create the view to expose `title` (appended LAST — create or replace view
-- forbids reordering/renaming existing columns).
create or replace view public.kudos_with_counts as
select
  k.id, k.sender_id, k.receiver_id, k.message, k.hashtags, k.images, k.created_at,
  coalesce(count(l.id), 0)::int as like_count,
  coalesce(sum(case when l.is_special then 2 else 1 end), 0)::int as heart_weight,
  k.is_anonymous,
  k.anonymous_name,
  k.title
from public.kudos k
left join public.kudos_likes l on l.kudos_id = k.id
group by k.id;

-- Adds is_anonymous column to kudos to support anonymous send.
--
-- Anonymity only affects display: sender_id still records the real sender
-- for hearts/stats credit. The board card masks the sender identity when true.
--
-- Idempotent: uses ADD COLUMN IF NOT EXISTS.
--
-- Apply on the cloud project:
--   supabase db push  OR  psql "$DB_URL" -f supabase/migrations/20260622100001_kudos_anonymous.sql

alter table public.kudos
  add column if not exists is_anonymous boolean not null default false;

-- Re-create the view to expose the new is_anonymous column.
-- Columns are listed explicitly (NOT `k.*`) with is_anonymous LAST: `create or
-- replace view` forbids reordering/renaming existing columns, and `k.*` would
-- insert is_anonymous before like_count → ERROR 42P16. Appending it at the end
-- keeps positions 1–9 stable and just adds column 10.
create or replace view public.kudos_with_counts as
select
  k.id, k.sender_id, k.receiver_id, k.message, k.hashtags, k.images, k.created_at,
  coalesce(count(l.id), 0)::int as like_count,
  coalesce(sum(case when l.is_special then 2 else 1 end), 0)::int as heart_weight,
  k.is_anonymous
from public.kudos k
left join public.kudos_likes l on l.kudos_id = k.id
group by k.id;

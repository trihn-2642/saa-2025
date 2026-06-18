-- Sun* Kudos (Live board) domain: kudos feed, likes (hearts credit the SENDER),
-- filters (departments/hashtags), display-only extras (secret boxes, gift grants,
-- rank-ups), and admin special days (drive the +2 hearts rule).
--
-- Stars + badge are DERIVED (not stored) via the profile_stats view:
--   stars  from kudos RECEIVED count   : >=50 -> 3, >=20 -> 2, >=10 -> 1, else 0
--   badge  from DISTINCT senders to you: >=20 legend, >=10 super, >=5 rising, >=1 new
-- Keep these thresholds in sync with src/lib/kudos/badges.ts.

-- ── Lookups ───────────────────────────────────────────────────────────────────
create table if not exists public.departments (
  id uuid primary key default gen_random_uuid (),
  code text not null unique,
  name text not null
);

create table if not exists public.hashtags (
  id uuid primary key default gen_random_uuid (),
  name text not null unique
);

-- Profiles already exist (login feature). Add department + make readable to all
-- signed-in users (a recognition board needs everyone's public profile).
alter table public.profiles
  add column if not exists department_id uuid references public.departments (id);

drop policy if exists "Profiles are viewable by authenticated" on public.profiles;
create policy "Profiles are viewable by authenticated"
  on public.profiles for select
  to authenticated
  using (true);

-- ── Core: kudos + likes ───────────────────────────────────────────────────────
create table if not exists public.kudos (
  id uuid primary key default gen_random_uuid (),
  sender_id uuid not null references public.profiles (id) on delete cascade,
  receiver_id uuid not null references public.profiles (id) on delete cascade,
  message text not null,
  hashtags text[] not null default '{}',
  images text[] not null default '{}',
  created_at timestamptz not null default now(),
  constraint kudos_no_self check (sender_id <> receiver_id)
);
create index if not exists kudos_created_at_idx on public.kudos (created_at desc);
create index if not exists kudos_receiver_idx on public.kudos (receiver_id);
create index if not exists kudos_sender_idx on public.kudos (sender_id);

create table if not exists public.kudos_likes (
  id uuid primary key default gen_random_uuid (),
  kudos_id uuid not null references public.kudos (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  is_special boolean not null default false, -- liked during a special day -> weight 2
  created_at timestamptz not null default now(),
  unique (kudos_id, user_id)
);
create index if not exists kudos_likes_kudos_idx on public.kudos_likes (kudos_id);

-- ── Admin config: special days (seeded; no admin UI) ──────────────────────────
create table if not exists public.special_days (
  id uuid primary key default gen_random_uuid (),
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  multiplier int not null default 2
);

-- ── Display-only extras ───────────────────────────────────────────────────────
create table if not exists public.secret_boxes (
  id uuid primary key default gen_random_uuid (),
  user_id uuid not null references public.profiles (id) on delete cascade,
  opened boolean not null default false,
  created_at timestamptz not null default now()
);
create index if not exists secret_boxes_user_idx on public.secret_boxes (user_id);

create table if not exists public.gift_grants (
  id uuid primary key default gen_random_uuid (),
  user_id uuid not null references public.profiles (id) on delete cascade,
  gift_name text not null,
  created_at timestamptz not null default now()
);
create index if not exists gift_grants_created_idx on public.gift_grants (created_at desc);

create table if not exists public.rank_ups (
  id uuid primary key default gen_random_uuid (),
  user_id uuid not null references public.profiles (id) on delete cascade,
  badge text not null,
  created_at timestamptz not null default now()
);
create index if not exists rank_ups_created_idx on public.rank_ups (created_at desc);

-- ── Derived views ─────────────────────────────────────────────────────────────
-- A like is worth 2 hearts if special, else 1.
create or replace view public.kudos_with_counts as
select
  k.*,
  coalesce(count(l.id), 0)::int as like_count,
  coalesce(sum(case when l.is_special then 2 else 1 end), 0)::int as heart_weight
from public.kudos k
left join public.kudos_likes l on l.kudos_id = k.id
group by k.id;

-- Per-profile stats: hearts a profile EARNED come from likes on kudos they SENT.
create or replace view public.profile_stats as
with
  received as (
    select receiver_id as pid, count(*)::int as kudos_received,
           count(distinct sender_id)::int as distinct_senders
    from public.kudos group by receiver_id
  ),
  sent as (
    select sender_id as pid, count(*)::int as kudos_sent
    from public.kudos group by sender_id
  ),
  hearts as (
    select k.sender_id as pid,
           coalesce(sum(case when l.is_special then 2 else 1 end), 0)::int as hearts_received
    from public.kudos k join public.kudos_likes l on l.kudos_id = k.id
    group by k.sender_id
  ),
  boxes as (
    select user_id as pid,
           count(*) filter (where opened)::int as secret_opened,
           count(*) filter (where not opened)::int as secret_unopened
    from public.secret_boxes group by user_id
  )
select
  p.id,
  coalesce(r.kudos_received, 0) as kudos_received,
  coalesce(s.kudos_sent, 0) as kudos_sent,
  coalesce(h.hearts_received, 0) as hearts_received,
  coalesce(r.distinct_senders, 0) as distinct_senders,
  case when coalesce(r.kudos_received,0) >= 50 then 3
       when coalesce(r.kudos_received,0) >= 20 then 2
       when coalesce(r.kudos_received,0) >= 10 then 1 else 0 end as stars,
  case when coalesce(r.distinct_senders,0) >= 20 then 'legend'
       when coalesce(r.distinct_senders,0) >= 10 then 'super'
       when coalesce(r.distinct_senders,0) >= 5  then 'rising'
       when coalesce(r.distinct_senders,0) >= 1  then 'new' else null end as badge,
  coalesce(b.secret_opened, 0) as secret_opened,
  coalesce(b.secret_unopened, 0) as secret_unopened
from public.profiles p
left join received r on r.pid = p.id
left join sent s on s.pid = p.id
left join hearts h on h.pid = p.id
left join boxes b on b.pid = p.id;

-- ── RLS ───────────────────────────────────────────────────────────────────────
alter table public.departments enable row level security;
alter table public.hashtags enable row level security;
alter table public.kudos enable row level security;
alter table public.kudos_likes enable row level security;
alter table public.special_days enable row level security;
alter table public.secret_boxes enable row level security;
alter table public.gift_grants enable row level security;
alter table public.rank_ups enable row level security;

-- Read-only reference data: any signed-in user may read.
do $$
declare t text;
begin
  foreach t in array array['departments','hashtags','special_days','gift_grants','rank_ups'] loop
    execute format('drop policy if exists "read %1$s" on public.%1$I', t);
    execute format('create policy "read %1$s" on public.%1$I for select to authenticated using (true)', t);
  end loop;
end $$;

-- Kudos: everyone (authed) reads; insert only as yourself.
drop policy if exists "read kudos" on public.kudos;
create policy "read kudos" on public.kudos for select to authenticated using (true);
drop policy if exists "insert own kudos" on public.kudos;
create policy "insert own kudos" on public.kudos for insert to authenticated
  with check (auth.uid() = sender_id);

-- Likes: everyone reads; user manages only their own like, and never on a kudos
-- they themselves sent (no self-like).
drop policy if exists "read likes" on public.kudos_likes;
create policy "read likes" on public.kudos_likes for select to authenticated using (true);
drop policy if exists "like as self" on public.kudos_likes;
create policy "like as self" on public.kudos_likes for insert to authenticated
  with check (
    auth.uid() = user_id
    and not exists (select 1 from public.kudos k where k.id = kudos_id and k.sender_id = auth.uid())
  );
drop policy if exists "unlike own" on public.kudos_likes;
create policy "unlike own" on public.kudos_likes for delete to authenticated
  using (auth.uid() = user_id);

-- Secret boxes: a user reads only their own.
drop policy if exists "read own boxes" on public.secret_boxes;
create policy "read own boxes" on public.secret_boxes for select to authenticated
  using (auth.uid() = user_id);

-- ── Grants ────────────────────────────────────────────────────────────────────
-- RLS controls WHICH ROWS a role sees, but the role still needs table-level
-- privileges first (otherwise: "permission denied for table ..."). Supabase's
-- default privileges don't always cover migration-created objects, so grant
-- explicitly to the `authenticated` role.
grant usage on schema public to authenticated;
grant select on
  public.profiles, public.departments, public.hashtags, public.kudos,
  public.kudos_likes, public.special_days, public.secret_boxes,
  public.gift_grants, public.rank_ups,
  public.kudos_with_counts, public.profile_stats
  to authenticated;
grant insert on public.kudos to authenticated;
grant insert, delete on public.kudos_likes to authenticated;

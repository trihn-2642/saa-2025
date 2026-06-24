-- Fix profile_stats.hearts_received: it must count hearts on kudos the profile
-- RECEIVED, not kudos they sent.
--
-- The original view grouped the hearts CTE by k.sender_id, so "Số tim bạn nhận
-- được" actually showed hearts earned on kudos the user *authored/sent*. That
-- contradicts the rest of the model — kudos_received and stars are receiver-based,
-- and toggleLike credits the receiver, not the liker. A like on a kudos endorses
-- the person the kudos praises (the receiver), so the heart belongs to them.
--
-- Only the `hearts` CTE changes (sender_id -> receiver_id); the view's output
-- columns are identical, so dependents (getProfileStats) are unaffected.

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
    -- Hearts a profile EARNED come from likes on kudos they RECEIVED.
    select k.receiver_id as pid,
           coalesce(sum(case when l.is_special then 2 else 1 end), 0)::int as hearts_received
    from public.kudos k join public.kudos_likes l on l.kudos_id = k.id
    group by k.receiver_id
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

/**
 * Server-side read queries for the Sun* Kudos feature.
 *
 * All functions use the @supabase/ssr server client (RLS-bound, anon key).
 * Never use the service-role key here — rely on RLS for access control.
 *
 * No realtime: callers refetch after mutations (submit/like).
 */

import { createClient } from "@/lib/supabase/server";
import { starsFromReceived, badgeFromSenders } from "./badges";
import type {
  KudosCard,
  Profile,
  ProfileStats,
  SpotlightData,
  Leaderboards,
  RankUpEntry,
  GiftRecipientEntry,
  HashtagOption,
  DepartmentOption,
  PaginatedResult,
  Filters,
  Stars,
  Badge,
} from "./types";

// ── Internal helpers ───────────────────────────────────────────────────────────

interface RawProfile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  departments: { name: string } | null;
}

interface RawProfileStats {
  kudos_received: number;
  distinct_senders: number;
  kudos_sent: number;
  hearts_received: number;
  stars: number;
  badge: string | null;
  secret_opened: number;
  secret_unopened: number;
}

/** Maps a raw profile row (with joined department) to the typed Profile shape. */
function mapProfile(
  raw: RawProfile,
): Profile & { stars: Stars; badge: Badge | null } {
  // stars and badge are derived client-side from profile_stats — default to 0/null
  // until the caller enriches them from the stats view join.
  return {
    id: raw.id,
    fullName: raw.full_name ?? "",
    avatarUrl: raw.avatar_url ?? null,
    departmentName: raw.departments?.name ?? null,
    stars: 0,
    badge: null,
  };
}

// ── listKudos ─────────────────────────────────────────────────────────────────

/**
 * Fetches a paginated list of kudos for the main feed.
 *
 * Uses keyset pagination on `created_at` (descending) so results stay stable
 * as new kudos are inserted. Pass the `nextCursor` from the previous page as
 * `cursor` to fetch the next batch.
 *
 * @param filters.hashtag    - Filter to kudos containing this hashtag string.
 * @param filters.department - Filter to kudos where the receiver belongs to this dept name.
 * @param filters.cursor     - ISO-8601 timestamp: return kudos created before this value.
 * @param filters.limit      - Max items per page (default 10).
 */
export async function listKudos({
  hashtag,
  department,
  cursor,
  limit = 10,
}: Filters & { cursor?: string; limit?: number }): Promise<
  PaginatedResult<KudosCard>
> {
  const supabase = await createClient();

  // Resolve the current user for likedByMe / canLike flags.
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const currentUserId = user?.id ?? null;

  // Build the query against kudos_with_counts (includes like_count + heart_weight).
  let query = supabase
    .from("kudos_with_counts")
    .select(
      `
      id,
      sender_id,
      receiver_id,
      message,
      hashtags,
      images,
      created_at,
      like_count,
      heart_weight,
      sender:profiles!kudos_sender_id_fkey (
        id, full_name, avatar_url,
        departments ( name )
      ),
      receiver:profiles!kudos_receiver_id_fkey (
        id, full_name, avatar_url,
        departments ( name )
      )
    `,
    )
    .order("created_at", { ascending: false })
    .limit(limit + 1); // fetch one extra to detect if a next page exists

  if (cursor) {
    query = query.lt("created_at", cursor);
  }

  if (hashtag) {
    query = query.contains("hashtags", [hashtag]);
  }

  const { data: rows, error } = await query;

  if (error) {
    throw new Error(`listKudos: ${error.message}`);
  }

  // Determine if another page exists.
  const hasMore = rows.length > limit;
  const pageRows = hasMore ? rows.slice(0, limit) : rows;

  // Collect all profile IDs to batch-fetch profile_stats.
  const profileIds = Array.from(
    new Set(pageRows.flatMap((r) => [r.sender_id, r.receiver_id])),
  );

  // Batch fetch profile_stats for stars + badge derivation.
  const statsMap = await fetchProfileStatsMap(supabase, profileIds);

  // Batch fetch which of these kudos the current user has liked.
  const kudosIds = pageRows.map((r) => r.id);
  const likedSet = currentUserId
    ? await fetchLikedSet(supabase, currentUserId, kudosIds)
    : new Set<string>();

  const items: KudosCard[] = pageRows.map((row) => {
    const senderStats = statsMap.get(row.sender_id);
    const receiverStats = statsMap.get(row.receiver_id);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const senderRaw = row.sender as any as RawProfile;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const receiverRaw = row.receiver as any as RawProfile;

    const sender = mapProfile(senderRaw);
    sender.stars = senderStats?.stars ?? 0;
    sender.badge = senderStats?.badge ?? null;

    const receiver = mapProfile(receiverRaw);
    receiver.stars = receiverStats?.stars ?? 0;
    receiver.badge = receiverStats?.badge ?? null;

    const likedByMe = likedSet.has(row.id);

    return {
      id: row.id,
      senderId: row.sender_id,
      receiverId: row.receiver_id,
      message: row.message,
      hashtags: row.hashtags ?? [],
      images: row.images ?? [],
      createdAt: row.created_at,
      likeCount: row.like_count ?? 0,
      heartWeight: row.heart_weight ?? 0,
      likedByMe,
      // canLike: not the sender AND not already liked
      canLike:
        currentUserId !== null && currentUserId !== row.sender_id && !likedByMe,
      // canEdit: only the sender can edit their own kudos
      canEdit: currentUserId !== null && currentUserId === row.sender_id,
      sender,
      receiver,
    };
  });

  return {
    items,
    nextCursor: hasMore ? pageRows[pageRows.length - 1].created_at : null,
  };
}

// ── listHighlightKudos ────────────────────────────────────────────────────────

/**
 * Fetches up to 5 kudos with the highest like_count for the highlight carousel.
 * Applies the same hashtag/department filters as the main feed.
 */
export async function listHighlightKudos(
  filters: Filters = {},
): Promise<KudosCard[]> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  const currentUserId = user?.id ?? null;

  let query = supabase
    .from("kudos_with_counts")
    .select(
      `
      id,
      sender_id,
      receiver_id,
      message,
      hashtags,
      images,
      created_at,
      like_count,
      heart_weight,
      sender:profiles!kudos_sender_id_fkey (
        id, full_name, avatar_url,
        departments ( name )
      ),
      receiver:profiles!kudos_receiver_id_fkey (
        id, full_name, avatar_url,
        departments ( name )
      )
    `,
    )
    .order("like_count", { ascending: false })
    .limit(5);

  if (filters.hashtag) {
    query = query.contains("hashtags", [filters.hashtag]);
  }

  const { data: rows, error } = await query;
  if (error) throw new Error(`listHighlightKudos: ${error.message}`);

  const profileIds = Array.from(
    new Set((rows ?? []).flatMap((r) => [r.sender_id, r.receiver_id])),
  );
  const statsMap = await fetchProfileStatsMap(supabase, profileIds);

  const kudosIds = (rows ?? []).map((r) => r.id);
  const likedSet = currentUserId
    ? await fetchLikedSet(supabase, currentUserId, kudosIds)
    : new Set<string>();

  return (rows ?? []).map((row) => {
    const senderStats = statsMap.get(row.sender_id);
    const receiverStats = statsMap.get(row.receiver_id);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const sender = mapProfile(row.sender as any as RawProfile);
    sender.stars = senderStats?.stars ?? 0;
    sender.badge = senderStats?.badge ?? null;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const receiver = mapProfile(row.receiver as any as RawProfile);
    receiver.stars = receiverStats?.stars ?? 0;
    receiver.badge = receiverStats?.badge ?? null;

    const likedByMe = likedSet.has(row.id);

    return {
      id: row.id,
      senderId: row.sender_id,
      receiverId: row.receiver_id,
      message: row.message,
      hashtags: row.hashtags ?? [],
      images: row.images ?? [],
      createdAt: row.created_at,
      likeCount: row.like_count ?? 0,
      heartWeight: row.heart_weight ?? 0,
      likedByMe,
      canLike:
        currentUserId !== null && currentUserId !== row.sender_id && !likedByMe,
      canEdit: currentUserId !== null && currentUserId === row.sender_id,
      sender,
      receiver,
    };
  });
}

// ── getSpotlight ──────────────────────────────────────────────────────────────

/**
 * Returns the total number of kudos sent and a flat list of receiver names
 * with the timestamp of the most recent kudos they received.
 * Used for the simplified name-cloud spotlight section (no pan/zoom).
 */
export async function getSpotlight(): Promise<SpotlightData> {
  const supabase = await createClient();

  const { data: rows, error } = await supabase
    .from("kudos")
    .select(
      `
      created_at,
      receiver:profiles!kudos_receiver_id_fkey ( full_name )
    `,
    )
    .order("created_at", { ascending: false });

  if (error) throw new Error(`getSpotlight: ${error.message}`);

  const total = rows?.length ?? 0;

  // Deduplicate receivers — keep the most recent kudos-received timestamp.
  const seen = new Map<string, string>();
  for (const row of rows ?? []) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const name: string = (row.receiver as any)?.full_name ?? "";
    if (name && !seen.has(name)) {
      seen.set(name, row.created_at);
    }
  }

  const names = Array.from(seen.entries()).map(([name, receivedAt]) => ({
    name,
    receivedAt,
  }));

  // Recent activity feed — one entry PER kudos (not deduplicated), newest first,
  // capped at 6 (the feed shows up to 6 with fading opacity).
  const recent = (rows ?? [])
    .map((row) => ({
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      name: ((row.receiver as any)?.full_name ?? "") as string,
      receivedAt: row.created_at,
    }))
    .filter((r) => r.name)
    .slice(0, 6);

  return { total, names, recent };
}

// ── getProfileStats ───────────────────────────────────────────────────────────

/**
 * Returns per-user stats for the sidebar from the profile_stats view.
 * Stars and badge are derived from the view columns (mirrors badges.ts logic).
 */
export async function getProfileStats(userId: string): Promise<ProfileStats> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("profile_stats")
    .select("*")
    .eq("id", userId)
    .single();

  if (error) throw new Error(`getProfileStats: ${error.message}`);

  const raw = data as RawProfileStats & { id: string };

  return {
    kudosReceived: raw.kudos_received ?? 0,
    kudosSent: raw.kudos_sent ?? 0,
    heartsReceived: raw.hearts_received ?? 0,
    // Use the SQL-derived values directly — they are the source of truth.
    stars: starsFromReceived(raw.kudos_received ?? 0),
    badge: badgeFromSenders(raw.distinct_senders ?? 0),
    secretOpened: raw.secret_opened ?? 0,
    secretUnopened: raw.secret_unopened ?? 0,
  };
}

// ── getLeaderboards ───────────────────────────────────────────────────────────

/**
 * Fetches the latest 10 rank-up events and 10 gift recipients for the leaderboard
 * display sections in the sidebar. Data is seeded by admins; display-only.
 */
export async function getLeaderboards(): Promise<Leaderboards> {
  const supabase = await createClient();

  const [rankUpsResult, giftsResult] = await Promise.all([
    supabase
      .from("rank_ups")
      .select(
        `
        id,
        badge,
        created_at,
        profiles ( id, full_name, avatar_url )
      `,
      )
      .order("created_at", { ascending: false })
      .limit(10),

    supabase
      .from("gift_grants")
      .select(
        `
        id,
        gift_name,
        created_at,
        profiles ( id, full_name, avatar_url )
      `,
      )
      .order("created_at", { ascending: false })
      .limit(10),
  ]);

  if (rankUpsResult.error)
    throw new Error(`getLeaderboards rank_ups: ${rankUpsResult.error.message}`);
  if (giftsResult.error)
    throw new Error(
      `getLeaderboards gift_grants: ${giftsResult.error.message}`,
    );

  const rankUps: RankUpEntry[] = (rankUpsResult.data ?? []).map((row) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const profile = row.profiles as any;
    return {
      userId: profile?.id ?? "",
      name: profile?.full_name ?? "",
      avatarUrl: profile?.avatar_url ?? null,
      badge: row.badge as Badge,
      createdAt: row.created_at,
    };
  });

  const giftRecipients: GiftRecipientEntry[] = (giftsResult.data ?? []).map(
    (row) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const profile = row.profiles as any;
      return {
        userId: profile?.id ?? "",
        name: profile?.full_name ?? "",
        avatarUrl: profile?.avatar_url ?? null,
        giftName: row.gift_name,
        createdAt: row.created_at,
      };
    },
  );

  return { rankUps, giftRecipients };
}

// ── listHashtags ───────────────────────────────────────────────────────────────

/** Returns all hashtags for the filter dropdown. */
export async function listHashtags(): Promise<HashtagOption[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("hashtags")
    .select("id, name")
    .order("name");

  if (error) throw new Error(`listHashtags: ${error.message}`);

  return (data ?? []).map((row) => ({ id: row.id, name: row.name }));
}

// ── listDepartments ────────────────────────────────────────────────────────────

/** Returns all departments for the filter dropdown. */
export async function listDepartments(): Promise<DepartmentOption[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("departments")
    .select("id, code, name")
    .order("name");

  if (error) throw new Error(`listDepartments: ${error.message}`);

  return (data ?? []).map((row) => ({
    id: row.id,
    code: row.code,
    name: row.name,
  }));
}

// ── getProfileCard ─────────────────────────────────────────────────────────────

/**
 * Returns all data needed for the hover profile card:
 * name, department, stars, badge, kudos sent/received counts.
 */
export async function getProfileCard(profileId: string): Promise<
  Profile & {
    stars: Stars;
    badge: Badge | null;
    kudosSent: number;
    kudosReceived: number;
  }
> {
  const supabase = await createClient();

  const [profileResult, statsResult] = await Promise.all([
    supabase
      .from("profiles")
      .select("id, full_name, avatar_url, departments ( name )")
      .eq("id", profileId)
      .single(),

    supabase
      .from("profile_stats")
      .select("kudos_sent, kudos_received, distinct_senders")
      .eq("id", profileId)
      .single(),
  ]);

  if (profileResult.error)
    throw new Error(`getProfileCard profile: ${profileResult.error.message}`);

  // Stats row may not exist if the user has never sent/received kudos.
  const raw = profileResult.data;
  const stats = statsResult.data;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const deptName = (raw.departments as any)?.name ?? null;

  const kudosReceived = stats?.kudos_received ?? 0;
  const distinctSenders = stats?.distinct_senders ?? 0;

  return {
    id: raw.id,
    fullName: raw.full_name ?? "",
    avatarUrl: raw.avatar_url ?? null,
    departmentName: deptName,
    stars: starsFromReceived(kudosReceived),
    badge: badgeFromSenders(distinctSenders),
    kudosSent: stats?.kudos_sent ?? 0,
    kudosReceived,
  };
}

// ── Internal batch helpers ─────────────────────────────────────────────────────

type SupabaseClient = Awaited<ReturnType<typeof createClient>>;

/**
 * Fetches profile_stats rows for multiple user IDs and returns a Map keyed by user ID.
 * Used internally to batch-resolve stars + badge for feed cards.
 */
async function fetchProfileStatsMap(
  supabase: SupabaseClient,
  profileIds: string[],
): Promise<Map<string, { stars: Stars; badge: Badge | null }>> {
  if (profileIds.length === 0) return new Map();

  const { data, error } = await supabase
    .from("profile_stats")
    .select("id, kudos_received, distinct_senders")
    .in("id", profileIds);

  if (error) throw new Error(`fetchProfileStatsMap: ${error.message}`);

  const map = new Map<string, { stars: Stars; badge: Badge | null }>();
  for (const row of data ?? []) {
    map.set(row.id, {
      stars: starsFromReceived(row.kudos_received ?? 0),
      badge: badgeFromSenders(row.distinct_senders ?? 0),
    });
  }
  return map;
}

/**
 * Returns a Set of kudos IDs that the given user has already liked.
 * Used to compute likedByMe + canLike per-card without N+1 queries.
 */
async function fetchLikedSet(
  supabase: SupabaseClient,
  userId: string,
  kudosIds: string[],
): Promise<Set<string>> {
  if (kudosIds.length === 0) return new Set();

  const { data, error } = await supabase
    .from("kudos_likes")
    .select("kudos_id")
    .eq("user_id", userId)
    .in("kudos_id", kudosIds);

  if (error) throw new Error(`fetchLikedSet: ${error.message}`);

  return new Set((data ?? []).map((row) => row.kudos_id));
}

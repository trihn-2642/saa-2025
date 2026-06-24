/**
 * Shared TypeScript types for the Sun* Kudos feature.
 *
 * These types mirror the kudos schema (supabase/migrations/20260617140000_kudos.sql)
 * and the derived views (kudos_with_counts, profile_stats).
 */

// ── Badge + Stars ──────────────────────────────────────────────────────────────

/** Badge tier derived from distinct-sender count (see badges.ts). */
export type Badge = "new" | "rising" | "super" | "legend";

/** Star level (0–3) derived from kudos-received count (see badges.ts). */
export type Stars = 0 | 1 | 2 | 3;

// ── Core entities ──────────────────────────────────────────────────────────────

/** Minimal user profile (public-readable fields). */
export interface Profile {
  id: string;
  fullName: string;
  avatarUrl: string | null;
  /** Department name (joined from departments table). */
  departmentName: string | null;
}

/** Minimal profile result from autocomplete search. */
export interface ProfileSearchResult {
  id: string;
  fullName: string;
  avatarUrl: string | null;
  departmentName: string | null;
}

/** Raw kudos row fields (before like-count aggregation). */
export interface Kudos {
  id: string;
  senderId: string;
  receiverId: string;
  message: string;
  hashtags: string[];
  images: string[];
  /** True if the sender chose to hide their identity on the card. */
  isAnonymous: boolean;
  /** Display nickname shown when isAnonymous (e.g. "Doraemon"); null otherwise. */
  anonymousName: string | null;
  /** "Danh hiệu" / award title shown as the centered heading (e.g. "IDOL"). */
  title: string | null;
  createdAt: string; // ISO-8601
}

/**
 * Kudos enriched for display on the feed / highlight carousel.
 * Includes sender + receiver profiles, like counts, and per-viewer flags.
 */
export interface KudosCard extends Kudos {
  sender: Profile & { stars: Stars; badge: Badge | null };
  receiver: Profile & { stars: Stars; badge: Badge | null };
  /** Total like count (like_count from kudos_with_counts view). */
  likeCount: number;
  /** Heart weight (like_count weighted by is_special, from kudos_with_counts). */
  heartWeight: number;
  /** True if the currently authenticated user has liked this kudos. */
  likedByMe: boolean;
  /**
   * True if the current user is allowed to like this kudos.
   * False when: user is the sender, OR the user has already liked it.
   */
  canLike: boolean;
  /** True if the current user is the sender — only they can edit this kudos. */
  canEdit: boolean;
}

// ── Per-user statistics ────────────────────────────────────────────────────────

/** Per-user stats derived from profile_stats view + secret_boxes. */
export interface ProfileStats {
  kudosReceived: number;
  kudosSent: number;
  /** Hearts earned by the sender of kudos this user sent. */
  heartsReceived: number;
  stars: Stars;
  badge: Badge | null;
  secretOpened: number;
  secretUnopened: number;
}

// ── Feed filters ───────────────────────────────────────────────────────────────

/** Active filters for the kudos feed and highlight carousel. */
export interface Filters {
  hashtag?: string;
  department?: string;
}

// ── Spotlight ──────────────────────────────────────────────────────────────────

export interface SpotlightName {
  name: string;
  receivedAt: string; // ISO-8601
}

/** Data for the simplified name-cloud spotlight section. */
export interface SpotlightData {
  total: number;
  /** Distinct receivers (deduplicated) — drives the scattered name cloud. */
  names: SpotlightName[];
  /** Recent kudos events (one per kudos, not deduplicated) — drives the feed. */
  recent: SpotlightName[];
}

// ── Leaderboards ───────────────────────────────────────────────────────────────

export interface RankUpEntry {
  userId: string;
  name: string;
  avatarUrl: string | null;
  badge: Badge;
  createdAt: string; // ISO-8601
}

export interface GiftRecipientEntry {
  userId: string;
  name: string;
  avatarUrl: string | null;
  giftName: string;
  createdAt: string; // ISO-8601
}

export interface Leaderboards {
  rankUps: RankUpEntry[];
  giftRecipients: GiftRecipientEntry[];
}

// ── Special-day campaign ─────────────────────────────────────────────────────────

/** An active double-hearts window (a special_days row covering "now"). */
export interface ActiveCampaign {
  startsAt: string; // ISO-8601
  endsAt: string; // ISO-8601
}

// ── Lookup lists ───────────────────────────────────────────────────────────────

export interface HashtagOption {
  id: string;
  name: string;
}

export interface DepartmentOption {
  id: string;
  code: string;
  name: string;
}

// ── Pagination ─────────────────────────────────────────────────────────────────

export interface PaginatedResult<T> {
  items: T[];
  /** ISO-8601 timestamp to pass as `cursor` in the next request, or null if no more pages. */
  nextCursor: string | null;
}

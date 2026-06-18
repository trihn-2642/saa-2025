/**
 * Pure badge + star derivation helpers.
 *
 * MUST stay in sync with the SQL thresholds in:
 *   supabase/migrations/20260617140000_kudos.sql  (profile_stats view)
 *
 * Thresholds (from SQL view):
 *   stars  : kudos_received >= 50 → 3 | >= 20 → 2 | >= 10 → 1 | else 0
 *   badge  : distinct_senders  >= 20 → legend | >= 10 → super
 *                               >= 5  → rising |  >= 1  → new | else null
 *
 * These functions are the single TS source of truth so UI components and
 * any client-side derivation never diverge from the DB view.
 */

import type { Badge, Stars } from "./types";

/**
 * Derives the star level (0–3) from the number of kudos the user has received.
 *
 * @param kudosReceived - Total kudos-received count for the user.
 * @returns Star level: 3 (≥50), 2 (≥20), 1 (≥10), or 0.
 */
export function starsFromReceived(kudosReceived: number): Stars {
  if (kudosReceived >= 50) return 3;
  if (kudosReceived >= 20) return 2;
  if (kudosReceived >= 10) return 1;
  return 0;
}

/**
 * Derives the badge tier from the count of *distinct* senders who have sent
 * kudos to this user.
 *
 * @param distinctSenders - Count of unique users who have sent a kudos to this user.
 * @returns Badge tier string or null when the user has received no kudos yet.
 */
export function badgeFromSenders(distinctSenders: number): Badge | null {
  if (distinctSenders >= 20) return "legend";
  if (distinctSenders >= 10) return "super";
  if (distinctSenders >= 5) return "rising";
  if (distinctSenders >= 1) return "new";
  return null;
}

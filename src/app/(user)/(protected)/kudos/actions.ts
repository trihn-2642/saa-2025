"use server";

/**
 * Server actions for the Sun* Kudos feature.
 *
 * All actions:
 * - Resolve the authenticated user from the server Supabase client (RLS-bound).
 * - Re-validate every business rule server-side even though RLS enforces them,
 *   following the defense-in-depth principle.
 * - Use server time (never trust client timestamps) for special-day checks.
 * - Call revalidatePath('/kudos') after every successful mutation so RSC
 *   consumers get fresh data on the next render (fetch+refetch model, no realtime).
 */

import { revalidatePath } from "next/cache";

import {
  getProfileCard,
  listHashtags,
  listHighlightKudos,
  listKudos,
  searchProfiles,
} from "@/lib/kudos/queries";
import {
  isHtmlContentEmpty,
  sanitizeKudosHtml,
} from "@/lib/kudos/sanitize-html";
import { createClient } from "@/lib/supabase/server";

// ── Client-callable read wrappers ───────────────────────────────────────────────
// The feed/highlight queries live in queries.ts which imports the server Supabase
// client (next/headers) — that cannot be imported into a Client Component. These
// thin "use server" wrappers expose them as server actions the client board can
// call for filter changes + load-more without pulling server-only code into the bundle.

export async function fetchFeed(input: {
  hashtag?: string;
  department?: string;
  cursor?: string;
  limit?: number;
}) {
  return listKudos(input);
}

export async function fetchHighlight(filters: {
  hashtag?: string;
  department?: string;
}) {
  return listHighlightKudos(filters);
}

/** Hover profile card — lazy-loaded when a user hovers an avatar/name. */
export async function fetchProfileCard(profileId: string) {
  return getProfileCard(profileId);
}

/**
 * Profile autocomplete for the recipient picker.
 * Excludes the current user; returns at most 10 matches.
 * Empty/whitespace query returns [] without hitting the DB.
 */
export async function fetchSearchProfiles(query: string) {
  return searchProfiles(query);
}

/**
 * Hashtag list for the submit-kudos dropdown.
 * Returns { value: name, label: name } pairs — the "#" prefix is added by the
 * presentation layer (dropdown + chip both render `#{label}`).
 */
export async function fetchHashtagOptions() {
  const hashtags = await listHashtags();
  return hashtags.map((h) => ({ value: h.name, label: h.name }));
}

// ── submitKudos ────────────────────────────────────────────────────────────────

export interface SubmitKudosInput {
  receiverId: string;
  /** "Danh hiệu" / award title — the centered card heading (required). */
  title: string;
  /** HTML from the rich-text editor. Sanitized server-side before insert. */
  message: string;
  /** Hashtag strings (already stored without '#' prefix). Min 1, max 5. */
  hashtags: string[];
  /** Public image URLs (e.g. uploaded to Supabase Storage). Max 5. */
  images?: string[];
  /** When true, the board card hides the sender's identity. Credit stays on sender_id. */
  isAnonymous?: boolean;
  /** Display nickname shown on the card when isAnonymous. Required if isAnonymous. */
  anonymousName?: string;
}

export interface SubmitKudosResult {
  id: string;
}

/**
 * Inserts a new kudos row.
 *
 * Business rules enforced:
 * - Authenticated user must exist (401 if not).
 * - `message` must be non-empty after trimming.
 * - `receiverId` must differ from the sender's own user ID.
 * - At most 5 hashtags; at most 10 images (truncated silently to cap).
 *
 * @throws Error with a user-facing message on validation failures or DB errors.
 */
export async function submitKudos(
  input: SubmitKudosInput,
): Promise<SubmitKudosResult> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthenticated");

  // Validate receiver.
  if (!input.receiverId) throw new Error("Receiver is required.");
  if (input.receiverId === user.id)
    throw new Error("You cannot send kudos to yourself.");

  // Title (Danh hiệu) is required.
  const title = (input.title ?? "").trim();
  if (!title) throw new Error("A title is required.");

  // Sanitize HTML message (authoritative XSS guard — submitKudos is directly callable).
  const sanitizedMessage = sanitizeKudosHtml(input.message ?? "");
  if (isHtmlContentEmpty(sanitizedMessage))
    throw new Error("Message cannot be empty.");

  // Enforce hashtag requirement (min 1, cap at 5).
  const hashtags = (input.hashtags ?? []).slice(0, 5);
  if (hashtags.length === 0)
    throw new Error("At least one hashtag is required.");

  // Cap images to 5 (UI enforces upstream; server caps for defense-in-depth).
  const images = (input.images ?? []).slice(0, 5);

  const isAnonymous = input.isAnonymous ?? false;
  // Nickname is required when anonymous (it's the name shown on the card).
  const anonymousName = isAnonymous ? (input.anonymousName ?? "").trim() : null;
  if (isAnonymous && !anonymousName)
    throw new Error("An anonymous nickname is required.");

  const { data, error } = await supabase
    .from("kudos")
    .insert({
      sender_id: user.id,
      receiver_id: input.receiverId,
      title,
      message: sanitizedMessage,
      hashtags,
      images,
      is_anonymous: isAnonymous,
      anonymous_name: anonymousName,
    })
    .select("id")
    .single();

  if (error) throw new Error(`Failed to submit kudos: ${error.message}`);

  revalidatePath("/kudos");

  return { id: data.id };
}

// ── toggleLike ─────────────────────────────────────────────────────────────────

export interface ToggleLikeResult {
  /** True if the like now exists (was added); false if it was removed. */
  liked: boolean;
  /** Updated total like count for the kudos. */
  likeCount: number;
}

/**
 * Toggles the current user's like on a kudos.
 *
 * Business rules enforced:
 * - Authenticated user must exist (401 if not).
 * - Self-likes are allowed (a like credits the receiver, not the liker).
 * - One like per (kudos, user) — duplicate insert is rejected by DB unique constraint;
 *   we check first to give a clean error.
 * - `is_special` is set to true when the like occurs during an active special_days window
 *   (server time only — never trust the client clock).
 * - Unlike recalls exactly the credited weight: stored `is_special` on the like row
 *   means the DB view recalculates hearts correctly on delete.
 *
 * @throws Error with a user-facing message on rule violations or DB errors.
 */
export async function toggleLike(kudosId: string): Promise<ToggleLikeResult> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthenticated");

  // Self-likes are allowed (a like credits the receiver, not the liker).
  // Check whether this user already has a like on this kudos.
  const { data: existingLike } = await supabase
    .from("kudos_likes")
    .select("id")
    .eq("kudos_id", kudosId)
    .eq("user_id", user.id)
    .maybeSingle();

  let liked: boolean;

  if (existingLike) {
    // Unlike: remove the existing like row.
    const { error: deleteError } = await supabase
      .from("kudos_likes")
      .delete()
      .eq("id", existingLike.id);

    if (deleteError)
      throw new Error(`Failed to unlike kudos: ${deleteError.message}`);

    liked = false;
  } else {
    // Like: determine if we are inside an active special_days window (server time).
    const now = new Date().toISOString();
    const { data: specialDay } = await supabase
      .from("special_days")
      .select("id")
      .lte("starts_at", now)
      .gte("ends_at", now)
      .limit(1)
      .maybeSingle();

    const isSpecial = specialDay !== null;

    const { error: insertError } = await supabase.from("kudos_likes").insert({
      kudos_id: kudosId,
      user_id: user.id,
      is_special: isSpecial,
    });

    if (insertError)
      throw new Error(`Failed to like kudos: ${insertError.message}`);

    liked = true;
  }

  // Fetch updated like_count from the view for the return value.
  const { data: counts, error: countsError } = await supabase
    .from("kudos_with_counts")
    .select("like_count")
    .eq("id", kudosId)
    .single();

  if (countsError)
    throw new Error(
      `Failed to read updated like count: ${countsError.message}`,
    );

  revalidatePath("/kudos");

  return { liked, likeCount: counts.like_count ?? 0 };
}

// ── openSecretBox ──────────────────────────────────────────────────────────────

export interface OpenSecretBoxResult {
  ok: boolean;
  message: string;
}

/**
 * STUB — Secret Box opening is display-only in this release.
 *
 * No DB write is performed. Returns a friendly "coming soon" result so the UI
 * can show a toast without a hard error.
 *
 * TODO (post-launch): implement actual gift-grant logic once the admin tooling
 * for seeding gift_grants and tracking opened secret_boxes is in place.
 */
export async function openSecretBox(): Promise<OpenSecretBoxResult> {
  // Auth check: ensure only signed-in users can trigger this endpoint,
  // even though it does nothing yet.
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthenticated");

  return { ok: true, message: "coming soon" };
}

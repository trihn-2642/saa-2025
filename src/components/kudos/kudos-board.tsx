"use client";

import { useCallback, useEffect, useRef, useState, useTransition } from "react";

import {
  fetchFeed,
  fetchHighlight,
  openSecretBox,
  toggleLike,
} from "@/app/(user)/(protected)/kudos/actions";
import {
  mapDepartmentOptions,
  mapGiftRecipients,
  mapHashtagOptions,
  mapRankUps,
  mapSidebarStats,
  mapSpotlightEntries,
  mapToCardProps,
} from "@/lib/kudos/mappers";
import type {
  DepartmentOption,
  Filters,
  GiftRecipientEntry,
  HashtagOption,
  KudosCard as KudosCardType,
  ProfileStats,
  RankUpEntry,
  SpotlightData,
} from "@/lib/kudos/types";
import { useSubmitKudosStore } from "@/stores/submit-kudos-store";

import { AllKudos } from "./all-kudos";
import { KudosBanner } from "./kudos-banner";
import { KudosHighlight } from "./kudos-highlight";
import { SpotlightBoard } from "./spotlight-board";

// ── Props ─────────────────────────────────────────────────────────────────────

export interface KudosBoardProps {
  /** Initial paginated feed (first page). */
  initialFeed: KudosCardType[];
  nextCursor: string | null;
  /** Highlight carousel cards (top by like_count). */
  highlightCards: KudosCardType[];
  /** Spotlight name-cloud data. */
  spotlight: SpotlightData;
  /** Current authenticated user stats for the sidebar. */
  stats: ProfileStats;
  /** Rank-up leaderboard. */
  rankUps: RankUpEntry[];
  /** Gift-recipient leaderboard. */
  giftRecipients: GiftRecipientEntry[];
  /** Filter lookup lists. */
  hashtags: HashtagOption[];
  departments: DepartmentOption[];
}

// ── Internal helpers ──────────────────────────────────────────────────────────

/** Toggle a single card's like state optimistically (before server confirms). */
function applyOptimisticLike(
  cards: KudosCardType[],
  id: string,
): KudosCardType[] {
  return cards.map((c) =>
    c.id !== id
      ? c
      : {
          ...c,
          likedByMe: !c.likedByMe,
          likeCount: c.likedByMe ? c.likeCount - 1 : c.likeCount + 1,
          canLike: c.likedByMe,
        },
  );
}

/** Reconcile a card's like state with the confirmed server result. */
function reconcileLike(
  cards: KudosCardType[],
  id: string,
  liked: boolean,
  likeCount: number,
): KudosCardType[] {
  return cards.map((c) =>
    c.id !== id ? c : { ...c, likedByMe: liked, likeCount, canLike: !liked },
  );
}

// ── KudosBoard ────────────────────────────────────────────────────────────────

export function KudosBoard({
  initialFeed,
  nextCursor: initialNextCursor,
  highlightCards: initialHighlight,
  spotlight,
  stats,
  rankUps,
  giftRecipients,
  hashtags,
  departments,
}: KudosBoardProps) {
  // ── Filter state ─────────────────────────────────────────────────────────
  const [selectedHashtag, setSelectedHashtag] = useState<string | undefined>();
  const [selectedDepartment, setSelectedDepartment] = useState<
    string | undefined
  >();

  // ── Feed state ───────────────────────────────────────────────────────────
  const [feedCards, setFeedCards] = useState<KudosCardType[]>(initialFeed);
  const [nextCursor, setNextCursor] = useState<string | null>(
    initialNextCursor,
  );
  const [highlightCards, setHighlightCards] =
    useState<KudosCardType[]>(initialHighlight);
  const [loadingMore, setLoadingMore] = useState(false);

  const [, startTransition] = useTransition();

  // ── Filter change: reload highlight + feed, reset pagination ─────────────
  const handleFilterChange = useCallback(async (filters: Filters) => {
    try {
      const [newFeed, newHighlight] = await Promise.all([
        fetchFeed({ ...filters, limit: 10 }),
        fetchHighlight(filters),
      ]);
      setFeedCards(newFeed.items);
      setNextCursor(newFeed.nextCursor);
      setHighlightCards(newHighlight);
    } catch {
      // Non-blocking: filter re-query failure leaves existing data visible.
    }
  }, []);

  const handleHashtagChange = useCallback(
    (value: string) => {
      const newHashtag = value || undefined;
      setSelectedHashtag(newHashtag);
      startTransition(() => {
        handleFilterChange({
          hashtag: newHashtag,
          department: selectedDepartment,
        });
      });
    },
    [handleFilterChange, selectedDepartment],
  );

  const handleDepartmentChange = useCallback(
    (value: string) => {
      const newDept = value || undefined;
      setSelectedDepartment(newDept);
      startTransition(() => {
        handleFilterChange({ hashtag: selectedHashtag, department: newDept });
      });
    },
    [handleFilterChange, selectedHashtag],
  );

  // ── Infinite scroll: load next page ─────────────────────────────────────
  const handleLoadMore = useCallback(async () => {
    if (!nextCursor || loadingMore) return;
    setLoadingMore(true);
    try {
      const result = await fetchFeed({
        hashtag: selectedHashtag,
        department: selectedDepartment,
        cursor: nextCursor,
        limit: 10,
      });
      setFeedCards((prev) => [...prev, ...result.items]);
      setNextCursor(result.nextCursor);
    } catch {
      // Non-blocking: failed page load leaves existing cards visible.
    } finally {
      setLoadingMore(false);
    }
  }, [nextCursor, loadingMore, selectedHashtag, selectedDepartment]);

  // ── Optimistic like toggle ────────────────────────────────────────────────
  const handleLike = useCallback(async (id: string) => {
    setFeedCards((prev) => applyOptimisticLike(prev, id));
    setHighlightCards((prev) => applyOptimisticLike(prev, id));
    try {
      const { liked, likeCount } = await toggleLike(id);
      setFeedCards((prev) => reconcileLike(prev, id, liked, likeCount));
      setHighlightCards((prev) => reconcileLike(prev, id, liked, likeCount));
    } catch {
      // Revert optimistic update on server error.
      setFeedCards((prev) => applyOptimisticLike(prev, id));
      setHighlightCards((prev) => applyOptimisticLike(prev, id));
    }
  }, []);

  // ── Copy link ─────────────────────────────────────────────────────────────
  const handleCopyLink = useCallback(async (id: string) => {
    const url = `${window.location.origin}/kudos?id=${id}`;
    try {
      await navigator.clipboard.writeText(url);
    } catch (error) {
      // Clipboard not available in some secure contexts — silent fallback.
      console.log("Failed to copy link:", error);
    }
  }, []);

  // ── Open gift (stub) ──────────────────────────────────────────────────────
  const handleOpenGift = useCallback(async () => {
    try {
      const result = await openSecretBox();
      // TODO: show a toast with the result (e.g., "You got a gift!").
      console.log(result);
    } catch (error) {
      console.log("Failed to open gift:", error);
    }
  }, []);

  // Open the global submit-kudos dialog (mounted once in the protected layout).
  const openSubmitDialog = useSubmitKudosStore((s) => s.open);
  const handleOpenDialog = useCallback(() => {
    openSubmitDialog();
  }, [openSubmitDialog]);

  // Refetch the first page when a kudos is submitted, so the new one shows up
  // (feedCards is client state seeded from props — router.refresh alone won't
  // reset it). The ref guards against firing on filter changes.
  const submittedAt = useSubmitKudosStore((s) => s.submittedAt);
  const lastSubmittedRef = useRef(submittedAt);
  useEffect(() => {
    if (submittedAt === lastSubmittedRef.current) return;
    lastSubmittedRef.current = submittedAt;
    handleFilterChange({
      hashtag: selectedHashtag,
      department: selectedDepartment,
    });
  }, [submittedAt, handleFilterChange, selectedHashtag, selectedDepartment]);

  return (
    <div className="min-h-screen w-full bg-details-background">
      <KudosBanner onOpenDialog={handleOpenDialog} />

      <div className="flex flex-col gap-30 px-36 pt-6.25">
        <KudosHighlight
          cards={highlightCards.map(mapToCardProps)}
          hashtags={mapHashtagOptions(hashtags)}
          departments={mapDepartmentOptions(departments)}
          selectedHashtag={selectedHashtag}
          selectedDepartment={selectedDepartment}
          onHashtagChange={handleHashtagChange}
          onDepartmentChange={handleDepartmentChange}
          onLike={handleLike}
          onCopyLink={handleCopyLink}
          onViewDetail={() => {}}
        />

        <SpotlightBoard
          totalKudos={spotlight.total}
          entries={mapSpotlightEntries(spotlight)}
          activity={spotlight.recent}
        />

        <AllKudos
          cards={feedCards.map(mapToCardProps)}
          hasMore={!!nextCursor}
          loadingMore={loadingMore}
          onLoadMore={handleLoadMore}
          onLike={handleLike}
          onCopyLink={handleCopyLink}
          stats={mapSidebarStats(stats)}
          rankUps={mapRankUps(rankUps)}
          giftRecipients={mapGiftRecipients(giftRecipients)}
          onOpenGift={handleOpenGift}
        />
      </div>
    </div>
  );
}

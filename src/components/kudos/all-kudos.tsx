"use client";

import { cn } from "@/lib/cn";
import type { ActiveCampaign } from "@/lib/kudos/types";

import { AllKudosFeed } from "./all-kudos-feed";
import {
  AllKudosSidebar,
  type LeaderboardEntry,
  type SidebarStats,
} from "./all-kudos-sidebar";
import type { KudosCardProps } from "./kudos-card";
import { KudosSectionHeader } from "./kudos-section-header";

export interface AllKudosProps {
  /** Feed cards (already mapped to UI props). */
  cards: KudosCardProps[];
  hasMore?: boolean;
  loadingMore?: boolean;
  onLoadMore?: () => void;
  onLike?: (id: string) => void;
  onCopyLink?: (id: string) => void;
  onViewDetail?: (id: string) => void;
  /** Sidebar data (already mapped to UI props). */
  stats: SidebarStats;
  rankUps: LeaderboardEntry[];
  giftRecipients: LeaderboardEntry[];
  onOpenGift?: () => void;
  /** Active double-hearts window, or null when none is running. */
  activeCampaign?: ActiveCampaign | null;
  className?: string;
}

/**
 * AllKudos — the "ALL KUDOS" section: header + infinite-scroll feed (left) and
 * the stats/leaderboard sidebar (right).
 */
export function AllKudos({
  cards,
  hasMore,
  loadingMore,
  onLoadMore,
  onLike,
  onCopyLink,
  onViewDetail,
  stats,
  rankUps,
  giftRecipients,
  onOpenGift,
  activeCampaign,
  className,
}: AllKudosProps) {
  return (
    <div className={cn("mb-30 space-y-8", className)}>
      <KudosSectionHeader title="ALL KUDOS" />

      <div className="flex justify-between">
        <AllKudosFeed
          cards={cards}
          hasMore={hasMore}
          loadingMore={loadingMore}
          onLoadMore={onLoadMore}
          onLike={onLike}
          onCopyLink={onCopyLink}
          onViewDetail={onViewDetail}
        />

        <AllKudosSidebar
          stats={stats}
          rankUps={rankUps}
          giftRecipients={giftRecipients}
          onOpenGift={onOpenGift}
          activeCampaign={activeCampaign}
        />
      </div>
    </div>
  );
}

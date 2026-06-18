import type { KudosCardProps } from "@/components/kudos/kudos-card";
import type { FilterOption } from "@/components/kudos/kudos-highlight-filters";
import type {
  LeaderboardEntry,
  SidebarStats,
} from "@/components/kudos/all-kudos-sidebar";
import type { SpotlightEntry } from "@/components/kudos/spotlight-board";
import type {
  KudosCard,
  HashtagOption,
  DepartmentOption,
  RankUpEntry,
  GiftRecipientEntry,
  SpotlightData,
  ProfileStats,
} from "./types";

/** Format an ISO timestamp as the design's "HH:mm - MM/DD/YYYY" (e.g. "10:00 - 10/30/2025"). */
export function formatKudosDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  const p = (n: number) => String(n).padStart(2, "0");
  return `${p(d.getHours())}:${p(d.getMinutes())} - ${p(d.getMonth() + 1)}/${p(d.getDate())}/${d.getFullYear()}`;
}

/** Map a lib KudosCard (DB shape) → KudosCardProps (UI component shape). */
export function mapToCardProps(card: KudosCard): KudosCardProps {
  return {
    id: card.id,
    sender: {
      id: card.sender.id,
      name: card.sender.fullName,
      dept: card.sender.departmentName ?? "",
      avatarUrl: card.sender.avatarUrl ?? undefined,
      stars: card.sender.stars,
      badge: card.sender.badge ?? undefined,
    },
    receiver: {
      id: card.receiver.id,
      name: card.receiver.fullName,
      dept: card.receiver.departmentName ?? "",
      avatarUrl: card.receiver.avatarUrl ?? undefined,
      stars: card.receiver.stars,
      badge: card.receiver.badge ?? undefined,
    },
    createdAt: formatKudosDate(card.createdAt),
    content: card.message,
    hashtags: card.hashtags,
    images: card.images,
    likeCount: card.likeCount,
    likedByMe: card.likedByMe,
    canLike: card.canLike,
    canEdit: card.canEdit,
  };
}

export function mapHashtagOptions(hashtags: HashtagOption[]): FilterOption[] {
  return hashtags.map((h) => ({ value: h.name, label: `#${h.name}` }));
}

export function mapDepartmentOptions(
  departments: DepartmentOption[],
): FilterOption[] {
  return departments.map((d) => ({ value: d.name, label: d.name }));
}

export function mapRankUps(entries: RankUpEntry[]): LeaderboardEntry[] {
  return entries.map((e) => ({
    id: e.userId,
    name: e.name,
    avatarUrl: e.avatarUrl ?? undefined,
  }));
}

export function mapGiftRecipients(
  entries: GiftRecipientEntry[],
): LeaderboardEntry[] {
  return entries.map((e) => ({
    id: e.userId,
    name: e.name,
    avatarUrl: e.avatarUrl ?? undefined,
    subtitle: e.giftName, // full phrase, e.g. "Nhận được 1 áo phông SAA"
  }));
}

export function mapSpotlightEntries(data: SpotlightData): SpotlightEntry[] {
  return data.names.map((n, idx) => ({
    id: String(idx),
    name: n.name,
    kudosCount: 1, // relative weight — spotlight board sorts by kudosCount
    receivedAt: n.receivedAt,
  }));
}

/** Map lib ProfileStats → KudosSidebar SidebarStats (field-name translation). */
export function mapSidebarStats(stats: ProfileStats): SidebarStats {
  return {
    kudosReceived: stats.kudosReceived,
    kudosSent: stats.kudosSent,
    heartsReceived: stats.heartsReceived,
    secretBoxOpened: stats.secretOpened,
    secretBoxUnopened: stats.secretUnopened,
  };
}

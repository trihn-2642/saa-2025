"use client";

import type { ReactNode } from "react";
import Image from "next/image";
import { useFormatter, useTranslations } from "next-intl";

import IcOpenGift from "@icons/ic-open-gift.svg";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import type { ActiveCampaign } from "@/lib/kudos/types";

import { HoverProfileCard } from "./hover-profile-card";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface SidebarStats {
  kudosReceived: number;
  kudosSent: number;
  heartsReceived: number;
  secretBoxOpened: number;
  secretBoxUnopened: number;
}

export interface LeaderboardEntry {
  id: string;
  name: string;
  avatarUrl?: string;
  /** Secondary line under the name (e.g. the gift received). */
  subtitle?: string;
}

export interface AllKudosSidebarProps {
  stats: SidebarStats;
  rankUps: LeaderboardEntry[];
  giftRecipients: LeaderboardEntry[];
  onOpenGift?: () => void;
  /** Active double-hearts window — drives the ×2 badge. Null hides the badge. */
  activeCampaign?: ActiveCampaign | null;
  className?: string;
}

// ─── Shared styles ────────────────────────────────────────────────────────────

const boxClass =
  "rounded-[17px] border border-primary-dark-hover bg-details-overlay p-6";

// ─── Sub-components ───────────────────────────────────────────────────────────

interface StatRowProps {
  label: string;
  value: number;
  /** Optional node rendered right after the label (e.g. the campaign ×2 badge). */
  badge?: ReactNode;
}

function StatRow({ label, value, badge }: StatRowProps) {
  return (
    <div className="flex flex-row items-center justify-between">
      <span className="flex items-center text-cta font-bold text-white">
        {label}
        {badge}
      </span>
      <span className="text-[32px] leading-10 font-bold text-primary-normal">
        {value}
      </span>
    </div>
  );
}

/**
 * Campaign ×2 badge with a hover tooltip explaining the double-hearts window.
 * Dates come from the active special_days row (not hardcoded).
 */
function CampaignBadge({ campaign }: { campaign: ActiveCampaign }) {
  const t = useTranslations("kudos");
  const format = useFormatter();
  // Format in the event's timezone so the window reads the same for everyone.
  const dateOpts = {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Ho_Chi_Minh",
  } as const;
  const start = format.dateTime(new Date(campaign.startsAt), dateOpts);
  const end = format.dateTime(new Date(campaign.endsAt), dateOpts);
  return (
    <span className="group relative inline-flex">
      <Image src="/images/title/campain.png" alt="x2" width={34} height={40} />

      {/* Tooltip — fire icon + title + description, shown on hover. */}
      <span className="pointer-events-none absolute top-full left-1/2 z-50 mt-2 -translate-x-1/2 opacity-0 transition-opacity duration-150 group-hover:opacity-100">
        <span className="flex w-92 gap-4 rounded-2xl border border-primary-dark-hover bg-details-overlay p-4 text-left shadow-lg">
          <Image
            src="/images/title/campain.png"
            alt=""
            width={57}
            height={67}
            className="h-12 w-auto shrink-0"
          />
          <span className="flex flex-col gap-1">
            <span className="text-body font-bold text-white">
              {t("sidebar.campaign.title")}
            </span>
            <span className="text-sm leading-5 text-neutral-dark-hover">
              {t("sidebar.campaign.desc", { start, end })}
            </span>
          </span>
        </span>
      </span>
    </span>
  );
}

interface SidebarLeaderboardProps {
  title: string;
  entries: LeaderboardEntry[];
  emptyText: string;
}

function SidebarLeaderboard({
  title,
  entries,
  emptyText,
}: SidebarLeaderboardProps) {
  return (
    <div className={cn(boxClass, "px-0")}>
      <h3 className="mb-2.5 px-6 text-center text-cta font-bold whitespace-pre-line text-primary-normal">
        {title}
      </h3>
      {entries.length === 0 ? (
        <p className="px-6 text-center text-body text-neutral-dark-hover">
          {emptyText}
        </p>
      ) : (
        <div className="custom-scrollbar flex max-h-95.5 flex-col gap-4 overflow-y-auto px-6">
          {entries.map((entry) => (
            <div key={entry.id} className="flex flex-row items-center gap-2">
              {/* Hover the avatar → lazy-loaded profile card (same as feed cards). */}
              <HoverProfileCard profileId={entry.id}>
                <span className="relative block h-16 w-16 shrink-0">
                  {entry.avatarUrl ? (
                    <Image
                      src={entry.avatarUrl}
                      alt={entry.name}
                      fill
                      sizes="64px"
                      className="rounded-full border-2 border-white object-cover"
                    />
                  ) : (
                    <span className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-white bg-gray-200 text-2xl font-bold text-gray-500">
                      {entry.name.charAt(0)}
                    </span>
                  )}
                </span>
              </HoverProfileCard>
              <div className="flex min-w-0 flex-col gap-1">
                <span className="truncate text-cta font-bold text-primary-normal">
                  {entry.name}
                </span>
                {entry.subtitle && (
                  <span className="truncate text-body font-bold text-white">
                    {entry.subtitle}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── KudosSidebar ─────────────────────────────────────────────────────────────

export function AllKudosSidebar({
  stats,
  giftRecipients,
  onOpenGift,
  activeCampaign,
  className,
}: AllKudosSidebarProps) {
  const t = useTranslations("kudos");

  return (
    <aside className={cn("flex w-105.5 flex-col gap-6", className)}>
      {/* Stats box */}
      <div className={cn(boxClass, "flex flex-col gap-4")}>
        <StatRow label={t("sidebar.received")} value={stats.kudosReceived} />
        <StatRow label={t("sidebar.sent")} value={stats.kudosSent} />
        <StatRow
          label={t("sidebar.hearts")}
          value={stats.heartsReceived}
          badge={
            activeCampaign ? <CampaignBadge campaign={activeCampaign} /> : null
          }
        />
        <div className="my-1 border-t border-border-subtle" />
        <StatRow
          label={t("sidebar.secretOpened")}
          value={stats.secretBoxOpened}
        />
        <StatRow
          label={t("sidebar.secretUnopened")}
          value={stats.secretBoxUnopened}
        />
        <Button
          variant="primary"
          className="w-full text-cta font-bold"
          onClick={onOpenGift}
          iconRight={<IcOpenGift aria-hidden className="size-6!" />}
        >
          {t("sidebar.openGift")}
        </Button>
      </div>

      <SidebarLeaderboard
        title={t("sidebar.giftRecipients")}
        entries={giftRecipients}
        emptyText={t("empty.noData")}
      />
    </aside>
  );
}

"use client";

import { useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";

import IcHeart from "@icons/ic-heart.svg";
import IcLink from "@icons/ic-link.svg";
import IcPen from "@icons/ic-pen.svg";
import IcSend from "@icons/ic-send.svg";
import IcUp from "@icons/ic-up.svg";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";

import type { BadgeTier } from "./badge-chip";
import { BadgeChip } from "./badge-chip";
import { BadgeTooltip } from "./badge-tooltip";
import { HoverProfileCard } from "./hover-profile-card";

// ─── Types ────────────────────────────────────────────────────────────────────

export type { BadgeTier };

export interface KudosUser {
  id: string;
  name: string;
  dept: string;
  avatarUrl?: string;
  stars: number; // 0–3
  badge?: BadgeTier;
}

export interface KudosCardProps {
  id: string;
  sender: KudosUser;
  receiver: KudosUser;
  createdAt: string;
  content: string;
  hashtags: string[];
  images: string[];
  likeCount: number;
  likedByMe: boolean;
  canLike: boolean;
  /** True when the current user is the sender — shows the edit pencil. */
  canEdit?: boolean;
  variant?: "highlight" | "feed";
  onLike?: () => void | Promise<void>;
  onCopyLink?: () => void;
  onViewDetail?: () => void;
  onEdit?: () => void;
}

// ─── UserBlock sub-component ──────────────────────────────────────────────────

interface UserBlockProps {
  user: KudosUser;
}

function UserBlock({ user }: UserBlockProps) {
  return (
    <div className="flex min-w-0 flex-1 flex-col items-center gap-3.25">
      <HoverProfileCard profileId={user.id}>
        <span className="relative block h-16 w-16 shrink-0">
          {user.avatarUrl ? (
            <Image
              src={user.avatarUrl}
              alt={user.name}
              fill
              sizes="64px"
              className="rounded-full border-2 border-white object-cover"
            />
          ) : (
            <span className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-white bg-gray-200 text-2xl font-bold text-gray-500">
              {user.name.charAt(0)}
            </span>
          )}
        </span>
      </HoverProfileCard>

      <div className="flex flex-col items-center gap-0.5">
        <span className="w-full truncate text-center text-body font-bold tracking-[0.15px] text-text-primary-2">
          {user.name}
        </span>
        {/* Department • badge on one inline row (per design). */}
        <div className="flex max-w-full items-center gap-2.5 text-center">
          {user.dept && (
            <span className="truncate text-sm leading-5 font-bold tracking-[0.1px] text-neutral-dark-hover">
              {user.dept}
            </span>
          )}
          {user.dept && user.badge && (
            <span className="block h-1 w-1 rounded-full bg-neutral-dark-hover" />
          )}
          {user.badge && (
            <BadgeTooltip tier={user.badge} className="shrink-0">
              <BadgeChip tier={user.badge} />
            </BadgeTooltip>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── KudosCard ────────────────────────────────────────────────────────────────

export function KudosCard({
  sender,
  receiver,
  createdAt,
  content,
  hashtags,
  images,
  likeCount,
  likedByMe,
  canLike,
  canEdit,
  variant = "feed",
  onLike,
  onCopyLink,
  onViewDetail,
  onEdit,
}: KudosCardProps) {
  const t = useTranslations("kudos");
  const isHighlight = variant === "highlight";
  const contentClamp = isHighlight ? "line-clamp-3" : "line-clamp-4";
  const hashtagLine = hashtags.map((t) => `#${t}`).join(" ");

  // Guard against rapid double-likes: disable while the toggle is in flight.
  const [liking, setLiking] = useState(false);
  const handleLike = async () => {
    if (liking) return;
    setLiking(true);
    try {
      await onLike?.();
    } finally {
      setLiking(false);
    }
  };

  return (
    <div
      className={cn(
        "flex w-full flex-col gap-4 rounded-3xl bg-primary-light-active",
        isHighlight ? "px-6 py-4" : "p-10 pb-4",
      )}
    >
      {/* User info row — columns top-aligned; send icon sits at avatar center
          (avatar is size-16, icon size-6 → mt-5 centers it). */}
      <div className="flex flex-row items-start justify-between">
        <UserBlock user={sender} />
        <IcSend
          aria-hidden
          className="mt-5 size-8 shrink-0 text-text-primary-2"
        />
        <UserBlock user={receiver} />
      </div>

      {/* Divider */}
      <div className="h-px w-full bg-primary-normal" />

      {/* Content section */}
      <div className="flex flex-col gap-4">
        <span className="text-body leading-6 font-bold tracking-[0.5px] text-neutral-dark-hover">
          {createdAt}
        </span>

        {/* Category row — centered label, with the edit pencil pinned right.
            Pencil shows only on feed cards the current user sent. */}
        {(hashtags.length > 0 || (!isHighlight && canEdit)) && (
          <div className="relative flex min-h-6 items-center justify-center">
            {hashtags.length > 0 && (
              <span className="text-center text-body leading-6 font-bold tracking-[0.5px] text-text-primary-2 uppercase">
                {hashtags[0]}
              </span>
            )}
            {!isHighlight && canEdit && (
              <Button
                variant="icon"
                onClick={onEdit}
                aria-label={t("card.edit")}
                className="absolute right-0 text-text-primary-2"
              >
                <IcPen aria-hidden className="size-8!" />
              </Button>
            )}
          </div>
        )}

        <div
          className={cn(
            "rounded-xl border border-primary-normal bg-[rgba(255,234,158,0.40)] px-6",
            isHighlight ? "min-h-32.5 py-4" : "min-h-48 py-8",
          )}
        >
          <p
            className={cn(
              "text-[20px] leading-8 font-bold text-text-primary-2",
              contentClamp,
            )}
          >
            {content}
          </p>
        </div>

        {!isHighlight && images.length > 0 && (
          <div className="flex flex-row gap-4">
            {images.slice(0, 5).map((src, i) => (
              <div
                key={i}
                className="relative h-22 w-22 shrink-0 overflow-hidden rounded-[18px] border border-primary-dark-hover"
              >
                <Image
                  src={src}
                  alt={`image-${i}`}
                  fill
                  sizes="88px"
                  className="object-cover"
                />
              </div>
            ))}
          </div>
        )}

        {hashtagLine && (
          <span
            className={cn(
              "text-body leading-6 font-bold tracking-[0.25px] text-error",
              isHighlight ? "truncate" : "line-clamp-2",
            )}
          >
            {hashtagLine}
          </span>
        )}
      </div>

      {/* Divider */}
      <div className="h-px w-full bg-primary-normal" />

      {/* Action bar */}
      <div className="flex h-14 flex-row items-center justify-between">
        {/* Like — count + heart. Heart is black by default (brightness-0 over the
            red SVG), red when liked. Toggles like/unlike; disabled only on own kudos. */}
        <button
          type="button"
          onClick={handleLike}
          disabled={liking || (!likedByMe && !canLike)}
          className="flex cursor-pointer items-center gap-1 disabled:cursor-not-allowed disabled:opacity-50"
          aria-label="Like"
          aria-pressed={likedByMe}
          aria-busy={liking}
        >
          <span className="text-subtitle font-bold text-text-primary-2">
            {likeCount}
          </span>
          <IcHeart
            aria-hidden
            className={cn(
              "size-8 transition-[filter]",
              !likedByMe && "brightness-0",
            )}
          />
        </button>

        <div className="flex items-center gap-6">
          <Button
            type="button"
            variant="text"
            onClick={onCopyLink}
            iconRight={<IcLink aria-hidden className="size-6!" />}
            className="h-14 px-0 py-0 text-body font-bold text-text-primary-2 hover:bg-transparent"
          >
            {t("card.copyLink")}
          </Button>

          {isHighlight && (
            <Button
              type="button"
              variant="text"
              onClick={onViewDetail}
              iconRight={<IcUp aria-hidden className="size-6!" />}
              className="h-14 px-0 py-0 text-body font-bold text-text-primary-2 hover:bg-transparent"
            >
              {t("card.viewDetail")}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

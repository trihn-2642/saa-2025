"use client";

import { useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/cn";
import { KudosCard, type KudosCardProps } from "./kudos-card";

export interface AllKudosFeedProps {
  cards: KudosCardProps[];
  /** True while more pages exist — enables the infinite-scroll trigger. */
  hasMore?: boolean;
  /** True while a page is loading — shows the loading hint, blocks re-trigger. */
  loadingMore?: boolean;
  /** Called when the scroll sentinel comes into view (load next page). */
  onLoadMore?: () => void;
  onLike?: (id: string) => void;
  onCopyLink?: (id: string) => void;
  onViewDetail?: (id: string) => void;
  className?: string;
}

export function AllKudosFeed({
  cards,
  hasMore,
  loadingMore,
  onLoadMore,
  onLike,
  onCopyLink,
  onViewDetail,
  className,
}: AllKudosFeedProps) {
  const t = useTranslations("kudos");
  const sentinelRef = useRef<HTMLDivElement>(null);

  // Infinite scroll: load the next page when the sentinel nears the viewport.
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el || !hasMore || !onLoadMore) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) onLoadMore();
      },
      { rootMargin: "300px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [hasMore, onLoadMore]);

  return (
    <section className={cn("flex w-170 flex-col gap-6", className)}>
      {cards.length === 0 ? (
        <div className="flex items-center justify-center py-16">
          <p className="text-body text-neutral-dark-hover">
            {t("empty.noKudos")}
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {cards.map((card) => (
            // relative + hover:z so the hovered card's profile popover sits above
            // the card below it.
            <div key={card.id} className="relative hover:z-40">
              <KudosCard
                {...card}
                variant="feed"
                onLike={() => onLike?.(card.id)}
                onCopyLink={() => onCopyLink?.(card.id)}
                onViewDetail={() => onViewDetail?.(card.id)}
              />
            </div>
          ))}

          {/* Infinite-scroll sentinel + loading hint. */}
          {hasMore && (
            <div
              ref={sentinelRef}
              className="flex items-center justify-center py-4"
            >
              {loadingMore && (
                <span className="text-body text-neutral-dark-hover">
                  {t("feed.loadingMore")}
                </span>
              )}
            </div>
          )}
        </div>
      )}
    </section>
  );
}

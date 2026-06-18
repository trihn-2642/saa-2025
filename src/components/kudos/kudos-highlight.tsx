"use client";

import IcLeft from "@icons/ic-left.svg";
import IcRight from "@icons/ic-right.svg";
import useEmblaCarousel from "embla-carousel-react";
import { useCallback, useEffect, useState } from "react";
import { cn } from "@/lib/cn";
import {
  KudosHighlightFilters,
  type FilterOption,
} from "./kudos-highlight-filters";
import { KudosSectionHeader } from "./kudos-section-header";
import { KudosCard, type KudosCardProps } from "./kudos-card";
import { Button } from "../ui/button";

export interface KudosHighlightProps {
  cards: KudosCardProps[];
  hashtags?: FilterOption[];
  departments?: FilterOption[];
  selectedHashtag?: string;
  selectedDepartment?: string;
  onHashtagChange?: (value: string) => void;
  onDepartmentChange?: (value: string) => void;
  onLike?: (id: string) => void;
  onCopyLink?: (id: string) => void;
  onViewDetail?: (id: string) => void;
}

export function KudosHighlight({
  cards,
  hashtags = [],
  departments = [],
  selectedHashtag,
  selectedDepartment,
  onHashtagChange,
  onDepartmentChange,
  onLike,
  onCopyLink,
  onViewDetail,
}: KudosHighlightProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: (viewportSize, snapSize) => viewportSize / 2 - snapSize * 0.3,
    loop: true,
  });
  const [selectedIndex, setSelectedIndex] = useState(0);

  const onSelect = useCallback((api: NonNullable<typeof emblaApi>) => {
    setSelectedIndex(api.selectedScrollSnap());
  }, []);

  useEffect(() => {
    if (!emblaApi) return;
    emblaApi.on("select", onSelect).on("reInit", onSelect);
    return () => {
      emblaApi.off("select", onSelect).off("reInit", onSelect);
    };
  }, [emblaApi, onSelect]);

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  return (
    <section className="flex flex-col gap-10">
      <KudosSectionHeader
        title="HIGHLIGHT KUDOS"
        rightSlot={
          <KudosHighlightFilters
            hashtags={hashtags}
            departments={departments}
            selectedHashtag={selectedHashtag}
            selectedDepartment={selectedDepartment}
            onHashtagChange={onHashtagChange}
            onDepartmentChange={onDepartmentChange}
          />
        }
      />

      {/* Carousel: embla viewport + side arrows */}
      <div className="relative mx-auto w-[calc(100%-100px)]">
        {/* Left edge fade — solid background at the edge → transparent inward. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-y-0 -left-36 z-10 w-100"
          style={{
            background:
              "linear-gradient(to right, #00101A, rgba(0,16,26,0) 100%)",
          }}
        />

        {/* Right edge fade — solid background at the edge → transparent inward. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-y-0 -right-36 z-10 w-100"
          style={{
            background:
              "linear-gradient(to left, #00101A, rgba(0,16,26,0) 100%)",
          }}
        />

        <div className="overflow-hidden" ref={emblaRef}>
          <div className="flex">
            {cards.map((card) => (
              <div
                key={card.id}
                className="relative min-w-0 shrink-0 grow-0 basis-131.25 px-3 hover:z-40"
              >
                <div
                  className={cn("transition-opacity duration-300", {
                    "pointer-events-none opacity-80":
                      card.id !== cards[selectedIndex].id,
                  })}
                >
                  <KudosCard
                    {...card}
                    variant="highlight"
                    onLike={() => onLike?.(card.id)}
                    onCopyLink={() => onCopyLink?.(card.id)}
                    onViewDetail={() => onViewDetail?.(card.id)}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Side arrows, vertically centered, above the edge fades. */}
        <Button
          variant="icon"
          className="absolute top-[48%] -left-16 z-20 h-20 w-20 -translate-y-1/2 rounded-full p-0 text-white"
          onClick={scrollPrev}
        >
          <IcLeft aria-hidden className="size-20!" />
        </Button>
        <Button
          variant="icon"
          className="absolute top-[48%] -right-16 z-20 h-20 w-20 -translate-y-1/2 rounded-full p-0 text-white"
          onClick={scrollNext}
        >
          <IcRight aria-hidden className="size-20!" />
        </Button>
      </div>

      {/* Pagination: ‹ N/total › */}
      <div className="flex items-center justify-center gap-8">
        <Button
          variant="icon"
          onClick={scrollPrev}
          aria-label="Previous"
          className="h-12 w-12"
        >
          <IcLeft aria-hidden className="size-7!" />
        </Button>
        <span className="font-bold">
          <span className="text-[45px] leading-13 text-primary-normal">
            {selectedIndex + 1}
          </span>
          <span className="text-cta text-neutral-dark-hover">
            /{cards.length || 1}
          </span>
        </span>
        <Button
          variant="icon"
          onClick={scrollNext}
          aria-label="Next"
          className="h-12 w-12"
        >
          <IcRight aria-hidden className="size-7!" />
        </Button>
      </div>
    </section>
  );
}

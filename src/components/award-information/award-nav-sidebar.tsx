"use client";

import IcTarget from "@icons/ic-target.svg";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";

export interface AwardNavItem {
  /** URL-safe slug matching the anchor id on the corresponding AwardDetailBlock */
  slug: string;
  /** Display label shown in the nav, e.g. "Top Talent" */
  label: string;
}

export interface AwardNavSidebarProps {
  /** Ordered list of the 6 award nav items */
  items: AwardNavItem[];
  /** Slug of the currently highlighted award (controlled by parent) */
  activeSlug?: string;
  /** Called when user clicks a nav item */
  onSelect: (slug: string) => void;
}

export function AwardNavSidebar({
  items,
  activeSlug,
  onSelect,
}: AwardNavSidebarProps) {
  return (
    <nav
      aria-label="Danh mục giải thưởng"
      className="sticky top-24 flex w-44.5 shrink-0 flex-col gap-4 self-start"
    >
      {items.map((item) => {
        const isActive = item.slug === activeSlug;
        return (
          <Button
            key={item.slug}
            variant="text"
            selected={isActive}
            onClick={() => onSelect(item.slug)}
            aria-current={isActive ? "location" : undefined}
            iconLeft={<IcTarget aria-hidden className="size-6!" />}
            className={cn(
              "relative w-fit justify-start text-left text-sm leading-5 font-bold tracking-[0.25px]",
              isActive
                ? "[text-shadow:0px_0px_6px_#fae287,0px_4px_4px_rgba(0,0,0,0.25)]"
                : "after:absolute after:inset-x-0 after:bottom-0 after:h-px after:origin-center after:scale-x-0 after:bg-primary-normal after:transition-transform after:duration-200 hover:bg-transparent hover:text-primary-normal hover:after:scale-x-100",
            )}
          >
            {item.label}
          </Button>
        );
      })}
    </nav>
  );
}

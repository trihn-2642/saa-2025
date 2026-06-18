import Image from "next/image";

import { cn } from "@/lib/cn";

export type BadgeTier = "new" | "rising" | "super" | "legend";

/** Pre-rendered badge chip artwork (gradient + label baked in) from public/title. */
const TIER_SRC: Record<BadgeTier, string> = {
  new: "/images/title/new-hero.png",
  rising: "/images/title/rising-hero.png",
  super: "/images/title/super-hero.png",
  legend: "/images/title/legend-hero.png",
};

const TIER_ALT: Record<BadgeTier, string> = {
  new: "New Hero",
  rising: "Rising Hero",
  super: "Super Hero",
  legend: "Legend Hero",
};

// Default chip size (px) — matches the artwork's 5.5:1 ratio at 20px tall.
const DEFAULT_WIDTH = 110;
const DEFAULT_HEIGHT = 20;

export interface BadgeChipProps {
  tier: BadgeTier;
  /** Show the campaign ×2 multiplier chip alongside. */
  campaignX2?: boolean;
  /** Rendered chip width in px (defaults to {@link DEFAULT_WIDTH}). */
  width?: number;
  /** Rendered chip height in px (defaults to {@link DEFAULT_HEIGHT}). */
  height?: number;
  className?: string;
}

export function BadgeChip({
  tier,
  campaignX2,
  width = DEFAULT_WIDTH,
  height = DEFAULT_HEIGHT,
  className,
}: BadgeChipProps) {
  return (
    <span className={cn("inline-flex items-center gap-1", className)}>
      <span className="relative block shrink-0" style={{ width, height }}>
        <Image
          src={TIER_SRC[tier]}
          alt={TIER_ALT[tier]}
          fill
          sizes={`${Math.ceil(width)}px`}
          className="object-contain"
        />
      </span>
      {campaignX2 && (
        // Campaign chip keeps its own 57:67 ratio, scaled to match height.
        <span
          className="relative block shrink-0"
          style={{ width: (height * 57) / 67, height }}
        >
          <Image
            src="/images/title/campain.png"
            alt="Campaign x2"
            fill
            sizes={`${Math.ceil((height * 57) / 67)}px`}
            className="object-contain"
          />
        </span>
      )}
    </span>
  );
}

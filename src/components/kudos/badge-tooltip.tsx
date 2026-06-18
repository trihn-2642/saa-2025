"use client";

import type { ReactNode } from "react";
import { useTranslations } from "next-intl";

import { cn } from "@/lib/cn";

import { BadgeChip, type BadgeTier } from "./badge-chip";

export interface BadgeTooltipProps {
  tier: BadgeTier;
  campaignX2?: boolean;
  children: ReactNode;
  className?: string;
}

export function BadgeTooltip({
  tier,
  campaignX2,
  children,
  className,
}: BadgeTooltipProps) {
  const t = useTranslations("kudos");

  // One text block per badge shown (tier, plus campaign when active).
  const entries = [
    { title: t(`badge.${tier}.title`), desc: t(`badge.${tier}.desc`) },
  ];
  if (campaignX2) {
    entries.push({
      title: t("badge.campaign.title"),
      desc: t("badge.campaign.desc"),
    });
  }

  return (
    <span className={cn("group relative inline-flex", className)}>
      {children}

      {/* Tooltip: badge artwork on top, then count line + description.
          Opens below the badge so it stays inside the card bounds. */}
      <span className="pointer-events-none absolute top-full left-1/2 z-50 mt-2 -translate-x-1/2 opacity-0 transition-opacity duration-150 group-hover:opacity-100">
        <span className="flex w-76 flex-col gap-2.75 rounded-2xl border border-primary-dark-hover bg-details-overlay p-4 text-left shadow-lg">
          <BadgeChip
            tier={tier}
            campaignX2={campaignX2}
            width={218}
            height={38}
            className="self-start"
          />
          {entries.map((e) => (
            <span key={e.title} className="flex flex-col">
              <span className="text-sm leading-5 font-bold tracking-[0.1px] text-white">
                {e.title}
              </span>
              <span className="text-sm leading-5 font-bold tracking-[0.1px] text-neutral-dark-hover">
                {e.desc}
              </span>
            </span>
          ))}
        </span>
      </span>
    </span>
  );
}

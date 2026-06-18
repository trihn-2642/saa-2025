"use client";

/**
 * AwardsSection — responsive grid of the 6 SAA 2025 award categories.
 *
 * Layout: 1 col mobile, 2 col tablet (sm), 3 col desktop (lg).
 * Data: AWARD_CARDS from homepage-content; strings resolved here via
 * useTranslations("homepage") and passed down to the presentational AwardCard.
 */

import { useTranslations } from "next-intl";

import { AWARD_CARDS } from "@/lib/homepage-content";

import { AwardCard } from "./award-card";

export function AwardsSection() {
  const t = useTranslations("homepage");

  return (
    <section className="w-full bg-details-background px-6 pt-6 sm:px-12 lg:px-36 lg:pt-30">
      <div>
        {/* Caption */}
        <p className="text-subtitle font-bold text-white uppercase">
          {t("awards.caption")}
        </p>

        <span className="my-4 block h-px w-full bg-border-subtle" />

        {/* Section title */}
        <h2 className="mb-20 text-title font-bold tracking-[-0.25px] text-primary-normal">
          {t("awards.title")}
        </h2>

        {/* Award grid */}
        <div className="grid grid-cols-1 gap-9 sm:grid-cols-2 lg:grid-cols-3">
          {AWARD_CARDS.map((card) => (
            <AwardCard
              key={card.slug}
              imageSrc={card.image}
              imageAlt={t(card.titleKey)}
              title={t(card.titleKey)}
              description={t(card.descKey)}
              href={card.href}
              detailLabel={t("awards.detail")}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

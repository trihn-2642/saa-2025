"use client";

import { useTranslations } from "next-intl";
import { useScrollSpy } from "@/hooks/use-scroll-spy";
import { AWARD_DETAILS, AWARD_NAV_SLUGS } from "@/lib/award-details-content";
import { AwardDetailBlock } from "./award-detail-block";
import { AwardNavSidebar } from "./award-nav-sidebar";

export function AwardInfoSection() {
  const t = useTranslations("awardInfo");

  // Active section follows scroll position (and click → smooth scroll below).
  const activeSlug = useScrollSpy(AWARD_NAV_SLUGS);

  const navItems = AWARD_DETAILS.map((award) => ({
    slug: award.slug,
    label: t(`nav.${award.slug}`),
  }));

  /** Smooth-scroll to the award block; the scroll-spy then activates it. */
  function handleSelect(slug: string) {
    document
      .getElementById(slug)
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <section className="w-full bg-details-background px-6 pt-16.5 lg:px-36">
      <div className="flex justify-between">
        {/* Left: sticky sidebar nav */}
        <AwardNavSidebar
          items={navItems}
          activeSlug={activeSlug}
          onSelect={handleSelect}
        />

        {/* Right: award detail rows */}
        <div className="flex w-213.25 flex-col gap-20">
          {AWARD_DETAILS.map((award, index) => (
            <AwardDetailBlock
              key={award.slug}
              slug={award.slug}
              imageSrc={award.image}
              imageAlt=""
              title={t(award.titleKey)}
              description={t(award.descKey)}
              quantityLabel={t("quantityLabel")}
              quantity={award.quantity}
              unit={t(award.unitKey)}
              valueLabel={t("valueLabel")}
              values={award.values.map((v) => ({
                amount: v.amount,
                note: v.noteKey ? t(v.noteKey) : undefined,
              }))}
              orLabel={t("values.or")}
              imageOnRight={index % 2 === 1}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

"use client";

/**
 * Hero — full-viewport hero section of the Homepage SAA.
 *
 * Background: /images/homepage-saa/keyvisual.jpg (colorful root art) with a
 * left→right dark gradient so the left content column is readable.
 * The "ROOT FURTHER" title uses the stylized lockup image (matches the design's
 * custom display font). Countdown driven live by useCountdown(); the "Comming
 * soon" subtitle hides once the event has passed.
 */

import Image from "next/image";
import Link from "next/link";
import { useTranslations } from "next-intl";

import IcUp from "@icons/ic-up.svg";

import { CountdownTimer } from "@/components/countdown/countdown-timer";
import { Button } from "@/components/ui/button";
import { useCountdown } from "@/hooks/use-countdown";
import { cn } from "@/lib/cn";
import { ROUTES } from "@/lib/routes";

export interface HeroProps {
  className?: string;
}

export function Hero({ className }: HeroProps) {
  const t = useTranslations("homepage");
  const { days, hours, minutes, isComplete } = useCountdown();

  return (
    <section className={cn("relative w-full", className)}>
      {/* The keyvisual background is shared across hero + root-further — it
          lives in the wrapper in /home/page.tsx so it flows continuously. */}
      {/* Content column — left-aligned */}
      <div className="relative z-10 flex flex-col justify-center px-6 pt-44 pb-30 sm:px-12 lg:px-36">
        {/* "ROOT FURTHER" headline — stylized lockup (custom display font) */}
        <h1>
          <Image
            src="/images/login/root-further.png"
            alt="ROOT FURTHER"
            width={451}
            height={200}
            priority
            className="h-auto w-64 sm:w-80 lg:w-112.75"
          />
        </h1>

        {/* "Comming soon" subtitle — hidden when countdown is complete */}
        {!isComplete && (
          <p className="mt-10 text-lg font-semibold text-white">
            {t("hero.comingSoon")}
          </p>
        )}

        {/* Live countdown — left-aligned (flex wrapper), title hidden */}
        <div className="mt-4 flex">
          <CountdownTimer
            title=""
            compact
            days={days}
            hours={hours}
            minutes={minutes}
            labels={{ days: "DAYS", hours: "HOURS", minutes: "MINUTES" }}
          />
        </div>

        {/* Event info — values in primary yellow, livestream on its own line */}
        <div className="mt-4 space-y-2 text-sm font-bold sm:text-base">
          <div className="flex flex-wrap gap-x-10 gap-y-1">
            <p>
              <span className="leading-6 text-white">
                {t("hero.timeLabel")}{" "}
              </span>
              <span className="text-subtitle text-primary-normal">
                {t("hero.timeValue")}
              </span>
            </p>
            <p>
              <span className="leading-6 text-white">
                {t("hero.placeLabel")}{" "}
              </span>
              <span className="text-subtitle font-bold text-primary-normal">
                {t("hero.placeValue")}
              </span>
            </p>
          </div>
          <p className="leading-6">{t("hero.livestream")}</p>
        </div>

        {/* CTA buttons — with ↗ arrow */}
        <div className="mt-10 flex flex-wrap gap-10">
          <Link href={ROUTES.awardInformation} className="no-underline">
            <Button
              variant="primary"
              iconRight={<IcUp aria-hidden className="size-6!" />}
              className="h-15 min-w-69 px-6 text-cta font-bold"
            >
              {t("hero.ctaAwards")}
            </Button>
          </Link>
          <Link href={ROUTES.kudos} className="no-underline">
            <Button
              variant="secondary"
              iconRight={<IcUp aria-hidden className="size-6!" />}
              className="h-15 min-w-63.5 px-6 text-cta font-bold"
            >
              {t("hero.ctaKudos")}
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}

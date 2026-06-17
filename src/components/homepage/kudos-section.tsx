"use client";

/**
 * KudosSection — dark promo card for the Sun* Kudos recognition program.
 *
 * Layout: left column (label, title, description, CTA button),
 * right column (KUDOS wordmark logo). Stacks on mobile.
 */

import Image from "next/image";
import IcUp from "@icons/ic-up.svg";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ROUTES } from "@/lib/routes";

export function KudosSection() {
  const t = useTranslations("homepage");

  return (
    <section className="w-full bg-details-background p-6 sm:px-12 lg:px-36 lg:pt-30 lg:pb-24">
      <div className="mx-auto h-125 max-w-280">
        {/* Card uses the Figma "Kudos Background" image (dark + gold curves);
            bg-details-container is a fallback until the asset is present. */}
        <div className="relative isolate h-full overflow-hidden rounded-2xl bg-details-container">
          <Image
            src="/homepage-saa/kudos-background.png"
            alt=""
            fill
            sizes="(max-width: 1024px) 100vw, 1120px"
            aria-hidden
            className="-z-10 object-cover"
          />
          <div className="flex h-full flex-col items-center justify-between px-8 py-12 sm:px-12 lg:flex-row lg:py-[45.58px] lg:pr-20 lg:pl-16">
            {/* Left: text content */}
            <div className="flex w-114.25 flex-col gap-4">
              {/* Label */}
              <p className="text-subtitle font-bold text-white">
                {t("kudosSection.label")}
              </p>

              {/* Title */}
              <h2 className="text-title font-bold tracking-[-0.25px] text-primary-normal">
                {t("kudosSection.title")}
              </h2>

              {/* Description */}
              <p className="text-body font-bold tracking-[0.5px] whitespace-break-spaces text-white">
                {t("kudosSection.description")}
              </p>

              {/* CTA */}
              <div className="mt-4">
                <Link href={ROUTES.home} className="no-underline">
                  <Button
                    variant="primary"
                    className="min-w-31.5 text-body font-bold tracking-[0.15px]"
                    iconRight={<IcUp aria-hidden className="size-6!" />}
                  >
                    {t("kudosSection.cta")}
                  </Button>
                </Link>
              </div>
            </div>

            {/* Right: KUDOS logo */}
            <div className="flex shrink-0 items-center justify-center lg:w-91">
              <Image
                src="/kudos-logo.png"
                alt="Sun* Kudos"
                width={364}
                height={72}
                className="h-auto w-48 sm:w-64 lg:h-18 lg:w-91"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

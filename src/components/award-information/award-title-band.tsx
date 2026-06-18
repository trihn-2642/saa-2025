"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";

export function AwardTitleBand() {
  const t = useTranslations("awardInfo.titleBand");

  return (
    <section className="w-full overflow-hidden bg-details-background">
      {/* Cover band keeps the design's 1440×548 proportion. */}
      <div className="relative aspect-1440/548 h-136.75 w-full">
        <Image
          src="/images/award-information/background.jpg"
          alt=""
          fill
          priority
          sizes="100vw"
          aria-hidden
          className="object-cover"
        />
        {/* Figma "Cover" overlay (node 313:8439): solid #00101A at the bottom
            fading to transparent toward the middle — keeps the title legible. */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(0deg, #00101A -4.23%, rgba(0, 19, 32, 0.00) 52.79%)",
          }}
          aria-hidden
        />

        {/* Content overlay — logo top-left, title block pinned to the bottom. */}
        <div className="absolute inset-0 flex flex-col gap-30 px-6 pt-24 lg:px-36">
          {/* ROOT FURTHER lockup (reused stylized wordmark). */}
          <Image
            src="/images/login/root-further.png"
            alt="ROOT FURTHER"
            width={451}
            height={200}
            priority
            className="h-auto w-72 lg:w-84"
          />

          {/* Caption + title — centered on the lower portion. */}
          <div className="flex flex-col items-center gap-4 text-center">
            <p className="text-subtitle font-bold text-white">{t("caption")}</p>
            <span className="block h-px w-full bg-border-subtle" />
            <h1 className="text-title font-bold tracking-[-0.25px] text-primary-normal">
              {t("title")}
            </h1>
          </div>
        </div>
      </div>
    </section>
  );
}

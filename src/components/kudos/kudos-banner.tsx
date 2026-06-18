"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { KudosBannerActionBar } from "./kudos-banner-action-bar";

export interface KudosBannerProps {
  /** Opens the "send kudos" dialog (the left pill). */
  onOpenDialog: () => void;
  /** Optional handler for the profile search pill. */
  onSearch?: (query: string) => void;
}

export function KudosBanner({ onOpenDialog, onSearch }: KudosBannerProps) {
  const t = useTranslations("kudos");

  return (
    <div className="relative -mt-20 w-full overflow-hidden bg-details-background">
      <div className="relative aspect-1440/512 w-full">
        {/* Keyvisual background (gradient baked into the export). */}
        <Image
          src="/kudos-live-board/kv-background.jpg"
          alt=""
          fill
          priority
          sizes="100vw"
          aria-hidden
          className="object-cover"
        />

        {/* Overlay: title/logo top-left, pills pinned to the bottom over the art. */}
        <div className="absolute inset-0 z-10 flex flex-col gap-16">
          <div className="flex flex-col gap-2.5 px-36 pt-49">
            <p className="text-heading font-bold text-primary-normal">
              {t("banner.title")}
            </p>
            <Image
              src="/kudos-logo.png"
              alt="Sun* Kudos"
              width={714}
              height={147}
              priority
              className="h-auto w-134"
            />
          </div>

          <KudosBannerActionBar
            onOpenDialog={onOpenDialog}
            onSearch={onSearch}
          />
        </div>
      </div>
    </div>
  );
}

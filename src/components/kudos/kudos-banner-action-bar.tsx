"use client";

import IcPen from "@icons/ic-pen.svg";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { SearchInput } from "@/components/ui/search-input";

export interface KudosBannerActionBarProps {
  onOpenDialog: () => void;
  onSearch?: (query: string) => void;
}

export function KudosBannerActionBar({
  onOpenDialog,
  onSearch,
}: KudosBannerActionBarProps) {
  const t = useTranslations("kudos");

  return (
    <div className="flex flex-row gap-8 px-36">
      {/* Left pill — trigger dialog (DS secondary button, shaped as a pill) */}
      <Button
        type="button"
        variant="secondary"
        onClick={onOpenDialog}
        iconLeft={<IcPen aria-hidden className="size-6! shrink-0" />}
        className="h-18 min-w-0 flex-738 justify-start gap-4 rounded-full text-body font-bold tracking-[0.15px] hover:shadow-none"
      >
        <span className="truncate">{t("submit.placeholder")}</span>
      </Button>

      {/* Right pill — reusable search input */}
      <SearchInput
        placeholder={t("search.placeholder")}
        onSearch={onSearch}
        containerClassName="h-18 flex-381"
      />
    </div>
  );
}

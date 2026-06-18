"use client";

import { useTranslations } from "next-intl";

import { DropdownSelect } from "@/components/ui/dropdown";
import { cn } from "@/lib/cn";

export interface FilterOption {
  value: string;
  label: string;
}

export interface KudosHighlightFiltersProps {
  hashtags: FilterOption[];
  departments: FilterOption[];
  selectedHashtag?: string;
  selectedDepartment?: string;
  onHashtagChange?: (value: string) => void;
  onDepartmentChange?: (value: string) => void;
  className?: string;
}

export function KudosHighlightFilters({
  hashtags,
  departments,
  selectedHashtag,
  selectedDepartment,
  onHashtagChange,
  onDepartmentChange,
  className,
}: KudosHighlightFiltersProps) {
  const t = useTranslations("kudos");

  return (
    <div className={cn("flex flex-row items-center gap-2", className)}>
      <DropdownSelect
        triggerVariant="secondary"
        placeholder={t("filters.hashtag")}
        buttonClassName="min-w-34"
        options={hashtags}
        value={selectedHashtag}
        onValueChange={onHashtagChange}
      />
      <DropdownSelect
        triggerVariant="secondary"
        placeholder={t("filters.department")}
        buttonClassName="min-w-39.5"
        options={departments}
        value={selectedDepartment}
        onValueChange={onDepartmentChange}
      />
    </div>
  );
}

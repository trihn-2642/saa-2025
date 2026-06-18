"use client";

import IcSearch from "@icons/ic-search.svg";
import type { InputHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

export interface SearchInputProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "onChange"
> {
  /** Fired with the current value on every change. */
  onSearch?: (value: string) => void;
  /** Extra classes for the pill container (e.g. height / flex sizing). */
  containerClassName?: string;
  /** Extra classes for the icon (e.g. size / color). */
  iconClassName?: string;
}

/**
 * SearchInput — reusable search pill (magnifier icon + text input).
 *
 * Idle text/icon use the muted `neutral-dark-hover`; on focus the whole pill
 * darkens/strengthens (`focus-within` → white text + gold border). Size/width
 * come from `containerClassName` so it adapts per usage.
 */
export function SearchInput({
  onSearch,
  containerClassName,
  className,
  iconClassName,
  ...props
}: SearchInputProps) {
  return (
    <div
      className={cn(
        "flex min-w-0 flex-row items-center gap-4 rounded-full border border-primary-dark-hover bg-button-hover px-4 transition-colors duration-200 ease-out",
        "text-neutral-dark-hover transition-colors focus-within:border-primary-normal",
        containerClassName,
      )}
    >
      <IcSearch
        aria-hidden
        className={cn("size-6 shrink-0 text-white", iconClassName)}
      />
      <input
        type="text"
        onChange={(e) => onSearch?.(e.target.value)}
        className={cn(
          "min-w-0 flex-1 bg-transparent text-body font-bold text-white outline-none placeholder:text-white",
          className,
        )}
        {...props}
      />
    </div>
  );
}

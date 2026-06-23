"use client";

import IcTick from "@icons/ic-tick.svg";

import { cn } from "@/lib/cn";

export interface HashtagOption {
  value: string;
  label: string;
}

export interface HashtagDropdownProps {
  options: HashtagOption[];
  selected: string[];
  onToggle: (value: string) => void;
  /** Maximum number of simultaneously selected hashtags. Defaults to 5. */
  max?: number;
  className?: string;
}

/**
 * HashtagDropdown — presentational multi-select toggle list.
 *
 * Each row displays "#label" on the left and a circle-check icon on the right
 * (visible only when selected). When the selection reaches `max`, unselected
 * rows become visually disabled and are not interactive.
 *
 * All interaction state is managed by the parent; this component is fully
 * props-driven (no internal selection state).
 */
export function HashtagDropdown({
  options,
  selected,
  onToggle,
  max = 5,
  className,
}: HashtagDropdownProps) {
  const isAtMax = selected.length >= max;

  return (
    <ul
      role="listbox"
      aria-multiselectable="true"
      aria-label="Hashtag selection"
      className={cn(
        // max-h 332px → scroll past it
        "custom-scrollbar flex max-h-83 w-79.5 flex-col gap-0 overflow-y-auto rounded-lg border border-primary-dark-hover bg-details-overlay p-1.5",
        className,
      )}
    >
      {options.map((option) => {
        const isSelected = selected.includes(option.value);
        /* Disabled when max reached AND this option is not already selected */
        const isDisabled = isAtMax && !isSelected;

        return (
          <li
            key={option.value}
            role="option"
            aria-selected={isSelected}
            aria-disabled={isDisabled}
            onClick={isDisabled ? undefined : () => onToggle(option.value)}
            className={cn(
              /* Row base: full width (shrinks when the scrollbar shows, so no
                 horizontal overflow), height=40px, padding=0 16px, gap=2px */
              "flex h-10 w-full cursor-pointer flex-row items-center justify-between gap-0.5 rounded-xs px-4 py-2 transition-colors duration-150 ease-out select-none",
              /* Selected state: background=rgba(255,234,158,0.20) */
              isSelected && "bg-primary-normal/20",
              /* Hover: unselected rows get a subtle bg highlight; selected rows
                 get a slightly stronger gold wash */
              !isDisabled && !isSelected && "hover:bg-primary-normal/10",
              !isDisabled && isSelected && "hover:bg-primary-normal/30",
              /* Disabled (at max, not selected): reduced opacity, no pointer */
              isDisabled && "cursor-not-allowed opacity-40",
            )}
          >
            {/* Label: #hashtag — white, bold 16px/24px, letter-spacing 0.15px */}
            <span className="text-body font-bold tracking-[0.15px] text-white">
              #{option.label}
            </span>

            {/* Check icon: 24×24, shown only when selected (ic-tick = circle + check) */}
            <span className="flex h-6 w-6 shrink-0 items-center justify-center">
              {isSelected && (
                <IcTick aria-hidden className="size-6 text-white" />
              )}
            </span>
          </li>
        );
      })}
    </ul>
  );
}

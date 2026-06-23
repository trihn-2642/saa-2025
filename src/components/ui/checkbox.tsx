import type { ReactNode } from "react";

import { cn } from "@/lib/cn";

export interface CheckboxProps {
  /** Checked state (controlled). */
  checked: boolean;
  /** Toggle handler. */
  onChange: () => void;
  /** Optional visible label rendered next to the box. */
  label?: ReactNode;
  /** Accessible name for the hidden input — use when there's no visible label. */
  ariaLabel?: string;
  /** Extra classes on the wrapping label (e.g. layout tweaks). */
  className?: string;
}

export function Checkbox({
  checked,
  onChange,
  label,
  ariaLabel,
  className,
}: CheckboxProps) {
  return (
    <label
      className={cn(
        "inline-flex cursor-pointer flex-row items-center gap-4 select-none",
        className,
      )}
    >
      <span className="flex size-6 shrink-0 items-center justify-center rounded-sm border border-primary-dark-hover bg-white">
        {checked && (
          <span className="size-4 rounded-xs bg-primary-dark-hover" />
        )}
      </span>
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="sr-only"
        aria-label={ariaLabel}
      />
      {label != null && (
        <span className="text-cta font-bold text-text-primary-2">{label}</span>
      )}
    </label>
  );
}

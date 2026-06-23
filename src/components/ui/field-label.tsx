import type { ReactNode } from "react";

import { cn } from "@/lib/cn";

export interface FieldLabelProps {
  children: ReactNode;
  /** Appends a red asterisk to mark the field as required. */
  required?: boolean;
  /** Extra classes on the wrapper (e.g. `h-14` to center against an input). */
  className?: string;
}

/** Form field label — bold 22px text with an optional red required asterisk. */
export function FieldLabel({ children, required, className }: FieldLabelProps) {
  return (
    <div
      className={cn(
        "inline-flex shrink-0 flex-row items-center gap-0.5",
        className,
      )}
    >
      <span className="text-cta font-bold text-text-primary-2">{children}</span>
      {required && (
        <span
          className="font-noto text-body leading-5 font-bold text-error"
          aria-hidden="true"
        >
          *
        </span>
      )}
    </div>
  );
}

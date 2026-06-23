import { forwardRef, type InputHTMLAttributes } from "react";

import { cn } from "@/lib/cn";

export type InputProps = InputHTMLAttributes<HTMLInputElement>;

/**
 * Input — design-system text field.
 *
 * 56px tall (h-14), radius 8px, 1px #998C5F border, white fill, 24px horizontal
 * padding, Montserrat bold 16px text, muted placeholder. Width is left to the
 * caller (pass `w-full`, `flex-1`, …) so it fits any layout. Forwards the ref
 * and all native <input> props (value, onChange, placeholder, type, …).
 */
export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { className, type = "text", ...props },
  ref,
) {
  return (
    <input
      ref={ref}
      type={type}
      className={cn(
        "h-14 cursor-text rounded-lg border border-primary-dark-hover bg-white px-6 font-montserrat text-body font-bold text-text-primary-2 outline-none placeholder:text-neutral-dark-hover",
        className,
      )}
      {...props}
    />
  );
});

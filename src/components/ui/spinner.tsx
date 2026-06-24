import { cn } from "@/lib/cn";

export interface SpinnerProps {
  /** Extra classes (e.g. size override `size-8`). */
  className?: string;
}

/**
 * Spinner — design-system loading indicator. Gold accent (primary-normal) on a
 * muted ring (primary-dark-hover), matching the app's dark theme.
 */
export function Spinner({ className }: SpinnerProps) {
  return (
    <span
      role="status"
      aria-label="Loading"
      className={cn(
        "inline-block size-10 animate-spin rounded-full border-4 border-primary-dark-hover border-t-primary-normal",
        className,
      )}
    />
  );
}

/**
 * CountdownUnit — one time unit: two LED digit boxes on top, label below.
 *
 * Layout from Figma (frame "1_Days"): column, left-aligned, 21px gap between
 * the digit row and the label; the two digit boxes also sit 21px apart.
 * Label: Montserrat Bold 36px, white, uppercase.
 */

import { CountdownDigit } from "./countdown-digit";

export interface CountdownUnitProps {
  /** Two-character, zero-padded value, e.g. "00", "05", "20". */
  value: string;
  /** Uppercase label, e.g. "DAYS", "HOURS", "MINUTES". */
  label: string;
  /** Homepage variant: 14px digit↔label gap (default /countdown = 21px). */
  compact?: boolean;
}

export function CountdownUnit({ value, label, compact }: CountdownUnitProps) {
  const [first, second] = value.padStart(2, "0").slice(0, 2);

  return (
    // mm:countdown-unit
    <div
      className={
        compact
          ? "flex flex-col items-start gap-3.5"
          : "flex flex-col items-start gap-5.25"
      }
    >
      {/* mm:digit-row */}
      <div
        className={compact ? "flex flex-row gap-3.5" : "flex flex-row gap-5.25"}
      >
        <CountdownDigit char={first} compact={compact} />
        <CountdownDigit char={second} compact={compact} />
      </div>
      {/* mm:unit-label */}
      <span
        className={
          compact
            ? "text-text-white text-2xl leading-none font-bold uppercase"
            : "text-text-white text-2xl leading-none font-bold uppercase sm:text-4xl"
        }
      >
        {label}
      </span>
    </div>
  );
}

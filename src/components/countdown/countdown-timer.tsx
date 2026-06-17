/**
 * CountdownTimer — presentational prelaunch countdown display.
 *
 * Layout from Figma (frame "Countdown time"): a centered column with a 24px
 * gap between the title and the unit row; the three units sit 60px apart.
 * No separators between units (matches the design).
 *
 * STATIC/PRESENTATIONAL — no timer logic. The page wires live values via props.
 * Defaults reflect the design mock: 00 days, 05 hours, 20 minutes.
 */

import { CountdownUnit } from "./countdown-unit";

export interface CountdownLabels {
  days: string;
  hours: string;
  minutes: string;
}

export interface CountdownTimerProps {
  /** Heading text shown above the digits. */
  title?: string;
  /** Unit labels (i18n). Defaults match the Figma design. */
  labels?: CountdownLabels;
  /** Screen-reader sentence for the timer (i18n). */
  srText?: string;
  /** Days value (0–99); number or pre-padded 2-char string. */
  days?: number | string;
  /** Hours value (0–23); number or pre-padded 2-char string. */
  hours?: number | string;
  /** Minutes value (0–59); number or pre-padded 2-char string. */
  minutes?: number | string;
  /** Homepage variant: tighter 14px digit↔label gap. */
  compact?: boolean;
}

const DEFAULT_LABELS: CountdownLabels = {
  days: "DAYS",
  hours: "HOURS",
  minutes: "MINUTES",
};

function pad(value: number | string): string {
  return String(value).padStart(2, "0").slice(0, 2);
}

export function CountdownTimer({
  title = "Sự kiện sẽ bắt đầu sau",
  labels = DEFAULT_LABELS,
  srText,
  days = "00",
  hours = "05",
  minutes = "20",
  compact,
}: CountdownTimerProps) {
  const fallbackSr = `${pad(days)} days, ${pad(hours)} hours, ${pad(minutes)} minutes remaining`;

  return (
    // mm:countdown-timer
    <div className="flex flex-col items-center gap-6">
      {/* mm:countdown-title — omitted when title is empty (e.g. homepage hero) */}
      {title ? (
        <h1 className="text-center text-2xl font-bold text-text-secondary-1 sm:text-4xl">
          {title}
        </h1>
      ) : null}

      {/* mm:countdown-units-row */}
      <div
        className={
          compact
            ? "flex flex-row items-start gap-10"
            : "flex flex-row items-start gap-8 sm:gap-15"
        }
        role="timer"
        aria-live="off"
      >
        <span className="sr-only">{srText ?? fallbackSr}</span>
        <CountdownUnit
          value={pad(days)}
          label={labels.days}
          compact={compact}
        />
        <CountdownUnit
          value={pad(hours)}
          label={labels.hours}
          compact={compact}
        />
        <CountdownUnit
          value={pad(minutes)}
          label={labels.minutes}
          compact={compact}
        />
      </div>
    </div>
  );
}

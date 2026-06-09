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

export interface CountdownTimerProps {
  /** Heading text shown above the digits. */
  title?: string;
  /** Days value (0–99); number or pre-padded 2-char string. */
  days?: number | string;
  /** Hours value (0–23); number or pre-padded 2-char string. */
  hours?: number | string;
  /** Minutes value (0–59); number or pre-padded 2-char string. */
  minutes?: number | string;
}

function pad(value: number | string): string {
  return String(value).padStart(2, "0").slice(0, 2);
}

export function CountdownTimer({
  title = "Sự kiện sẽ bắt đầu sau",
  days = "00",
  hours = "05",
  minutes = "20",
}: CountdownTimerProps) {
  return (
    // mm:countdown-timer
    <div className="flex flex-col items-center gap-6">
      {/* mm:countdown-title */}
      <h1 className="font-montserrat text-center text-2xl font-bold text-text-secondary-1 sm:text-4xl">
        {title}
      </h1>

      {/* mm:countdown-units-row */}
      <div
        className="flex flex-row items-start gap-8 sm:gap-15"
        role="timer"
        aria-live="off"
      >
        <span className="sr-only">
          {`${pad(days)} days, ${pad(hours)} hours, ${pad(minutes)} minutes remaining`}
        </span>
        <CountdownUnit value={pad(days)} label="DAYS" />
        <CountdownUnit value={pad(hours)} label="HOURS" />
        <CountdownUnit value={pad(minutes)} label="MINUTES" />
      </div>
    </div>
  );
}

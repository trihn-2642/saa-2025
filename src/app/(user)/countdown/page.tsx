"use client";

import { useTranslations } from "next-intl";

import { CountdownTimer } from "@/components/countdown/countdown-timer";
import { useCountdown } from "@/hooks/use-countdown";

/**
 * /countdown — Prelaunch countdown landing page.
 *
 * Full-viewport Figma background (dark + organic colored roots) with a dark
 * overlay for contrast. The countdown is driven live by `useCountdown`, which
 * counts down to NEXT_PUBLIC_COUNTDOWN_TARGET and freezes at 00:00:00.
 */
export default function CountdownPage() {
  const { days, hours, minutes } = useCountdown();
  const t = useTranslations("countdown");
  const pad = (v: number | string) => String(v).padStart(2, "0").slice(0, 2);

  return (
    // mm:prelaunch-page
    <div className="relative min-h-screen w-full overflow-hidden bg-details-background">
      {/* mm:bg-image — Figma background asset (1512×1077). */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/images/countdown/bg-prelaunch.png')" }}
        aria-hidden="true"
      />
      {/* mm:bg-overlay — Figma "Cover" gradient (details-background → #00121D 46%
          → #001320 0%). The two darker navy stops are gradient-specific (not
          palette tokens). */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(100deg, var(--details-background) 15.48%, rgba(0,18,29,0.46) 52.13%, rgba(0,19,32,0.00) 63.41%)",
        }}
        aria-hidden="true"
      />

      {/* mm:content — placed at 218px + padding top 96px from top (Figma: Countdown time y314/1077),
          horizontally centered, matching the design rather than dead-center. */}
      <main className="absolute top-78.5 left-1/2 z-10 w-full -translate-x-1/2 px-6">
        <CountdownTimer
          days={days}
          hours={hours}
          minutes={minutes}
          title={t("title")}
          labels={{
            days: t("days"),
            hours: t("hours"),
            minutes: t("minutes"),
          }}
          srText={t("srRemaining", {
            days: pad(days),
            hours: pad(hours),
            minutes: pad(minutes),
          })}
        />
      </main>
    </div>
  );
}

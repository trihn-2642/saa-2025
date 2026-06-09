/**
 * Countdown domain logic for the Prelaunch page.
 *
 * Pure, framework-agnostic helpers — no React, no DOM — so they can be unit
 * tested in isolation. The page counts down to a target datetime sourced from
 * the NEXT_PUBLIC_COUNTDOWN_TARGET env var (ISO 8601), falling back to a
 * hardcoded constant when unset/invalid.
 *
 * Units: DAYS / HOURS / MINUTES only (no seconds, per design). All values are
 * clamped to their valid range and formatted as two digits with a leading zero.
 */

/** Fallback target used when NEXT_PUBLIC_COUNTDOWN_TARGET is missing/invalid. */
export const FALLBACK_TARGET_ISO = "2026-06-30T09:00:00+07:00";

export interface CountdownParts {
  /** Remaining whole days (0–99 for display; see clampDays). */
  days: number;
  /** Remaining hours within the day (0–23). */
  hours: number;
  /** Remaining minutes within the hour (0–59). */
  minutes: number;
  /** True once the target has been reached or passed. */
  isComplete: boolean;
}

/** Resolve the countdown target datetime (epoch ms). */
export function getCountdownTargetMs(
  envValue: string | undefined = process.env.NEXT_PUBLIC_COUNTDOWN_TARGET,
): number {
  const fromEnv = envValue ? Date.parse(envValue) : NaN;
  if (!Number.isNaN(fromEnv)) return fromEnv;
  return Date.parse(FALLBACK_TARGET_ISO);
}

/**
 * Compute remaining DAYS/HOURS/MINUTES between `nowMs` and `targetMs`.
 * Returns all zeros (isComplete=true) once the target is reached/passed.
 */
export function computeCountdown(targetMs: number, nowMs: number): CountdownParts {
  const diffMs = targetMs - nowMs;
  if (!Number.isFinite(diffMs) || diffMs <= 0) {
    return { days: 0, hours: 0, minutes: 0, isComplete: true };
  }

  const totalMinutes = Math.floor(diffMs / 60_000);
  const days = Math.floor(totalMinutes / (60 * 24));
  const hours = Math.floor((totalMinutes % (60 * 24)) / 60);
  const minutes = totalMinutes % 60;

  return { days, hours, minutes, isComplete: false };
}

/** Clamp days to a 2-digit display range (0–99). */
export function clampDays(value: number): number {
  if (!Number.isFinite(value) || value < 0) return 0;
  return Math.min(value, 99);
}

/** Clamp to [0, max]; invalid/out-of-range values collapse to 0 (per test cases). */
export function clampUnit(value: number, max: number): number {
  if (!Number.isFinite(value) || value < 0 || value > max) return 0;
  return value;
}

/** Format a unit as a 2-digit, leading-zero string (e.g. 5 -> "05").
 *  Values are clamped to 0–99 so the result is always exactly two digits. */
export function formatTwoDigits(value: number): string {
  const safe = Number.isFinite(value) ? Math.min(Math.max(0, Math.floor(value)), 99) : 0;
  return String(safe).padStart(2, "0");
}

export interface FormattedCountdown {
  days: string;
  hours: string;
  minutes: string;
  isComplete: boolean;
}

/** Compute + clamp + format in one call — what the UI consumes. */
export function getFormattedCountdown(
  targetMs: number,
  nowMs: number,
): FormattedCountdown {
  const { days, hours, minutes, isComplete } = computeCountdown(targetMs, nowMs);
  return {
    days: formatTwoDigits(clampDays(days)),
    hours: formatTwoDigits(clampUnit(hours, 23)),
    minutes: formatTwoDigits(clampUnit(minutes, 59)),
    isComplete,
  };
}

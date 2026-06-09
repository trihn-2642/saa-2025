"use client";

import { useEffect, useState } from "react";
import {
  getCountdownTargetMs,
  getFormattedCountdown,
  type FormattedCountdown,
} from "@/lib/countdown";

/**
 * Live countdown to a target datetime, re-evaluated every second.
 *
 * SSR-safe: the first render (server + initial client paint) computes against
 * the target with `Date.now()` evaluated lazily inside an initializer, and the
 * interval only runs on the client. Returns 2-digit DAYS/HOURS/MINUTES strings
 * plus `isComplete`.
 */
export function useCountdown(targetMs: number = getCountdownTargetMs()): FormattedCountdown {
  const [value, setValue] = useState<FormattedCountdown>(() =>
    getFormattedCountdown(targetMs, Date.now()),
  );

  useEffect(() => {
    const tick = () => setValue(getFormattedCountdown(targetMs, Date.now()));
    tick(); // sync immediately on mount (covers hydration drift)
    const id = setInterval(tick, 1_000);
    return () => clearInterval(id);
  }, [targetMs]);

  return value;
}

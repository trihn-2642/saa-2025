// @vitest-environment jsdom
import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getFormattedCountdown } from "@/lib/countdown";
import { useCountdown } from "@/hooks/use-countdown";

/**
 * useCountdown — real behaviour test (jsdom + fake timers).
 *
 * The display math lives in the pure `getFormattedCountdown` (covered in
 * countdown.test.ts); here we verify the hook wiring: initial value, the
 * 1s interval re-evaluation, completion, and interval cleanup on unmount.
 * `getFormattedCountdown` is used as the oracle so we don't duplicate the math.
 */

const MIN = 60_000;
const HOUR = 60 * MIN;
const DAY = 24 * HOUR;
const NOW = 1_700_000_000_000; // fixed epoch for deterministic Date.now()

describe("useCountdown", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(NOW);
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns the formatted countdown for a future target", () => {
    const target = NOW + (5 * DAY + 3 * HOUR + 7 * MIN);
    const { result } = renderHook(() => useCountdown(target));

    expect(result.current).toEqual(getFormattedCountdown(target, NOW));
    expect(result.current).toMatchObject({
      days: "05",
      hours: "03",
      minutes: "07",
      isComplete: false,
    });
  });

  it("re-evaluates on the 1s interval as time passes", () => {
    const target = NOW + (1 * DAY + 2 * HOUR + 30 * MIN);
    const { result } = renderHook(() => useCountdown(target));

    expect(result.current.minutes).toBe("30");

    // Advance 10 minutes (600 ticks) — minutes should drop to 20.
    act(() => {
      vi.advanceTimersByTime(10 * MIN);
    });

    expect(result.current).toEqual(
      getFormattedCountdown(target, NOW + 10 * MIN),
    );
    expect(result.current.minutes).toBe("20");
    expect(result.current.hours).toBe("02");
  });

  it("reports completion (all zeros) when the target is in the past", () => {
    const target = NOW - 5 * MIN;
    const { result } = renderHook(() => useCountdown(target));

    expect(result.current).toMatchObject({
      days: "00",
      hours: "00",
      minutes: "00",
      isComplete: true,
    });
  });

  it("flips to complete once the target is reached while running", () => {
    const target = NOW + 2 * MIN;
    const { result } = renderHook(() => useCountdown(target));

    expect(result.current.isComplete).toBe(false);

    act(() => {
      vi.advanceTimersByTime(2 * MIN);
    });

    expect(result.current.isComplete).toBe(true);
    expect(result.current.minutes).toBe("00");
  });

  it("clears the interval on unmount (no further ticks)", () => {
    const clearSpy = vi.spyOn(globalThis, "clearInterval");
    const { unmount } = renderHook(() => useCountdown(NOW + DAY));

    unmount();

    expect(clearSpy).toHaveBeenCalled();
  });
});

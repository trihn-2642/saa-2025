import { describe, expect, it } from "vitest";

import {
  clampDays,
  clampUnit,
  computeCountdown,
  FALLBACK_TARGET_ISO,
  formatTwoDigits,
  getCountdownTargetMs,
  getFormattedCountdown,
} from "@/lib/countdown";

const MIN = 60_000;
const HOUR = 60 * MIN;
const DAY = 24 * HOUR;

describe("computeCountdown", () => {
  it("breaks a positive diff into days/hours/minutes", () => {
    const now = 0;
    const target = 20 * DAY + 17 * HOUR + 50 * MIN;
    expect(computeCountdown(target, now)).toEqual({
      days: 20,
      hours: 17,
      minutes: 50,
      isComplete: false,
    });
  });

  it("reports 00 days when less than one day remains (TC b373626d)", () => {
    expect(computeCountdown(23 * HOUR, 0).days).toBe(0);
  });

  it("sub-minute remainder shows 00 but is NOT yet complete", () => {
    expect(computeCountdown(59_000, 0)).toEqual({
      days: 0,
      hours: 0,
      minutes: 0,
      isComplete: false,
    });
  });

  it("returns all zeros + isComplete once the target is reached/passed (TC 50fc4021)", () => {
    expect(computeCountdown(0, 0)).toEqual({
      days: 0,
      hours: 0,
      minutes: 0,
      isComplete: true,
    });
    expect(computeCountdown(-HOUR, 0)).toEqual({
      days: 0,
      hours: 0,
      minutes: 0,
      isComplete: true,
    });
  });
});

describe("clampUnit (TC f98adad8 hours 00-23, TC 724e6e17 minutes 00-59)", () => {
  it.each([
    [-1, 23, 0],
    [0, 23, 0],
    [12, 23, 12],
    [23, 23, 23],
    [25, 23, 0],
    [-1, 59, 0],
    [30, 59, 30],
    [59, 59, 59],
    [60, 59, 0],
  ])("clampUnit(%i, max %i) -> %i", (value, max, expected) => {
    expect(clampUnit(value, max)).toBe(expected);
  });
});

describe("clampDays", () => {
  it.each([
    [-1, 0],
    [0, 0],
    [31, 31],
    [99, 99],
    [120, 99],
  ])("clampDays(%i) -> %i", (value, expected) => {
    expect(clampDays(value)).toBe(expected);
  });
});

describe("formatTwoDigits (TC c715cb38 two digits, leading zero)", () => {
  it.each([
    [0, "00"],
    [5, "05"],
    [9, "09"],
    [10, "10"],
    [59, "59"],
  ])("formatTwoDigits(%i) -> %s", (value, expected) => {
    expect(formatTwoDigits(value)).toBe(expected);
  });
});

describe("getFormattedCountdown", () => {
  it("formats every unit as a 2-digit string", () => {
    const now = 0;
    const target = 5 * HOUR + 20 * MIN;
    expect(getFormattedCountdown(target, now)).toEqual({
      days: "00",
      hours: "05",
      minutes: "20",
      isComplete: false,
    });
  });
});

describe("getCountdownTargetMs", () => {
  it("parses a valid ISO env value", () => {
    expect(getCountdownTargetMs("2026-06-30T09:00:00+07:00")).toBe(
      Date.parse("2026-06-30T09:00:00+07:00"),
    );
  });

  it("falls back to the constant when env is missing or invalid", () => {
    const fallback = Date.parse(FALLBACK_TARGET_ISO);
    expect(getCountdownTargetMs(undefined)).toBe(fallback);
    expect(getCountdownTargetMs("not-a-date")).toBe(fallback);
  });
});

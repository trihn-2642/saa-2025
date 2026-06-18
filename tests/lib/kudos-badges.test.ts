import { describe, expect, it } from "vitest";

import { badgeFromSenders, starsFromReceived } from "@/lib/kudos/badges";

/**
 * Badge/star derivation — must mirror the SQL `profile_stats` view thresholds
 * in supabase/migrations/20260617140000_kudos.sql. Boundary-focused.
 */
describe("starsFromReceived", () => {
  it("maps received count to star level at the boundaries", () => {
    expect(starsFromReceived(0)).toBe(0);
    expect(starsFromReceived(9)).toBe(0);
    expect(starsFromReceived(10)).toBe(1);
    expect(starsFromReceived(19)).toBe(1);
    expect(starsFromReceived(20)).toBe(2);
    expect(starsFromReceived(49)).toBe(2);
    expect(starsFromReceived(50)).toBe(3);
    expect(starsFromReceived(1000)).toBe(3);
  });
});

describe("badgeFromSenders", () => {
  it("returns null when no one has sent a kudos", () => {
    expect(badgeFromSenders(0)).toBeNull();
  });
  it("maps distinct-sender count to tier at the boundaries", () => {
    expect(badgeFromSenders(1)).toBe("new");
    expect(badgeFromSenders(4)).toBe("new");
    expect(badgeFromSenders(5)).toBe("rising");
    expect(badgeFromSenders(9)).toBe("rising");
    expect(badgeFromSenders(10)).toBe("super");
    expect(badgeFromSenders(19)).toBe("super");
    expect(badgeFromSenders(20)).toBe("legend");
    expect(badgeFromSenders(99)).toBe("legend");
  });
});

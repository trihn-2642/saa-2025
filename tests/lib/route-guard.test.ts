import { describe, expect, it } from "vitest";
import { decideRedirect } from "@/lib/auth/route-guard";

describe("decideRedirect", () => {
  it("sends a logged-out user away from a protected route", () => {
    expect(decideRedirect({ hasUser: false, pathname: "/home" })).toBe(
      "/login",
    );
    expect(decideRedirect({ hasUser: false, pathname: "/home/settings" })).toBe(
      "/login",
    );
  });

  it("sends a logged-in user away from /login", () => {
    expect(decideRedirect({ hasUser: true, pathname: "/login" })).toBe("/home");
  });

  it("lets matching states through (no redirect)", () => {
    expect(decideRedirect({ hasUser: true, pathname: "/home" })).toBeNull();
    expect(decideRedirect({ hasUser: false, pathname: "/login" })).toBeNull();
    expect(
      decideRedirect({ hasUser: false, pathname: "/countdown" }),
    ).toBeNull();
    expect(
      decideRedirect({ hasUser: true, pathname: "/countdown" }),
    ).toBeNull();
  });
});

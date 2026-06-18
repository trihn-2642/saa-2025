import fs from "node:fs";

import { expect, test } from "@playwright/test";

/**
 * /home (Homepage SAA) E2E — page-render only.
 *
 * Auth: tests/e2e/auth.setup.ts establishes a Supabase session and writes
 * tests/e2e/storageState.json (loaded into every context by playwright.config).
 * If the session couldn't be established it writes an EMPTY state, and the
 * authenticated specs below skip themselves (no fake passes).
 */

// Did global setup produce a real (non-empty) authenticated session?
const authReady = (() => {
  try {
    const s = JSON.parse(
      fs.readFileSync("tests/e2e/storageState.json", "utf8"),
    );
    return Array.isArray(s.cookies) && s.cookies.length > 0;
  } catch {
    return false;
  }
})();

// ── Unauthenticated (default context has no session) ──────────────────────────
test.describe("Homepage /home — unauthenticated", () => {
  test("redirects /home to /login when signed out", async ({ page }) => {
    await page.goto("/home");
    await expect(page).toHaveURL(/\/login$/);
  });
});

// ── Authenticated page render (opts into the session from auth.setup) ─────────
test.describe("Homepage /home — authenticated render", () => {
  test.skip(
    !authReady,
    "no authenticated Supabase session (auth.setup deferred)",
  );
  test.use({ storageState: "tests/e2e/storageState.json" });

  test.beforeEach(async ({ page }) => {
    await page.goto("/home");
    await expect(page).toHaveURL(/\/home$/);
  });

  test("header + nav render", async ({ page }) => {
    await expect(page.locator("header")).toBeVisible();
    await expect(
      page.locator("header").getByText("About SAA 2025"),
    ).toBeVisible();
    await expect(
      page.locator("header").getByText("Award Information"),
    ).toBeVisible();
  });

  test("hero renders: ROOT FURTHER, Comming soon, countdown, CTAs", async ({
    page,
  }) => {
    await expect(page.getByAltText("ROOT FURTHER").first()).toBeVisible();
    await expect(page.getByText("Comming soon")).toBeVisible();
    for (const label of ["DAYS", "HOURS", "MINUTES"]) {
      await expect(page.getByText(label, { exact: true })).toBeVisible();
    }
    await expect(page.getByText("ABOUT AWARDS")).toBeVisible();
    await expect(page.getByText("ABOUT KUDOS")).toBeVisible();
  });

  test("awards section renders 6 cards", async ({ page }) => {
    await expect(page.locator("article")).toHaveCount(6);
    await expect(
      page.getByRole("heading", { name: "Top Talent" }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "MVP (Most Valuable Person)" }),
    ).toBeVisible();
  });

  test("kudos section renders", async ({ page }) => {
    await expect(
      page.getByRole("heading", { name: "Sun* Kudos" }),
    ).toBeVisible();
  });

  test("footer renders with copyright", async ({ page }) => {
    const footer = page.locator("footer");
    await expect(footer).toBeVisible();
    await expect(footer.getByText(/©\s*Sun\*|Sun\*\s*©/)).toBeVisible();
  });

  test("floating widget button renders", async ({ page }) => {
    await expect(
      page.getByLabel(/Open quick menu|Mở menu nhanh/i),
    ).toBeVisible();
  });
});

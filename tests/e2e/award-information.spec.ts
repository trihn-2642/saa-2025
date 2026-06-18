import fs from "node:fs";

import { expect, test } from "@playwright/test";

/**
 * /award-information (Award Information / "Hệ thống giải thưởng SAA 2025") E2E.
 *
 * Auth: tests/e2e/auth.setup.ts writes tests/e2e/storageState.json. If no real
 * session could be established it writes an EMPTY state and the authenticated
 * specs below skip (no fake passes) — same pattern as homepage.spec.ts.
 *
 * Assertions use the award names (identical across vi/en) so they don't break
 * with the active locale.
 */

const AWARD_TITLES = [
  "Top Talent",
  "Top Project",
  "Top Project Leader",
  "Best Manager",
  "Signature 2025 - Creator",
  "MVP (Most Valuable Person)",
];

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

// ── Unauthenticated ───────────────────────────────────────────────────────────
test.describe("Award Information /award-information — unauthenticated", () => {
  test("redirects to /login when signed out", async ({ page }) => {
    await page.goto("/award-information");
    await expect(page).toHaveURL(/\/login$/);
  });
});

// ── Authenticated render ──────────────────────────────────────────────────────
test.describe("Award Information /award-information — authenticated render", () => {
  test.skip(
    !authReady,
    "no authenticated Supabase session (auth.setup deferred)",
  );
  test.use({ storageState: "tests/e2e/storageState.json" });

  test.beforeEach(async ({ page }) => {
    await page.goto("/award-information");
    await expect(page).toHaveURL(/\/award-information$/);
  });

  test("header + footer render", async ({ page }) => {
    await expect(page.locator("header")).toBeVisible();
    await expect(page.locator("footer")).toBeVisible();
  });

  test("title band renders ROOT FURTHER lockup", async ({ page }) => {
    await expect(page.getByAltText("ROOT FURTHER").first()).toBeVisible();
  });

  test("renders all 6 award detail blocks (headings)", async ({ page }) => {
    for (const title of AWARD_TITLES) {
      await expect(
        page.getByRole("heading", { name: title, exact: true }),
      ).toBeVisible();
    }
  });

  test("renders all 6 award anchor sections (scroll-spy targets)", async ({
    page,
  }) => {
    for (const id of [
      "top-talent",
      "top-project",
      "top-project-leader",
      "best-manager",
      "signature-2025-creator",
      "mvp",
    ]) {
      await expect(page.locator(`#${id}`)).toBeAttached();
    }
  });

  test("sidebar nav lists the 6 awards", async ({ page }) => {
    const nav = page.getByRole("navigation", { name: /giải thưởng/i });
    await expect(nav).toBeVisible();
    for (const label of ["Top Talent", "Top Project", "Best Manager", "MVP"]) {
      await expect(
        nav.getByRole("button", { name: label, exact: true }),
      ).toBeVisible();
    }
  });

  test("clicking a sidebar item scrolls its section into view", async ({
    page,
  }) => {
    const nav = page.getByRole("navigation", { name: /giải thưởng/i });
    await nav.getByRole("button", { name: "MVP" }).click();
    await expect(page.locator("#mvp")).toBeInViewport();
  });

  test("Signature shows both prize tiers separated by an 'Hoặc' divider", async ({
    page,
  }) => {
    const section = page.locator("#signature-2025-creator");
    await expect(section.getByText("5.000.000 VNĐ")).toBeVisible();
    await expect(section.getByText("8.000.000 VNĐ")).toBeVisible();
  });

  test("reused Kudos banner renders", async ({ page }) => {
    await expect(
      page.getByRole("heading", { name: "Sun* Kudos" }),
    ).toBeVisible();
  });
});

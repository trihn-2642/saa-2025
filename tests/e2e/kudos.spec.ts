import fs from "node:fs";

import { expect, test } from "@playwright/test";

/**
 * /kudos (Sun* Kudos — Live board) E2E.
 *
 * Auth: tests/e2e/auth.setup.ts writes tests/e2e/storageState.json. With no real
 * session it writes an EMPTY state and the authenticated specs skip (no fake
 * passes) — same pattern as award-information.spec.ts. The authenticated specs
 * also need the kudos schema/seed applied (the page server-queries Supabase).
 *
 * Assertions target the hard-coded section headings ("HIGHLIGHT KUDOS",
 * "SPOTLIGHT BOARD", "ALL KUDOS") so they hold regardless of the active locale.
 */

const SECTION_TITLES = ["HIGHLIGHT KUDOS", "SPOTLIGHT BOARD", "ALL KUDOS"];

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
test.describe("Kudos /kudos — unauthenticated", () => {
  test("redirects to /login when signed out", async ({ page }) => {
    await page.goto("/kudos");
    await expect(page).toHaveURL(/\/login$/);
  });
});

// ── Authenticated render ──────────────────────────────────────────────────────
test.describe("Kudos /kudos — authenticated render", () => {
  test.skip(
    !authReady,
    "no authenticated Supabase session (auth.setup deferred)",
  );
  test.use({ storageState: "tests/e2e/storageState.json" });

  test.beforeEach(async ({ page }) => {
    await page.goto("/kudos");
    await expect(page).toHaveURL(/\/kudos$/);
  });

  test("header + footer render", async ({ page }) => {
    await expect(page.locator("header")).toBeVisible();
    await expect(page.locator("footer")).toBeVisible();
  });

  test("renders the three section headings", async ({ page }) => {
    for (const title of SECTION_TITLES) {
      await expect(
        page.getByRole("heading", { name: title, exact: true }),
      ).toBeVisible();
    }
  });

  test("spotlight board shows the total KUDOS count", async ({ page }) => {
    await expect(page.getByText(/\d+\s+KUDOS/)).toBeVisible();
  });

  test("highlight carousel exposes prev/next controls", async ({ page }) => {
    await expect(page.getByRole("button", { name: "Previous" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Next" })).toBeVisible();
  });
});

// ── Write-kudos dialog ────────────────────────────────────────────────────────
// Default locale is vi (no NEXT_LOCALE cookie). The banner CTA, the dialog
// fields, and validation are asserted without touching the DB (no real submit).
test.describe("Kudos /kudos — write dialog", () => {
  test.skip(
    !authReady,
    "no authenticated Supabase session (auth.setup deferred)",
  );
  test.use({ storageState: "tests/e2e/storageState.json" });

  test.beforeEach(async ({ page }) => {
    await page.goto("/kudos");
    await expect(page).toHaveURL(/\/kudos$/);
    // Banner CTA pill opens the dialog (vi placeholder text).
    await page.getByRole("button", { name: /Hôm nay/ }).click();
  });

  test("opens with the editor + required fields", async ({ page }) => {
    // Quill mounts (dynamic, ssr:false) → editor + toolbar visible.
    await expect(page.locator(".ql-editor")).toBeVisible();
    await expect(page.locator(".ql-toolbar")).toBeVisible();
    // Recipient + Danh hiệu fields present (aria-labels are locale text).
    await expect(page.getByLabel("Người nhận")).toBeVisible();
    await expect(page.getByLabel("Danh hiệu")).toBeVisible();
  });

  test("Gửi is disabled until required fields are filled", async ({ page }) => {
    await expect(
      page.getByRole("button", { name: "Gửi", exact: true }),
    ).toBeDisabled();
  });

  test("Hủy closes the dialog (editor unmounts)", async ({ page }) => {
    await expect(page.locator(".ql-editor")).toBeVisible();
    await page.getByRole("button", { name: /Hủy/ }).click();
    await expect(page.locator(".ql-editor")).toHaveCount(0);
  });
});

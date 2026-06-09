import { expect, test } from "@playwright/test";

test.describe("Countdown prelaunch page", () => {
  test("/ redirects to /countdown", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveURL(/\/countdown$/);
  });

  test("renders the title and three unit labels", async ({ page }) => {
    await page.goto("/countdown");
    await expect(
      page.getByRole("heading", { name: "Sự kiện sẽ bắt đầu sau" }),
    ).toBeVisible();
    for (const label of ["DAYS", "HOURS", "MINUTES"]) {
      await expect(page.getByText(label, { exact: true })).toBeVisible();
    }
  });

  test("shows six single-digit LED boxes and no SECONDS unit", async ({ page }) => {
    await page.goto("/countdown");
    const digits = page.locator(".font-digital");
    await expect(digits).toHaveCount(6); // 3 units × 2 digits
    for (let i = 0; i < 6; i++) {
      await expect(digits.nth(i)).toHaveText(/^[0-9]$/);
    }
    await expect(page.getByText("SECONDS", { exact: true })).toHaveCount(0);
  });

  test("exposes a live timer region for accessibility", async ({ page }) => {
    await page.goto("/countdown");
    await expect(page.getByRole("timer")).toBeVisible();
  });
});

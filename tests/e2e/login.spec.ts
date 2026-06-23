import { expect, test } from "@playwright/test";

test.describe("Login screen", () => {
  test("renders the key elements", async ({ page }) => {
    await page.goto("/login");
    await expect(page.getByAltText("ROOT FURTHER")).toBeVisible();
    await expect(
      page.getByRole("button", { name: /LOGIN With Google/i }),
    ).toBeVisible();
    await expect(page.getByText(/Bản quyền thuộc về Sun/)).toBeVisible();
  });

  test("redirects an unauthenticated user from / to /login", async ({
    page,
  }) => {
    await page.goto("/");
    await expect(page).toHaveURL(/\/login$/);
  });

  test("fits the viewport without vertical scroll", async ({ page }) => {
    await page.goto("/login");
    const overflows = await page.evaluate(
      () => document.documentElement.scrollHeight > window.innerHeight + 1,
    );
    expect(overflows).toBe(false);
  });
});

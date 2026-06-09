import { defineConfig } from "@playwright/test";

/** E2E config — tests live in tests/e2e, run against the Next dev server. */
export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: "list",
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      use: { browserName: "chromium", viewport: { width: 1280, height: 800 } },
    },
  ],
  webServer: {
    command: "yarn dev",
    url: "http://localhost:3000/countdown",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});

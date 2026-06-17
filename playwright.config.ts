import { defineConfig } from "@playwright/test";

/** E2E config — tests live in tests/e2e, run against the Next dev server. */
export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: "list",
  globalSetup: require.resolve("./tests/e2e/auth.setup.ts"),
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      use: {
        browserName: "chromium",
        viewport: { width: 1280, height: 800 },
        // Default context is UNAUTHENTICATED (no storageState). Only the
        // authenticated /home describe opts into tests/e2e/storageState.json,
        // so login/countdown specs stay logged-out.
      },
    },
  ],
  webServer: {
    command: "yarn dev",
    url: "http://localhost:3000/countdown",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});

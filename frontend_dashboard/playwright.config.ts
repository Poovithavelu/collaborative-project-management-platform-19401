import { defineConfig, devices } from "@playwright/test";

/**
 * PUBLIC_INTERFACE
 * Playwright configuration for E2E tests against the Next.js frontend.
 *
 * Usage:
 *  - Base URL is set via BASE_URL or defaults to http://localhost:3000
 *  - Backend API URL used by the app must be configured via NEXT_PUBLIC_BACKEND_API_URL
 *  - The tests expect a running backend with endpoints described in the project README.
 */
export default defineConfig({
  testDir: "./tests/e2e",
  timeout: 60_000,
  expect: {
    timeout: 10_000,
  },
  fullyParallel: true,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    baseURL: process.env.BASE_URL || "http://localhost:3000",
    trace: "on-first-retry",
    video: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "firefox",
      use: { ...devices["Desktop Firefox"] },
    },
    {
      name: "webkit",
      use: { ...devices["Desktop Safari"] },
    },
  ],
  /**
   * Optionally, start the Next.js app for local E2E via webServer.
   * For CI/local convenience, you can run:
   *  - npm run e2e:dev (starts dev server then runs tests)
   * If your CI already starts the server, you can disable this.
   */
  webServer: process.env.PW_SKIP_WEBSERVER
    ? undefined
    : {
        command: "npm run dev",
        url: process.env.BASE_URL || "http://localhost:3000",
        reuseExistingServer: !process.env.CI,
        timeout: 120_000,
      },
});

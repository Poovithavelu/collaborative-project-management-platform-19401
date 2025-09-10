import { test, expect } from "@playwright/test";

/**
 * These tests assume a fresh backend or a test user that can be created.
 * They interact with the UI only (no direct API calls) to validate:
 *  - Registration redirects to dashboard
 *  - Route guard redirects to /login when unauthenticated
 *  - Login navigates to dashboard
 */

const randomEmail = () => `testuser_${Date.now()}_${Math.floor(Math.random() * 10000)}@example.com`;

test.describe("Authentication", () => {
  test("unauthenticated user is redirected from /dashboard to /login", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/.*\/login$/);
    await expect(page.getByRole("heading", { name: "Sign in" })).toBeVisible();
  });

  test("user can register and is redirected to dashboard", async ({ page }) => {
    const email = randomEmail();
    await page.goto("/register");

    await expect(page.getByRole("heading", { name: "Create account" })).toBeVisible();

    await page.getByLabel("Full name").fill("Playwright Tester");
    await page.getByLabel("Email").fill(email);
    await page.getByLabel("Password").fill("passw0rd!");
    await page.getByLabel("Confirm password").fill("passw0rd!");
    await page.getByRole("button", { name: "Create account" }).click();

    // On success, server action redirects to /dashboard
    await page.waitForURL(/.*\/dashboard$/);
    await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible();
  });

  test("user can log out and is redirected to login", async ({ page }) => {
    // Precondition: have an account. We can create a new one quickly.
    const email = randomEmail();
    await page.goto("/register");
    await page.getByLabel("Full name").fill("Playwright Logout");
    await page.getByLabel("Email").fill(email);
    await page.getByLabel("Password").fill("passw0rd!");
    await page.getByLabel("Confirm password").fill("passw0rd!");
    await page.getByRole("button", { name: "Create account" }).click();
    await page.waitForURL(/.*\/dashboard$/);

    // Click Log out button in dashboard header
    await page.getByRole("button", { name: "Log out" }).click();

    await page.waitForURL(/.*\/login$/);
    await expect(page.getByRole("heading", { name: "Sign in" })).toBeVisible();
  });

  test("existing user can login and see dashboard", async ({ page }) => {
    // Create a user via UI registration
    const email = randomEmail();
    const password = "passw0rd!";
    await page.goto("/register");
    await page.getByLabel("Full name").fill("Playwright Login");
    await page.getByLabel("Email").fill(email);
    await page.getByLabel("Password").fill(password);
    await page.getByLabel("Confirm password").fill(password);
    await page.getByRole("button", { name: "Create account" }).click();
    await page.waitForURL(/.*\/dashboard$/);

    // Log out
    await page.getByRole("button", { name: "Log out" }).click();
    await page.waitForURL(/.*\/login$/);

    // Log in with the same account
    await page.getByLabel("Email").fill(email);
    await page.getByLabel("Password").fill(password);
    await page.getByRole("button", { name: "Sign in" }).click();

    await page.waitForURL(/.*\/dashboard$/);
    await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible();
  });
});

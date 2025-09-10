import { test, expect } from "@playwright/test";

/**
 * Covers:
 *  - Project creation from dashboard
 *  - Project listing card appears
 *  - Navigation to project detail
 *  - Task creation via modal
 *  - Task edit via modal
 */

const makeAccount = async (page: any) => {
  const email = `proj_${Date.now()}_${Math.floor(Math.random() * 10000)}@example.com`;
  const password = "passw0rd!";
  await page.goto("/register");
  await page.getByLabel("Full name").fill("Playwright Project Owner");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill(password);
  await page.getByLabel("Confirm password").fill(password);
  await page.getByRole("button", { name: "Create account" }).click();
  await page.waitForURL(/.*\/dashboard$/);
  return { email, password };
};

test.describe("Projects and Tasks", () => {
  test("create project and navigate to detail", async ({ page }) => {
    await makeAccount(page);

    await expect(page.getByRole("heading", { name: "Projects" })).toBeVisible();

    // Open create project modal
    await page.getByRole("button", { name: "Create Project" }).click();

    // Fill modal fields
    await page.getByLabel("Project name").fill("Playwright Test Project");
    await page.getByLabel("Description (optional)").fill("This is a test project created by Playwright.");

    await page.getByRole("button", { name: "Create" }).click();

    // Expect the modal to close and the project card to appear
    await expect(page.getByText("Playwright Test Project")).toBeVisible();

    // Navigate to project
    await page.getByRole("link", { name: /Playwright Test Project/ }).click();

    // Project detail assertions
    await expect(page.getByRole("heading", { name: "Playwright Test Project" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Tasks" })).toBeVisible();
  });

  test("create task then edit it", async ({ page }) => {
    await makeAccount(page);

    // Create a project first
    await page.getByRole("button", { name: "Create Project" }).click();
    await page.getByLabel("Project name").fill("Project With Tasks");
    await page.getByRole("button", { name: "Create" }).click();
    await page.getByRole("link", { name: /Project With Tasks/ }).click();

    // Add Task
    await page.getByRole("button", { name: "Add Task" }).click();
    await page.getByLabel("Title").fill("Initial task title");
    await page.getByLabel("Description (optional)").fill("Initial description");
    await page.getByRole("button", { name: "Create" }).click();

    // Expect the task item to be visible
    await expect(page.getByText("Initial task title")).toBeVisible();

    // Open edit task modal
    await page.getByRole("button", { name: /Edit/ }).first().click();

    // Change title and status
    await page.getByLabel("Title").fill("Updated task title");
    await page.getByLabel("Status").selectOption("in_progress");
    await page.getByRole("button", { name: "Save changes" }).click();

    // Expect updated fields to be visible
    await expect(page.getByText("Updated task title")).toBeVisible();
    await expect(page.getByText("in_progress")).toBeVisible();
  });
});

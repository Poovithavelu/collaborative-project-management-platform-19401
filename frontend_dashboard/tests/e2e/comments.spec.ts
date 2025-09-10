import { test, expect } from "@playwright/test";

/**
 * Validates comments flow:
 *  - Create account, project, and task
 *  - Post a comment on the task
 *  - See comment appear in list
 */

const makeAccount = async (page: any) => {
  const email = `comments_${Date.now()}_${Math.floor(Math.random() * 10000)}@example.com`;
  const password = "passw0rd!";
  await page.goto("/register");
  await page.getByLabel("Full name").fill("Playwright Commenter");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill(password);
  await page.getByLabel("Confirm password").fill(password);
  await page.getByRole("button", { name: "Create account" }).click();
  await page.waitForURL(/.*\/dashboard$/);
  return { email, password };
};

test.describe("Comments", () => {
  test("user can add a comment to a task", async ({ page }) => {
    await makeAccount(page);

    // Create project
    await page.getByRole("button", { name: "Create Project" }).click();
    await page.getByLabel("Project name").fill("Comment Project");
    await page.getByRole("button", { name: "Create" }).click();
    await page.getByRole("link", { name: /Comment Project/ }).click();

    // Create task
    await page.getByRole("button", { name: "Add Task" }).click();
    await page.getByLabel("Title").fill("Commented Task");
    await page.getByRole("button", { name: "Create" }).click();
    await expect(page.getByText("Commented Task")).toBeVisible();

    // Find first comment form under the task and submit
    await page.getByRole("textbox", { name: "Add a comment" }).fill("This is a Playwright comment.");
    await page.getByRole("button", { name: "Comment" }).click();

    // Expect the comment to appear
    await expect(page.getByText("This is a Playwright comment.")).toBeVisible();
  });
});

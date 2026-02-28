import { test, expect } from "@playwright/test";

test.describe("Git Commit Generator", () => {
  test("page loads with heading visible", async ({ page }) => {
    await page.goto("/tools/git-commit-generator");

    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });

  test("commit form has type and scope inputs", async ({ page }) => {
    await page.goto("/tools/git-commit-generator");

    // The type selector label and dropdown should be visible
    await expect(page.getByText(/^type$/i).first()).toBeVisible({ timeout: 10000 });

    // The scope input should be visible (has placeholder from i18n)
    const scopeInput = page.getByPlaceholder(/auth, api, ui/i);
    await expect(scopeInput).toBeVisible();

    // Type a commit description using the description placeholder
    const descInput = page.getByPlaceholder(/add authentication flow/i);
    await descInput.fill("add user authentication");

    // The character counter should reflect the input length (shows /72)
    await expect(page.getByText(/\/72/).first()).toBeVisible();
  });
});

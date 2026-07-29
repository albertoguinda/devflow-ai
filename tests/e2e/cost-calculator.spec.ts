import { test, expect } from "@playwright/test";

test.describe("Cost Calculator", () => {
  test("page loads with pricing display visible", async ({ page }) => {
    await page.goto("/tools/cost-calculator");

    const heading = page.getByRole("heading", { level: 1 });
    await expect(heading).toBeVisible();

    // The estimated monthly cost section should be visible (contains dollar amount).
    // `.first()`: the label appears twice (summary card + comparison table), and a
    // bare getByText resolves to both, which is a strict-mode violation — the test
    // failed on the assertion, not on the page.
    await expect(page.getByText(/estimated monthly cost/i).first()).toBeVisible({ timeout: 10000 });
  });

  test("displays model names in the comparison table", async ({ page }) => {
    await page.goto("/tools/cost-calculator");

    // Wait for heading first to ensure page is loaded
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();

    // At least one known model name should appear in the pricing table
    await expect(
      page.getByText(/GPT|Claude|Gemini|Llama/i).first()
    ).toBeVisible({ timeout: 15000 });
  });
});

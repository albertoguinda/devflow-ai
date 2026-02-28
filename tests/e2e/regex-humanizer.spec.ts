import { test, expect } from "@playwright/test";

test.describe("Regex Humanizer", () => {
  test("page loads with heading visible", async ({ page }) => {
    await page.goto("/tools/regex-humanizer");

    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });

  test("explains a regex pattern", async ({ page }) => {
    await page.goto("/tools/regex-humanizer");

    // Type a regex pattern in the textarea
    const input = page.locator("textarea").first();
    await input.fill("\\d{3}-\\d{4}");

    // Click analyze button
    const analyzeBtn = page.getByRole("button", { name: /analyze pattern|analizar patr/i });
    await analyzeBtn.click();

    // Explanation should appear mentioning digits or numbers
    await expect(page.getByText(/digit|dígito|number|número/i).first()).toBeVisible({ timeout: 10000 });
  });

  test("flavor selector changes active flavor", async ({ page }) => {
    await page.goto("/tools/regex-humanizer");

    // The flavor selector should be visible
    const pythonBtn = page.getByRole("button", { name: /python/i });
    await expect(pythonBtn).toBeVisible({ timeout: 10000 });

    // Click Python flavor
    await pythonBtn.click();

    // Python button should be pressed/selected
    await expect(pythonBtn).toHaveAttribute("aria-pressed", "true");

    // JavaScript should no longer be pressed
    const jsBtn = page.getByRole("button", { name: /javascript/i });
    await expect(jsBtn).toHaveAttribute("aria-pressed", "false");
  });
});

import { test, expect } from "@playwright/test";

test.describe("DTO-Matic", () => {
  test("page loads with heading visible", async ({ page }) => {
    await page.goto("/tools/dto-matic");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });

  test("generates TypeScript interface from JSON", async ({ page }) => {
    await page.goto("/tools/dto-matic");

    // Use the JSON input textarea (has aria-label "JSON input for DTO generation")
    const input = page.locator('textarea[aria-label="JSON input for DTO generation"]');
    await expect(input).toBeVisible({ timeout: 10000 });
    await input.fill('{"name": "John", "age": 30, "active": true}');

    const generateBtn = page.getByRole("button", { name: /generate/i }).first();
    await generateBtn.click();

    // Should produce TypeScript output containing "interface" keyword in a code block
    await expect(page.locator("pre").filter({ hasText: /interface/ })).toBeVisible({ timeout: 10000 });
  });
});

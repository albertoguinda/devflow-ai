import { test, expect } from "@playwright/test";

test.describe("Hash Generator Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/tools/hash-generator");
  });

  test("should load the page with ToolHeader", async ({ page }) => {
    // ToolHeader should display the title
    await expect(
      page.getByRole("heading", { name: /hash generator|generador de hash/i }),
    ).toBeVisible();
  });

  test("should have input area and accept text", async ({ page }) => {
    // Fill the textarea with sample text
    const input = page.locator("textarea").first();
    await expect(input).toBeVisible();
    await input.fill("Hello World");
    await expect(input).toHaveValue("Hello World");
  });

  test("should generate a hash when clicking the generate button", async ({
    page,
  }) => {
    // Type input text
    const input = page.locator("textarea").first();
    await input.fill("Hello World");

    // Click generate button
    const generateBtn = page
      .getByRole("button", { name: /generate hash|generar hash/i })
      .first();
    await generateBtn.click();

    // Output should contain a hash result (hex string)
    await expect(page.locator("pre").first()).toBeVisible({ timeout: 10000 });
  });
});

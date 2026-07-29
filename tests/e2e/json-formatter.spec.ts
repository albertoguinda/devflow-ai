import { test, expect } from "@playwright/test";

test.describe("JSON Formatter", () => {
  test("formats valid JSON input", async ({ page }) => {
    await page.goto("/tools/json-formatter");

    // Use more robust selectors: first textarea role or data-testid
    const input = page.getByRole("textbox").first();
    await input.fill('{"name":"test","value":123}');

    // Click the format button
    const formatBtn = page.getByRole("button", { name: /format/i }).first();
    await formatBtn.click();

    // Output should contain formatted JSON with indentation (syntax highlighted spans)
    await expect(page.locator(".text-cyan-600, .text-cyan-400").first()).toBeVisible();
  });

  test("shows error for invalid JSON", async ({ page }) => {
    await page.goto("/tools/json-formatter");

    const input = page.getByRole("textbox").first();
    await input.fill("{invalid json}");

    const formatBtn = page.getByRole("button", { name: /format/i }).first();
    await formatBtn.click();

    // Error badge should appear. `.first()`: "ERROR" shows up in four places at
    // once (badge, status line, output panel and stats), so a bare getByText is a
    // strict-mode violation rather than a real failure.
    await expect(page.getByText("ERROR").first()).toBeVisible();
  });
});

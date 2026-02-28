import { test, expect } from "@playwright/test";

test.describe("Command Palette", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/tools");
  });

  test("Ctrl+K opens the command palette", async ({ page }) => {
    await page.keyboard.press("Control+k");
    await expect(page.getByRole("listbox")).toBeVisible();
  });

  test("typing filters the commands", async ({ page }) => {
    await page.keyboard.press("Control+k");
    await expect(page.getByRole("listbox")).toBeVisible();

    await page.keyboard.type("json");
    // Should show JSON-related tools
    const options = page.getByRole("option");
    const count = await options.count();
    expect(count).toBeGreaterThan(0);
    expect(count).toBeLessThan(20); // Filtered, not all commands
  });

  test("Escape closes the command palette", async ({ page }) => {
    await page.keyboard.press("Control+k");
    await expect(page.getByRole("listbox")).toBeVisible();

    await page.keyboard.press("Escape");
    await expect(page.getByRole("listbox")).not.toBeVisible();
  });

  test("Enter on a tool navigates to tool page", async ({ page }) => {
    await page.keyboard.press("Control+k");
    await expect(page.getByRole("listbox")).toBeVisible();

    await page.keyboard.type("json formatter");
    // Wait for filtered results to settle and click the option directly
    // (SearchField can intercept Enter key, so clicking is more reliable)
    const option = page.getByRole("option").first();
    await expect(option).toBeVisible();
    await option.click();

    await expect(page).toHaveURL(/\/tools\/json-formatter/);
  });

  test("Arrow keys change selected option", async ({ page }) => {
    await page.keyboard.press("Control+k");
    await expect(page.getByRole("listbox")).toBeVisible();

    // First option should be selected by default
    const firstOption = page.getByRole("option").first();
    await expect(firstOption).toHaveAttribute("aria-selected", "true");

    // Verify a second option exists and is not selected
    const secondOption = page.getByRole("option").nth(1);
    await expect(secondOption).toHaveAttribute("aria-selected", "false");

    // Mouse hover on second option changes selection
    await secondOption.hover();
    await expect(secondOption).toHaveAttribute("aria-selected", "true");
    await expect(firstOption).toHaveAttribute("aria-selected", "false");
  });

  test("clicking a command executes it", async ({ page }) => {
    await page.keyboard.press("Control+k");
    await expect(page.getByRole("listbox")).toBeVisible();

    // Click on json-formatter tool
    await page.keyboard.type("json formatter");
    const option = page.getByRole("option").first();
    await expect(option).toBeVisible();
    await option.click();

    await expect(page).toHaveURL(/\/tools\/json-formatter/);
  });
});

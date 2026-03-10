import { test, expect } from "@playwright/test";

test.describe("Settings", () => {
  test("theme toggle switches between dark and light mode", async ({ page }) => {
    await page.goto("/settings");

    // Click the "dark" theme button on the settings page (guarantees a class change)
    const darkButton = page.getByRole("button", { name: "dark", exact: true });
    await expect(darkButton).toBeVisible({ timeout: 5000 });
    await darkButton.click();

    // next-themes should apply "dark" class on <html>
    await expect(page.locator("html")).toHaveClass(/dark/, { timeout: 5000 });
  });

  test("locale toggle switches between EN and ES", async ({ page }) => {
    await page.goto("/settings");

    // Find any English text on the page
    const settingsHeading = page.getByRole("heading", { level: 1 });
    const initialText = await settingsHeading.textContent();

    // Open the locale selector (HeroUI v3 Select compound component)
    // Target the Select trigger specifically (has aria-haspopup="listbox")
    const localeTrigger = page.locator('button[aria-haspopup="listbox"][aria-label*="anguage" i], button[aria-haspopup="listbox"][aria-label*="dioma" i]').first();
    await localeTrigger.click();

    // Select Español from the listbox
    await page.getByRole("option", { name: /español/i }).click();

    // Wait for async locale load + re-render
    await expect(settingsHeading).not.toHaveText(initialText ?? "", { timeout: 10000 });
  });
});

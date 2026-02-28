import { test, expect } from "@playwright/test";

test.describe("Settings Export/Import", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/settings");
  });

  test("settings page loads", async ({ page }) => {
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });

  test("export button is present and clickable", async ({ page }) => {
    const exportBtn = page.getByRole("button", { name: /export|exportar/i });
    await expect(exportBtn).toBeVisible();
  });

  test("import button is present and clickable", async ({ page }) => {
    const importBtn = page.getByRole("button", { name: /import|importar/i });
    await expect(importBtn).toBeVisible();
  });

  test("theme toggle changes theme", async ({ page }) => {
    // Theme uses three buttons: light, dark, system (not a switch)
    const htmlBefore = await page.locator("html").getAttribute("class");

    // Click the "dark" theme button (has Moon icon)
    const darkBtn = page.getByRole("button", { name: /dark|oscuro/i });
    if (await darkBtn.isVisible()) {
      await darkBtn.click();
    } else {
      // If already dark, click light
      const lightBtn = page.getByRole("button", { name: /light|claro/i });
      await lightBtn.click();
    }

    // Wait for the HTML class to actually change (theme transition)
    await page.waitForFunction(
      (prevClass) => document.documentElement.getAttribute("class") !== prevClass,
      htmlBefore,
      { timeout: 5000 }
    );

    const htmlAfter = await page.locator("html").getAttribute("class");
    // Theme class should have changed
    expect(htmlBefore).not.toBe(htmlAfter);
  });
});

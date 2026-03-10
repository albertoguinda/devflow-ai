import { test, expect } from "@playwright/test";

test.describe("Color Converter Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/tools/color-converter");
  });

  test("should load the page with ToolHeader", async ({ page }) => {
    // ToolHeader should display the title
    await expect(
      page.getByRole("heading", {
        name: /color converter|conversor de colores/i,
      }),
    ).toBeVisible();
  });

  test("should have input field and accept a hex color", async ({ page }) => {
    // The color input field
    const input = page.getByRole("textbox").first();
    await expect(input).toBeVisible();
    await input.fill("#ff6600");
    await expect(input).toHaveValue("#ff6600");
  });

  test("should have a color picker and convert button", async ({ page }) => {
    // Native color picker input should exist
    const picker = page.locator("input[type='color']");
    await expect(picker).toBeAttached();

    // Convert button should exist
    const convertBtn = page
      .getByRole("button", { name: /convert|convertir/i })
      .first();
    await expect(convertBtn).toBeVisible();
  });
});

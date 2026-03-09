import { test, expect } from "@playwright/test";

test.describe("Password Generator Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/tools/password-generator");
  });

  test("should load the page with ToolHeader", async ({ page }) => {
    // ToolHeader should display the title
    await expect(
      page.getByRole("heading", {
        name: /password generator|generador de contrase/i,
      }),
    ).toBeVisible();
  });

  test("should have a generate button", async ({ page }) => {
    const generateBtn = page
      .getByRole("button", {
        name: /generate password|generar contrase/i,
      })
      .first();
    await expect(generateBtn).toBeVisible();
  });

  test("should generate a password and display it in the output area", async ({
    page,
  }) => {
    // Click generate
    const generateBtn = page
      .getByRole("button", {
        name: /generate password|generar contrase/i,
      })
      .first();
    await generateBtn.click();

    // A password result should appear (div with font-mono for the password)
    const output = page.locator(".font-mono.text-lg, .font-mono.text-xl").first();
    await expect(output).toBeVisible({ timeout: 10000 });

    // Password should have content (at least 8 characters, the default minimum)
    const text = await output.textContent();
    expect(text?.length).toBeGreaterThanOrEqual(8);
  });
});

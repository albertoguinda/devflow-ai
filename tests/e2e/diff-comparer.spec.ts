import { test, expect } from "@playwright/test";

test.describe("Diff Comparer Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/tools/diff-comparer");
  });

  test("should load the page with ToolHeader", async ({ page }) => {
    // ToolHeader should display the title
    await expect(
      page.getByRole("heading", {
        name: /diff comparer|comparador de diferencias/i,
      }),
    ).toBeVisible();
  });

  test("should have two textarea inputs for original and modified text", async ({
    page,
  }) => {
    const textareas = page.locator("textarea");
    // At least 2 textareas for original and modified
    await expect(textareas.first()).toBeVisible();
    await expect(textareas.nth(1)).toBeVisible();

    // Fill both textareas
    await textareas.first().fill("Hello World");
    await textareas.nth(1).fill("Hello Mundo");
    await expect(textareas.first()).toHaveValue("Hello World");
    await expect(textareas.nth(1)).toHaveValue("Hello Mundo");
  });

  test("should have a compare button and show diff results", async ({
    page,
  }) => {
    // Fill original and modified
    const textareas = page.locator("textarea");
    await textareas.first().fill("line one\nline two\nline three");
    await textareas.nth(1).fill("line one\nline changed\nline three");

    // Click compare button
    const compareBtn = page
      .getByRole("button", { name: /compare|comparar/i })
      .first();
    await expect(compareBtn).toBeVisible();
    await compareBtn.click();

    // Diff output should show added/removed indicators
    await expect(page.getByText(/added|removed|a.adid|eliminad/i).first()).toBeVisible({
      timeout: 10000,
    });
  });
});

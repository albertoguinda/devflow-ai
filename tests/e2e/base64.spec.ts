import { test, expect } from "@playwright/test";

test.describe("Base64 Encoder/Decoder", () => {
  test("encodes text to base64", async ({ page }) => {
    await page.goto("/tools/base64");

    // Ensure encode mode is active
    const encodeBtn = page.getByRole("button", { name: /^encode$|^codificar$/i });
    await encodeBtn.click();

    // Type input text
    const input = page.locator("textarea").first();
    await input.fill("Hello World");

    // Click process button
    const processBtn = page.getByRole("button", { name: /generate encoding|generar codificaci/i });
    await processBtn.click();

    // Output should contain the base64 encoded value
    await expect(page.locator("pre code").first()).toContainText("SGVsbG8gV29ybGQ=");
  });

  test("decodes base64 to text", async ({ page }) => {
    await page.goto("/tools/base64");

    // Switch to decode mode
    const decodeBtn = page.getByRole("button", { name: /^decode$|^decodificar$/i });
    await decodeBtn.click();

    // Type base64 input
    const input = page.locator("textarea").first();
    await input.fill("SGVsbG8gV29ybGQ=");

    // Click process button
    const processBtn = page.getByRole("button", { name: /execute decoding|ejecutar decodificaci/i });
    await processBtn.click();

    // Output should contain the decoded text
    await expect(page.locator("pre code").first()).toContainText("Hello World");
  });

  test("batch encodes multiple lines", async ({ page }) => {
    await page.goto("/tools/base64");

    // Switch to Batch tab
    const batchTab = page.getByRole("tab", { name: /batch/i });
    await batchTab.click();

    // Fill batch input with multiple lines
    const batchInput = page.getByPlaceholder(/paste multiple lines/i);
    await expect(batchInput).toBeVisible({ timeout: 10000 });
    await batchInput.fill("Hello\nWorld\nTest");

    // Click encode all button
    const encodeAllBtn = page.getByRole("button", { name: /encode all|codificar todo/i });
    await encodeAllBtn.click();

    // Should show success count
    await expect(page.getByText(/3/).first()).toBeVisible({ timeout: 5000 });
  });
});

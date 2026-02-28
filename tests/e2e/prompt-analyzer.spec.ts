import { test, expect } from "@playwright/test";

test.describe("Prompt Analyzer", () => {
  test("page heading is visible", async ({ page }) => {
    await page.goto("/tools/prompt-analyzer");

    const heading = page.getByRole("heading", { level: 1 });
    await expect(heading).toBeVisible();
  });

  test("analyzes a prompt and shows score", async ({ page }) => {
    await page.goto("/tools/prompt-analyzer");

    // Use the prompt textarea (has id "prompt-input")
    const textarea = page.locator("#prompt-input");
    await expect(textarea).toBeVisible({ timeout: 10000 });
    await textarea.fill(
      "You are a helpful assistant. Summarize the following text:"
    );

    // Click the analyze button (text: "Analyze Prompt" / "Analizar Prompt")
    const analyzeBtn = page
      .getByRole("button", { name: /analy/i })
      .first();
    await analyzeBtn.click();

    // Score badge should appear — shows pattern like "7/10" or "5/10"
    await expect(page.getByText(/\d+\/10/).first()).toBeVisible({ timeout: 10000 });
  });
});

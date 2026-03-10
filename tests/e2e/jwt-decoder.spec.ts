import { test, expect } from "@playwright/test";

test.describe("JWT Decoder Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/tools/jwt-decoder");
  });

  test("should load the page with ToolHeader", async ({ page }) => {
    // ToolHeader should display the title
    await expect(
      page.getByRole("heading", {
        name: /jwt decoder|decodificador jwt/i,
      }),
    ).toBeVisible();
  });

  test("should have input textarea and accept a JWT token", async ({
    page,
  }) => {
    const input = page.locator("textarea").first();
    await expect(input).toBeVisible();

    // Fill with a sample JWT token (header.payload.signature)
    const sampleJwt =
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c";
    await input.fill(sampleJwt);
    await expect(input).toHaveValue(sampleJwt);
  });

  test("should have a decode button and decode a valid JWT", async ({
    page,
  }) => {
    // Fill with a valid JWT
    const input = page.locator("textarea").first();
    await input.fill(
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c",
    );

    // Click decode button
    const decodeBtn = page
      .getByRole("button", { name: /decode jwt|decodificar jwt/i })
      .first();
    await decodeBtn.click();

    // Decoded payload should be visible with the "John Doe" name claim
    await expect(page.getByText("John Doe").first()).toBeVisible({ timeout: 10000 });
  });
});

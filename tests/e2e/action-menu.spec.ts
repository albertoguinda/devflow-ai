import { test, expect } from "@playwright/test";

/**
 * The three dropdown menus of the app.
 *
 * They shipped dead: HeroUI v3 beta's `Dropdown` never opened its popover, and no
 * test covered them, so nobody noticed. They are now built on `ActionMenu`, and
 * this spec exists so the same thing cannot happen quietly again — it asserts the
 * menu actually opens AND that picking an option does something.
 */
test.describe("Action menus", () => {
  test("UUID generator: export format menu opens and applies the choice", async ({ page }) => {
    await page.goto("/tools/uuid-generator");

    await page.getByRole("button", { name: /generate sequence|generar secuencia/i }).first().click();

    const trigger = page.getByRole("button", { name: /export format|formato de exportación/i }).first();
    await expect(trigger).toBeVisible();
    await trigger.click();

    const menu = page.getByRole("menu");
    await expect(menu).toBeVisible();
    await expect(page.getByRole("menuitemradio")).toHaveCount(4);

    await page.getByRole("menuitemradio", { name: /json/i }).first().click();

    // The trigger shows the active format, so it is proof the selection landed.
    await expect(trigger).toContainText("JSON");
    await expect(menu).toBeHidden();
  });

  test("Git commit generator: type menu opens and applies the choice", async ({ page }) => {
    await page.goto("/tools/git-commit-generator");

    const trigger = page.getByRole("button", { name: /^(type|tipo)$/i }).first();
    await expect(trigger).toBeVisible();
    await trigger.click();

    await expect(page.getByRole("menu")).toBeVisible();
    // 11 conventional commit types.
    await expect(page.getByRole("menuitemradio")).toHaveCount(11);

    await page.getByRole("menuitemradio", { name: /bug fix|correcci/i }).first().click();
    await expect(trigger).toContainText("fix");
  });

  test("Code review: issue actions menu opens and navigates", async ({ page }) => {
    await page.goto("/tools/code-review");

    const input = page.getByRole("textbox").first();
    await input.fill(
      'function calc(a,b){\n  var r = a+b\n  if(r == null) { return 0 }\n  eval("x")\n  return r\n}',
    );
    await page.getByRole("button", { name: /review code|revisar código/i }).first().click();

    const trigger = page.getByRole("button", { name: /issue actions|acciones/i }).first();
    await expect(trigger).toBeVisible({ timeout: 10000 });
    await trigger.click();

    await expect(page.getByRole("menu")).toBeVisible();
    await page.getByRole("menuitem").first().click();

    await expect(page).toHaveURL(/\/tools\/variable-name-wizard/);
  });

  test("menu is keyboard operable and Escape returns focus to the trigger", async ({ page }) => {
    await page.goto("/tools/git-commit-generator");

    const trigger = page.getByRole("button", { name: /^(type|tipo)$/i }).first();
    await trigger.focus();
    await page.keyboard.press("ArrowDown");

    const menu = page.getByRole("menu");
    await expect(menu).toBeVisible();

    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("Enter");
    await expect(menu).toBeHidden();

    // Reopen and close with Escape: focus must come back to the trigger, or a
    // keyboard user is dropped at the top of the document.
    await page.keyboard.press("ArrowDown");
    await expect(menu).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(menu).toBeHidden();
    await expect(trigger).toBeFocused();
  });
});

import { expect, test } from "@playwright/test";

test("admin login redirects to dashboard", async ({ page }) => {
  await page.goto("/admin/login");

  await page.getByLabel(/e-mail/i).fill("teste@luanamodotte.local");
  await page.getByLabel(/senha/i).fill("Teste@1234");

  await Promise.all([
    page.waitForURL(/\/admin\/dashboard(?:\?.*)?$/),
    page.getByRole("button", { name: /entrar/i }).click(),
  ]);

  await expect(page.getByRole("button", { name: /sair/i })).toBeVisible();
});

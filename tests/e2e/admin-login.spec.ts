import { expect, test } from "@playwright/test";

const adminEmail = process.env.E2E_ADMIN_EMAIL;
const adminPassword = process.env.E2E_ADMIN_PASSWORD;

test("admin login redirects to dashboard", async ({ page }) => {
  test.skip(
    !adminEmail || !adminPassword,
    "Configure E2E_ADMIN_EMAIL and E2E_ADMIN_PASSWORD with an active Supabase admin."
  );

  await page.goto("/admin/login");

  await page.getByLabel(/e-mail/i).fill(adminEmail!);
  await page.getByLabel(/senha/i).fill(adminPassword!);

  await Promise.all([
    page.waitForURL(/\/admin\/dashboard(?:\?.*)?$/),
    page.getByRole("button", { name: /entrar/i }).click(),
  ]);

  await expect(page.getByRole("button", { name: /sair/i })).toBeVisible();
});

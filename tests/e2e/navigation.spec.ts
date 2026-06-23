import { expect, test } from "@playwright/test";

test("home page renders hero and featured properties", async ({ page }) => {
  await page.goto("/");

  await expect(
    page.getByRole("heading", {
      name: /o seu coracao escolhe o lar/i,
    })
  ).toBeVisible();
  await expect(
    page.getByRole("heading", {
      name: /selecao inicial de ativos com leitura comercial forte/i,
    })
  ).toBeVisible();
});

test("admin login is reachable", async ({ page }) => {
  await page.goto("/admin/login");

  await expect(
    page.getByRole("heading", {
      name: /entrar no painel/i,
    })
  ).toBeVisible();
});

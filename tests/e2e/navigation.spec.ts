import { expect, test } from "@playwright/test";

test("home page renders hero and featured properties", async ({ page }) => {
  await page.goto("/");

  await expect(
    page.getByRole("heading", {
      name: /assessoria imobiliária com atendimento próximo/i,
      level: 1,
    }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", {
      name: /imóveis publicados/i,
    }),
  ).toBeVisible();
});

test("property search blocks duplicate submissions while navigation is pending", async ({
  page,
}) => {
  await page.goto("/");
  await page.locator('form[action="/imoveis"]').evaluate((form) => {
    form.addEventListener("submit", (event) => event.preventDefault(), {
      once: true,
    });
  });

  await page.getByRole("button", { name: "Buscar imóveis" }).click();

  await expect(
    page.getByRole("button", { name: "Buscando imóveis..." }),
  ).toBeDisabled();
});

test("admin login is reachable", async ({ page }) => {
  await page.goto("/admin/login");

  await expect(
    page.getByRole("heading", {
      name: /entrar no painel/i,
    }),
  ).toBeVisible();
});

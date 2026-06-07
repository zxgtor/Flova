import { expect, test } from "@playwright/test";

test("landing page renders the hero CTA", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: /forge your imagination/i })).toBeVisible();
  await expect(page.getByRole("link", { name: /start forging/i })).toBeVisible();
});

test("sign-in link leads to the form", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("link", { name: /^sign in$/i }).first().click();
  await expect(page).toHaveURL(/\/signin/);
  await expect(page.getByRole("heading", { name: /sign in to flova/i })).toBeVisible();
});

test("studio launcher shows seven studio cards", async ({ page }) => {
  await page.goto("/studio");
  const cards = page.getByTestId("studio-card");
  await expect(cards).toHaveCount(7);
});

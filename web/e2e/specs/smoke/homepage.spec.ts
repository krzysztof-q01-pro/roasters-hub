import { test, expect } from "@playwright/test";
import { HomePage } from "../../pages/home.page";

test.describe("Smoke: Homepage", () => {
  test("renders without errors", async ({ page }) => {
    const home = new HomePage(page);
    await home.goto();

    await home.expectHeroVisible();
  });

  test("navigation links work", async ({ page }) => {
    const home = new HomePage(page);
    await home.goto();

    await home.clickBrowseRoasters();
    await expect(page).toHaveURL(/\/roasters/);
  });

  test("has correct title", async ({ page }) => {
    const home = new HomePage(page);
    await home.goto();

    await expect(page).toHaveTitle(/Bean Map/i);
  });
});

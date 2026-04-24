import { test, expect } from "@playwright/test";
import { RoastersPage } from "../../pages/roasters.page";
import { RoasterProfilePage } from "../../pages/roaster-profile.page";

test.describe("Smoke: Roasters", () => {
  test("catalog renders with heading", async ({ page }) => {
    const roasters = new RoastersPage(page);
    await roasters.goto();

    await roasters.expectHeadingVisible();
  });

  test("shows roaster cards", async ({ page }) => {
    const roasters = new RoastersPage(page);
    await roasters.goto();

    await roasters.expectResultsCount();
    await roasters.expectRoasterCardsVisible();
  });

  test("clicking roaster navigates to profile", async ({ page }) => {
    const roasters = new RoastersPage(page);
    await roasters.goto();

    await roasters.clickFirstRoaster();

    const profile = new RoasterProfilePage(page);
    await expect(page).toHaveURL(/\/roasters\//);
    await profile.expectWebsiteLinkVisible();
  });
});

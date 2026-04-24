import { test, expect } from "@playwright/test";
import { CafesPage } from "../../pages/cafes.page";

test.describe("Smoke: Cafes", () => {
  test("catalog renders with heading", async ({ page }) => {
    const cafes = new CafesPage(page);
    await cafes.goto();

    await cafes.expectHeadingVisible();
  });

  test("shows cafe cards", async ({ page }) => {
    const cafes = new CafesPage(page);
    await cafes.goto();

    await cafes.expectResultsCount();
  });
});

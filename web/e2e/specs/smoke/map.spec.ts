import { test, expect } from "@playwright/test";
import { MapPage } from "../../pages/map.page";

test.describe("Smoke: Map", () => {
  test("renders map container", async ({ page }) => {
    const map = new MapPage(page);
    await map.goto();

    await map.expectMapVisible();
  });
});

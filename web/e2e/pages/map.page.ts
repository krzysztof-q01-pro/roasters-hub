import { Page, expect } from "@playwright/test";
import { BasePage } from "./base.page";

export class MapPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async goto(): Promise<void> {
    await this.page.goto("/map");
    await this.waitForLoad();
  }

  async expectMapVisible(): Promise<void> {
    // Leaflet map container
    await expect(
      this.page.locator(".leaflet-container").first()
    ).toBeVisible();
  }
}

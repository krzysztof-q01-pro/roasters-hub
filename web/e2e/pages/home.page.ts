import { Page, expect } from "@playwright/test";
import { BasePage } from "./base.page";

export class HomePage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async goto(): Promise<void> {
    await this.page.goto("/");
    await this.waitForLoad();
  }

  async expectHeroVisible(): Promise<void> {
    await expect(
      this.page.getByRole("heading", { name: /Discover specialty coffee/i })
    ).toBeVisible();
  }

  async clickBrowseRoasters(): Promise<void> {
    await this.page
      .locator("main, [role='main']")
      .getByRole("link", { name: /Browse Roasters/i })
      .first()
      .click();
  }
}

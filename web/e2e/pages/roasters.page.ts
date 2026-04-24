import { Page, expect } from "@playwright/test";
import { BasePage } from "./base.page";

export class RoastersPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async goto(): Promise<void> {
    await this.page.goto("/roasters");
    await this.waitForLoad();
  }

  async expectHeadingVisible(): Promise<void> {
    await expect(
      this.page.getByRole("heading", { level: 1, name: /Specialty Coffee Roasters/i })
    ).toBeVisible();
  }

  async expectResultsCount(): Promise<void> {
    await expect(
      this.page.getByText(/Showing \d+ of \d+ results/i)
    ).toBeVisible();
  }

  async expectRoasterCardsVisible(): Promise<void> {
    const cards = this.page.locator("a[href^='/roasters/']");
    await expect(cards.first()).toBeVisible();
  }

  async clickFirstRoaster(): Promise<void> {
    await this.page
      .locator("[data-testid='roaster-card'], a[href^='/roasters/']")
      .first()
      .click();
  }
}

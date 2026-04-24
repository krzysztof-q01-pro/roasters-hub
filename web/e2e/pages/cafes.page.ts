import { Page, expect } from "@playwright/test";
import { BasePage } from "./base.page";

export class CafesPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async goto(): Promise<void> {
    await this.page.goto("/cafes");
    await this.waitForLoad();
  }

  async expectHeadingVisible(): Promise<void> {
    await expect(
      this.page.getByRole("heading", { level: 1, name: /Specialty Coffee Cafes/i })
    ).toBeVisible();
  }

  async expectResultsCount(): Promise<void> {
    await expect(
      this.page.getByText(/Showing \d+ of \d+ results/i)
    ).toBeVisible();
  }
}

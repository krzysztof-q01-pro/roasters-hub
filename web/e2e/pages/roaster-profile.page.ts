import { Page, expect } from "@playwright/test";
import { BasePage } from "./base.page";

export class RoasterProfilePage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async expectHeadingVisible(name: string): Promise<void> {
    await expect(
      this.page.getByRole("heading", { name })
    ).toBeVisible();
  }

  async expectWebsiteLinkVisible(): Promise<void> {
    await expect(
      this.page.getByRole("link", { name: /Website/i }).first()
    ).toBeVisible();
  }

  async expectWhereToDrinkSection(): Promise<void> {
    await expect(
      this.page.getByText(/Where to drink/i).first()
    ).toBeVisible();
  }
}

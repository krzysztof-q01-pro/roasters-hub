import { Page, expect } from "@playwright/test";

/**
 * Base Page Object — shared functionality for all pages.
 */
export class BasePage {
  constructor(protected page: Page) {}

  async goto(path: string): Promise<void> {
    await this.page.goto(path);
  }

  async waitForLoad(): Promise<void> {
    await this.page.waitForLoadState("networkidle");
  }

  async expectTitle(pattern: RegExp | string): Promise<void> {
    if (typeof pattern === "string") {
      await expect(this.page).toHaveTitle(pattern);
    } else {
      const title = await this.page.title();
      expect(title).toMatch(pattern);
    }
  }

  async screenshot(name: string): Promise<Buffer> {
    return await this.page.screenshot({ path: `e2e/snapshots/${name}.png` });
  }

  async isVisible(testId: string): Promise<boolean> {
    return await this.page.getByTestId(testId).isVisible();
  }

  async clickByTestId(testId: string): Promise<void> {
    await this.page.getByTestId(testId).click();
  }

  async fillByTestId(testId: string, value: string): Promise<void> {
    await this.page.getByTestId(testId).fill(value);
  }
}

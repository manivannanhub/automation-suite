import { expect } from '@playwright/test';
import { productsLocators } from '../locators/products.locators.js';
import { ROUTES } from '../utils/constants.js';

export class ProductsPage {
  /** @param {import('@playwright/test').Page} page */
  constructor(page) {
    this.page = page;
    this.loc = productsLocators;
  }

  async goto() {
    await this.page.goto(ROUTES.products);
    await expect(this.page.getByTestId(this.loc.testIds.search)).toBeVisible();
  }

  searchInput() {
    return this.page.getByTestId(this.loc.testIds.search);
  }

  productCards() {
    return this.page.locator(`[data-testid^="${this.loc.testIds.cardPrefix}"]`);
  }

  async search(term) {
    await this.searchInput().fill(term);
    // Debounced API (300ms) — wait for UI to settle
    await this.page.waitForTimeout(400);
  }

  async sortBy(field, order) {
    await this.page.getByTestId(this.loc.testIds.sortBy).selectOption(field);
    await this.page.getByTestId(this.loc.testIds.sortOrder).selectOption(order);
    await this.page.waitForTimeout(400);
  }

  async getProductNames() {
    const cards = this.productCards();
    return cards.evaluateAll((els, selector) => {
      return els.map((el) => {
        const nameEl = el.querySelector(selector);
        return (nameEl?.textContent ?? '').trim();
      });
    }, this.loc.selectors.productName);
  }

  async expectEmptySearchState() {
    await expect(this.page.getByText(this.loc.text.emptySearch)).toBeVisible();
    await expect(this.productCards()).toHaveCount(0);
  }
}

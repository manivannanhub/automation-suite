import { type Page, type Locator } from "@playwright/test";

export class ProductsPage {
  readonly page: Page;
  readonly searchInput: Locator;
  readonly sortBySelect: Locator;
  readonly sortOrderSelect: Locator;

  constructor(page: Page) {
    this.page = page;
    this.searchInput = page.getByTestId("product-search");
    this.sortBySelect = page.getByTestId("select-sort-by");
    this.sortOrderSelect = page.getByTestId("select-sort-order");
  }

  async goto() {
    await this.page.goto("/products");
  }

  async search(query: string) {
    await this.searchInput.clear();
    await this.searchInput.fill(query);
    await this.page.waitForTimeout(400);
  }

  async sortBy(field: "name" | "price") {
    await this.sortBySelect.selectOption(field);
    await this.page.waitForTimeout(300);
  }

  async sortOrder(order: "asc" | "desc") {
    await this.sortOrderSelect.selectOption(order);
    await this.page.waitForTimeout(300);
  }

  productCards() {
    return this.page.locator("[data-testid^='product-card-']");
  }

  productCard(id: string | number) {
    return this.page.getByTestId(`product-card-${id}`);
  }
}

import { test, expect } from "@playwright/test";
import { ProductsPage } from "./pages/products.page";
import { registerAndLogin } from "./helpers/auth";

test.describe("Products", () => {
  test.beforeEach(async ({ page }) => {
    await registerAndLogin(page);
  });

  test("lists products on load", async ({ page }) => {
    const products = new ProductsPage(page);
    await products.goto();
    await expect(products.productCards().first()).toBeVisible();
  });

  test("shows more than one product", async ({ page }) => {
    const products = new ProductsPage(page);
    await products.goto();
    const count = await products.productCards().count();
    expect(count).toBeGreaterThan(1);
  });

  test("search filters products by name", async ({ page }) => {
    const products = new ProductsPage(page);
    await products.goto();
    await products.search("Keyboard");
    const count = await products.productCards().count();
    expect(count).toBeGreaterThanOrEqual(1);
    await expect(page.getByText(/keyboard/i)).toBeVisible();
  });

  test("search with no results shows empty state", async ({ page }) => {
    const products = new ProductsPage(page);
    await products.goto();
    await products.search("xyznonexistentproduct12345");
    const count = await products.productCards().count();
    expect(count).toBe(0);
  });

  test("clearing search restores all products", async ({ page }) => {
    const products = new ProductsPage(page);
    await products.goto();

    const totalCount = await products.productCards().count();
    await products.search("Keyboard");
    await products.search("");
    await page.waitForTimeout(500);

    const restoredCount = await products.productCards().count();
    expect(restoredCount).toBe(totalCount);
  });

  test("sorts by name ascending", async ({ page }) => {
    const products = new ProductsPage(page);
    await products.goto();
    await products.sortBy("name");
    await products.sortOrder("asc");

    const cards = products.productCards();
    const names = await cards.evaluateAll((els) =>
      els.map((el) => el.querySelector("[data-product-name]")?.textContent ?? el.textContent ?? ""),
    );
    const sorted = [...names].sort((a, b) => a.localeCompare(b));
    expect(names).toEqual(sorted);
  });

  test("sorts by name descending", async ({ page }) => {
    const products = new ProductsPage(page);
    await products.goto();
    await products.sortBy("name");
    await products.sortOrder("desc");

    const cards = products.productCards();
    const names = await cards.evaluateAll((els) =>
      els.map((el) => el.querySelector("[data-product-name]")?.textContent ?? el.textContent ?? ""),
    );
    const sorted = [...names].sort((a, b) => b.localeCompare(a));
    expect(names).toEqual(sorted);
  });

  test("sort and search can be combined", async ({ page }) => {
    const products = new ProductsPage(page);
    await products.goto();
    await products.search("Wireless");
    await products.sortBy("price");
    await products.sortOrder("asc");

    const count = await products.productCards().count();
    expect(count).toBeGreaterThanOrEqual(1);
  });

  test("search is case-insensitive", async ({ page }) => {
    const products = new ProductsPage(page);
    await products.goto();
    await products.search("KEYBOARD");
    const upperCount = await products.productCards().count();

    await products.search("keyboard");
    const lowerCount = await products.productCards().count();

    expect(upperCount).toBe(lowerCount);
  });
});

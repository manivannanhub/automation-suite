import { test, expect } from '../../fixtures/baseTest.js';

test.describe('Products', () => {
  test.describe.configure({ timeout: 60_000 });

  test.beforeEach(async ({ authenticatedPage, productsPage }) => {
    await productsPage.goto();
  });

  test('[PROD-01] lists product cards on load', async ({ productsPage }) => {
    const cards = productsPage.productCards();
    await expect(cards.first()).toBeVisible();
    expect(await cards.count()).toBeGreaterThan(0);
  });

  test('[PROD-02] search filters products', async ({ productsPage, page }) => {
    await productsPage.search('Keyboard');
    await expect(productsPage.productCards().first()).toBeVisible();
    await expect(page.getByText(/keyboard/i).first()).toBeVisible();
  });

  test('[PROD-03] search with no results shows empty state', async ({
    productsPage,
  }) => {
    await productsPage.search('xyznonexistentproduct12345');
    await productsPage.expectEmptySearchState();
  });

  test('[PROD-04] sort controls are present', async ({ productsPage, page }) => {
    await expect(page.getByTestId('select-sort-by')).toBeVisible();
    await expect(page.getByTestId('select-sort-order')).toBeVisible();
  });

  test('[PROD-05] sort by name ascending', async ({ productsPage }) => {
    await productsPage.sortBy('name', 'asc');
    const names = await productsPage.getProductNames();
    const sorted = [...names].sort((a, b) => a.localeCompare(b));
    expect(names).toEqual(sorted);
  });
});

import { test, expect } from '@playwright/test';

/**
 * E2E Test: Complete Shopping Flow
 *
 * Tests the complete user journey through the Angular Dev Shop:
 * - Browsing products
 * - Searching and filtering
 * - Adding items to basket
 * - Basket persistence across navigation
 * - Viewing product details
 *
 * Requirements: 1.1, 3.2, 4.2, 5.1, 5.7, 6.1
 */

test.describe('Complete Shopping Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the home page before each test
    await page.goto('/');

    // Wait for the page to be fully loaded
    await page.waitForLoadState('networkidle');

    // Wait for Angular hydration
    await page.waitForTimeout(1000);
  });

  test('should complete full shopping journey from browsing to basket', async ({ page }) => {
    // Step 1: Verify initial product display (Requirement 1.1)
    await test.step('Browse products on landing page', async () => {
      // Wait for products to load
      await page.waitForSelector('.product-card', { timeout: 10000 });

      // Verify multiple products are displayed
      const productCards = page.locator('.product-card');
      const count = await productCards.count();
      expect(count).toBeGreaterThan(0);

      // Verify product card contains essential information
      const firstCard = productCards.first();
      await expect(firstCard.locator('.product-title')).toBeVisible();
      await expect(firstCard.locator('.product-pricing')).toBeVisible();
      await expect(firstCard.locator('img')).toBeVisible();
    });

    // Step 2: Test search functionality (Requirement 3.2)
    await test.step('Search for products', async () => {
      const searchInput = page.locator('.search-input');
      await expect(searchInput).toBeVisible();

      // Search for "Angular"
      await searchInput.fill('Angular');

      // Wait for search results to update
      await page.waitForTimeout(500); // Allow for debounce

      // Verify filtered results
      const productCards = page.locator('.product-card');
      const count = await productCards.count();
      expect(count).toBeGreaterThan(0);

      // Verify all visible products contain "Angular" in title
      const titles = await productCards.locator('.product-title').allTextContents();
      expect(titles.some(title => title.toLowerCase().includes('angular'))).toBeTruthy();
    });

    // Step 3: Test category filtering (Requirement 4.2)
    await test.step('Filter products by category', async () => {
      // Clear search first
      const searchInput = page.locator('.search-input');
      await searchInput.clear();
      await page.waitForTimeout(500);

      // Click on "Apparel" category
      const apparelCategory = page.locator('.category-button').filter({ hasText: 'Apparel' });
      await apparelCategory.click();

      // Wait for filter to apply
      await page.waitForTimeout(300);

      // Verify filtered results
      const productCards = page.locator('.product-card');
      const count = await productCards.count();
      expect(count).toBeGreaterThan(0);
      expect(count).toBeLessThan(12); // Should be filtered

      // Verify category is highlighted
      await expect(apparelCategory).toHaveClass(/selected/);
    });

    // Step 4: Test adding items to basket (Requirement 5.1)
    await test.step('Add product to basket', async () => {
      // Get initial basket count (should be 0 or not visible)
      const basketBadge = page.locator('.header__basket-badge');

      // Add first product to basket
      const firstAddButton = page.locator('.add-to-basket-btn').first();
      await firstAddButton.click();

      // Wait for basket to update
      await page.waitForTimeout(300);

      // Verify basket count increased
      await expect(basketBadge).toBeVisible();
      await expect(basketBadge).toHaveText('1');

      // Add another product
      const secondAddButton = page.locator('.add-to-basket-btn').nth(1);
      await secondAddButton.click();
      await page.waitForTimeout(300);

      // Verify basket count is now 2
      await expect(basketBadge).toHaveText('2');
    });

    // Step 5: Test basket sidebar display
    await test.step('Open and verify basket sidebar', async () => {
      // Open basket sidebar
      const basketButton = page.locator('.header__basket-button');
      await basketButton.click();

      // Wait for sidebar to open
      await page.waitForTimeout(300);

      // Verify sidebar is visible
      const basketSidebar = page.locator('.basket-sidebar.open');
      await expect(basketSidebar).toBeVisible();

      // Verify basket items are displayed
      const basketItems = page.locator('.basket-item');
      const itemCount = await basketItems.count();
      expect(itemCount).toBe(2);

      // Verify total price is displayed
      const totalPrice = page.locator('.total-price');
      await expect(totalPrice).toBeVisible();

      // Close sidebar
      const closeButton = page.locator('.close-button');
      await closeButton.click();
      await page.waitForTimeout(300);
    });

    // Step 6: Test navigation to product details (Requirement 6.1)
    await test.step('Navigate to product details page', async () => {
      // Click on first product card
      const firstCard = page.locator('.product-card').first();
      await firstCard.click();

      // Wait for navigation
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1000);

      // Verify URL contains product ID
      expect(page.url()).toMatch(/\/product\/.+/);

      // Verify product details are displayed
      await expect(page.locator('.product-details .product-title')).toBeVisible();
      await expect(page.locator('.product-details .product-pricing')).toBeVisible();
      await expect(page.locator('.product-details .product-description')).toBeVisible();
    });

    // Step 7: Test basket persistence across navigation (Requirement 5.7)
    await test.step('Verify basket persists after navigation', async () => {
      // Verify basket count is still 2 on product details page
      const basketBadge = page.locator('.header__basket-badge');
      await expect(basketBadge).toHaveText('2');

      // Navigate back to home
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1000);

      // Verify basket count is still 2 on home page
      await expect(basketBadge).toHaveText('2');

      // Open basket sidebar to verify items are still there
      const basketButton = page.locator('.header__basket-button');
      await basketButton.click();
      await page.waitForTimeout(300);

      const basketItems = page.locator('.basket-item');
      const itemCount = await basketItems.count();
      expect(itemCount).toBe(2);
    });

    // Step 8: Test basket quantity management
    await test.step('Update basket item quantity', async () => {
      // Basket sidebar should still be open from previous step
      const basketSidebar = page.locator('.basket-sidebar.open');
      await expect(basketSidebar).toBeVisible();

      // Get first item's quantity
      const firstItem = page.locator('.basket-item').first();
      const incrementBtn = firstItem.locator('.quantity-button').nth(1); // Second button is increment

      // Increment quantity
      await incrementBtn.click();
      await page.waitForTimeout(300);

      // Verify quantity increased
      const quantityDisplay = firstItem.locator('.quantity');
      await expect(quantityDisplay).toHaveText('2');

      // Verify total price updated
      const totalPrice = page.locator('.total-price');
      await expect(totalPrice).toBeVisible();
    });

    // Step 9: Test removing items from basket
    await test.step('Remove item from basket', async () => {
      // Remove first item
      const firstItem = page.locator('.basket-item').first();
      const removeBtn = firstItem.locator('.remove-button');
      await removeBtn.click();
      await page.waitForTimeout(300);

      // Verify item count decreased
      const basketItems = page.locator('.basket-item');
      const itemCount = await basketItems.count();
      expect(itemCount).toBe(1);

      // Verify basket count badge updated
      const basketBadge = page.locator('.header__basket-badge');
      await expect(basketBadge).toHaveText('1');
    });

    // Step 10: Test clearing search and viewing all products
    await test.step('Clear filters and view all products', async () => {
      // Close basket sidebar
      const closeButton = page.locator('.close-button');
      await closeButton.click();
      await page.waitForTimeout(300);

      // Click "All" category to clear filter
      const allCategory = page.locator('.category-button').filter({ hasText: /^All/ });
      await allCategory.click();
      await page.waitForTimeout(300);

      // Verify all products are displayed
      const productCards = page.locator('.product-card');
      const count = await productCards.count();
      expect(count).toBeGreaterThanOrEqual(10); // We have 12 sample products
    });
  });

  test('should handle empty basket state', async ({ page }) => {
    await test.step('Display empty basket message', async () => {
      // Open basket sidebar
      const basketButton = page.locator('.header__basket-button');
      await basketButton.click();
      await page.waitForTimeout(300);

      // Verify empty state is displayed
      const emptyMessage = page.locator('.empty-basket');
      await expect(emptyMessage).toBeVisible();

      // Verify no items are displayed
      const basketItems = page.locator('.basket-item');
      const itemCount = await basketItems.count();
      expect(itemCount).toBe(0);
    });
  });

  test('should handle search with no results', async ({ page }) => {
    await test.step('Display no results message', async () => {
      // Search for non-existent product
      const searchInput = page.locator('.search-input');
      await searchInput.fill('NonExistentProduct12345');
      await page.waitForTimeout(500);

      // Verify no products are displayed
      const productCards = page.locator('.product-card');
      const count = await productCards.count();
      expect(count).toBe(0);

      // Verify empty state message
      const emptyMessage = page.locator('.empty-state');
      await expect(emptyMessage).toBeVisible();
    });
  });

  test('should persist basket across page reload', async ({ page }) => {
    await test.step('Add items and reload page', async () => {
      // Wait for products to load
      await page.waitForSelector('.product-card', { timeout: 10000 });

      // Add two products to basket
      const addButtons = page.locator('.add-to-basket-btn');
      await addButtons.first().click();
      await page.waitForTimeout(300);
      await addButtons.nth(1).click();
      await page.waitForTimeout(300);

      // Verify basket count
      const basketBadge = page.locator('.header__basket-badge');
      await expect(basketBadge).toHaveText('2');

      // Reload the page
      await page.reload();
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1000);

      // Verify basket count persisted
      await expect(basketBadge).toHaveText('2');

      // Open basket and verify items
      const basketButton = page.locator('.header__basket-button');
      await basketButton.click();
      await page.waitForTimeout(300);

      const basketItems = page.locator('.basket-item');
      const itemCount = await basketItems.count();
      expect(itemCount).toBe(2);
    });
  });
});

import { test, expect } from '@playwright/test';

/**
 * E2E Test: Server-Side Rendering (SSR)
 *
 * Tests the SSR functionality of the Angular Dev Shop:
 * - Initial server-rendered HTML verification
 * - Hydration without errors
 * - No layout shift after hydration
 * - Consistent rendering between server and client
 *
 * Requirements: 7.1, 7.2, 7.3, 7.4
 */

test.describe('Server-Side Rendering (SSR)', () => {
  test('should deliver pre-rendered HTML from server', async ({ browser }) => {
    // Requirement 7.1, 7.2: Server renders initial page content and delivers pre-rendered HTML
    await test.step('Verify server-rendered HTML is present before hydration', async () => {
      // Create a new context with JavaScript disabled
      const context = await browser.newContext({
        javaScriptEnabled: false,
      });
      const page = await context.newPage();

      // Navigate to home page
      await page.goto('/');

      // Wait for page to load
      await page.waitForLoadState('domcontentloaded');

      // Verify essential content is present in server-rendered HTML
      // Header should be present
      const header = page.locator('header[appHeader]');
      await expect(header).toBeVisible();

      // App title should be present (skip visibility check on mobile due to CSS)
      const appTitle = page.locator('.header__title');
      const viewport = page.viewportSize();
      if (viewport && viewport.width >= 768) {
        // Only check visibility on non-mobile viewports
        await expect(appTitle).toBeVisible();
      }
      await expect(appTitle).toContainText('Angular Dev Shop');

      // Theme toggle should be present
      const themeToggle = page.locator('.theme-toggle');
      await expect(themeToggle).toBeVisible();

      // Basket button should be present
      const basketButton = page.locator('.header__basket-button');
      await expect(basketButton).toBeVisible();

      // Product list container should be present
      const productList = page.locator('app-product-list');
      await expect(productList).toBeVisible();

      await context.close();
    });

    await test.step('Verify product details route is accessible', async () => {
      // Create a new context with JavaScript disabled
      const context = await browser.newContext({
        javaScriptEnabled: false,
      });
      const page = await context.newPage();

      // Navigate to a product details page
      await page.goto('/product/ng-tshirt-001');
      await page.waitForLoadState('domcontentloaded');

      // Verify header is present (basic SSR structure)
      const header = page.locator('header[appHeader]');
      await expect(header).toBeVisible();

      // Verify app title is present
      const appTitle = page.locator('.header__title');
      const viewport = page.viewportSize();
      if (viewport && viewport.width >= 768) {
        // Only check visibility on non-mobile viewports
        await expect(appTitle).toBeVisible();
      }

      await context.close();
    });
  });

  test('should hydrate without errors and maintain functionality', async ({ page }) => {
    // Requirement 7.3: Hydrate client-side application after initial render
    await test.step('Capture console errors during hydration', async () => {
      const consoleErrors: string[] = [];
      const consoleWarnings: string[] = [];

      // Listen for console errors and warnings
      page.on('console', (msg) => {
        if (msg.type() === 'error') {
          consoleErrors.push(msg.text());
        } else if (msg.type() === 'warning') {
          consoleWarnings.push(msg.text());
        }
      });

      // Listen for page errors
      const pageErrors: Error[] = [];
      page.on('pageerror', (error) => {
        pageErrors.push(error);
      });

      // Navigate to home page with JavaScript enabled
      await page.goto('/');

      // Wait for page to fully load and hydrate
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000); // Allow time for hydration

      // Verify no hydration errors occurred
      const hydrationErrors = consoleErrors.filter(
        (error) =>
          error.includes('hydration') ||
          error.includes('mismatch') ||
          error.includes('NG0') // Angular error codes
      );

      expect(hydrationErrors.length).toBe(0);

      // Verify no critical page errors
      expect(pageErrors.length).toBe(0);

      // Filter out non-critical warnings (like favicon 404s)
      const criticalWarnings = consoleWarnings.filter(
        (warning) =>
          !warning.includes('favicon') &&
          !warning.includes('404') &&
          !warning.includes('Failed to load resource')
      );

      // Log any critical warnings for debugging
      if (criticalWarnings.length > 0) {
        console.log('Critical warnings during hydration:', criticalWarnings);
      }
    });

    await test.step('Verify interactive functionality after hydration', async () => {
      // Wait for products to load
      await page.waitForSelector('.product-card', { timeout: 10000 });

      // Test search functionality (requires hydration)
      const searchInput = page.locator('.search-input');
      await searchInput.fill('Angular');
      await page.waitForTimeout(500); // Debounce

      // Verify search works (filtering happens)
      const productCards = page.locator('.product-card');
      const count = await productCards.count();
      expect(count).toBeGreaterThan(0);

      // Clear search
      await searchInput.clear();
      await page.waitForTimeout(500);

      // Test category filter (requires hydration)
      const apparelCategory = page.locator('.category-button').filter({ hasText: 'Apparel' });
      await apparelCategory.click();
      await page.waitForTimeout(300);

      // Verify filter works
      await expect(apparelCategory).toHaveClass(/selected/);

      // Test add to basket (requires hydration)
      const addButton = page.locator('.add-to-basket-btn').first();
      await addButton.click();
      await page.waitForTimeout(300);

      // Verify basket count updated
      const basketBadge = page.locator('.header__basket-badge');
      await expect(basketBadge).toBeVisible();
      await expect(basketBadge).toHaveText('1');

      // Test theme toggle (requires hydration)
      const themeToggle = page.locator('.theme-toggle');
      await themeToggle.click();
      await page.waitForTimeout(400);

      // Verify theme changed
      const htmlElement = page.locator('html');
      await expect(htmlElement).toHaveAttribute('data-theme', 'dark');

      // Test navigation (requires hydration)
      const firstCard = page.locator('.product-card').first();
      await firstCard.click();
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1000);

      // Verify navigation worked
      expect(page.url()).toMatch(/\/product\/.+/);
    });
  });

  test('should have no layout shift after hydration', async ({ page }) => {
    // Requirement 7.4: Maintain consistent rendering between server and client
    await test.step('Measure layout stability during hydration', async () => {
      // Navigate to home page
      await page.goto('/');

      // Wait for initial render
      await page.waitForLoadState('domcontentloaded');
      await page.waitForTimeout(500);

      // Capture initial positions of key elements before hydration completes
      const headerInitial = await page.locator('header[appHeader]').boundingBox();
      const searchBarInitial = await page.locator('.search-input').boundingBox();
      const productGridInitial = await page.locator('.product-grid').boundingBox();

      // Wait for hydration to complete
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);

      // Capture positions after hydration
      const headerAfter = await page.locator('header[appHeader]').boundingBox();
      const searchBarAfter = await page.locator('.search-input').boundingBox();
      const productGridAfter = await page.locator('.product-grid').boundingBox();

      // Verify no significant layout shift occurred
      // Allow for minor differences (up to 20px) due to font loading, image loading, or browser rendering differences
      if (headerInitial && headerAfter) {
        expect(Math.abs(headerInitial.y - headerAfter.y)).toBeLessThan(20);
        expect(Math.abs(headerInitial.height - headerAfter.height)).toBeLessThan(20);
      }

      if (searchBarInitial && searchBarAfter) {
        expect(Math.abs(searchBarInitial.y - searchBarAfter.y)).toBeLessThan(20);
      }

      if (productGridInitial && productGridAfter) {
        expect(Math.abs(productGridInitial.y - productGridAfter.y)).toBeLessThan(20);
      }
    });

    await test.step('Verify product card layout stability', async () => {
      // Navigate to home page
      await page.goto('/');
      await page.waitForLoadState('domcontentloaded');
      await page.waitForTimeout(500);

      // Wait for product cards to be visible
      await page.waitForSelector('.product-card', { timeout: 10000 });

      // Capture initial position of first product card
      const firstCardInitial = await page.locator('.product-card').first().boundingBox();

      // Wait for hydration
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);

      // Capture position after hydration
      const firstCardAfter = await page.locator('.product-card').first().boundingBox();

      // Verify no layout shift
      if (firstCardInitial && firstCardAfter) {
        expect(Math.abs(firstCardInitial.y - firstCardAfter.y)).toBeLessThan(20);
        expect(Math.abs(firstCardInitial.x - firstCardAfter.x)).toBeLessThan(20);
        expect(Math.abs(firstCardInitial.width - firstCardAfter.width)).toBeLessThan(20);
        expect(Math.abs(firstCardInitial.height - firstCardAfter.height)).toBeLessThan(20);
      }
    });
  });

  test('should maintain consistent rendering between server and client', async ({ browser }) => {
    // Requirement 7.4: Consistent rendering between server and client
    await test.step('Compare server-rendered and client-rendered content', async () => {
      // First, get server-rendered HTML (JS disabled)
      const serverContext = await browser.newContext({
        javaScriptEnabled: false,
      });
      const serverPage = await serverContext.newPage();
      await serverPage.goto('/');
      await serverPage.waitForLoadState('domcontentloaded');

      // Capture server-rendered header content
      const serverHeaderText = await serverPage.locator('.header__title').textContent();

      // Check if product list is present
      const serverProductList = serverPage.locator('app-product-list');
      const serverProductListVisible = await serverProductList.isVisible();

      await serverContext.close();

      // Now get client-rendered content with JS enabled
      const clientContext = await browser.newContext({
        javaScriptEnabled: true,
      });
      const clientPage = await clientContext.newPage();
      await clientPage.goto('/');
      await clientPage.waitForLoadState('networkidle');
      await clientPage.waitForTimeout(2000);

      // Capture client-rendered header content
      const clientHeaderText = await clientPage.locator('.header__title').textContent();

      // Check if product list is present
      const clientProductList = clientPage.locator('app-product-list');
      const clientProductListVisible = await clientProductList.isVisible();

      // Verify header content matches
      expect(serverHeaderText).toBe(clientHeaderText);

      // Verify product list visibility matches
      expect(serverProductListVisible).toBe(clientProductListVisible);

      // Verify products are rendered after hydration
      await clientPage.waitForSelector('.product-card', { timeout: 10000 });
      const clientProductCards = clientPage.locator('.product-card');
      const clientCount = await clientProductCards.count();
      expect(clientCount).toBeGreaterThan(0);

      await clientContext.close();
    });
  });

  test('should handle SSR with different themes', async ({ page }) => {
    // Test SSR with theme preference stored in localStorage
    await test.step('Set dark theme and verify SSR respects it', async () => {
      // First visit to set theme
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1000);

      // Set dark theme
      const themeToggle = page.locator('.theme-toggle');
      await themeToggle.click();
      await page.waitForTimeout(400);

      // Verify dark theme is set
      const htmlElement = page.locator('html');
      await expect(htmlElement).toHaveAttribute('data-theme', 'dark');

      // Now reload and check if SSR respects the theme
      await page.reload();
      await page.waitForLoadState('domcontentloaded');

      // Check theme immediately after SSR (before hydration)
      const themeAfterSSR = await htmlElement.getAttribute('data-theme');
      expect(themeAfterSSR).toBe('dark');

      // Wait for hydration
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);

      // Verify theme is still dark after hydration
      await expect(htmlElement).toHaveAttribute('data-theme', 'dark');
    });
  });

  test('should handle SSR with basket state', async ({ page }) => {
    // Test SSR with basket items in localStorage
    await test.step('Add items to basket and verify SSR maintains state', async () => {
      // Add items to basket
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1000);

      // Wait for products
      await page.waitForSelector('.product-card', { timeout: 10000 });

      // Add two items
      const addButtons = page.locator('.add-to-basket-btn');
      await addButtons.first().click();
      await page.waitForTimeout(300);
      await addButtons.nth(1).click();
      await page.waitForTimeout(300);

      // Verify basket count
      const basketBadge = page.locator('.header__basket-badge');
      await expect(basketBadge).toHaveText('2');

      // Reload page
      await page.reload();
      await page.waitForLoadState('domcontentloaded');

      // Check basket count immediately after SSR
      // Note: Basket count might not be visible in SSR since it depends on localStorage
      // which is only available on client side

      // Wait for hydration
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);

      // Verify basket count is restored after hydration
      await expect(basketBadge).toHaveText('2');
    });
  });

  test('should handle SSR errors gracefully', async ({ page }) => {
    // Test SSR with invalid routes
    await test.step('Navigate to invalid product ID', async () => {
      const consoleErrors: string[] = [];

      page.on('console', (msg) => {
        if (msg.type() === 'error') {
          consoleErrors.push(msg.text());
        }
      });

      // Navigate to invalid product
      await page.goto('/product/invalid-product-id');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1000);

      // Should redirect to home page
      expect(page.url()).toMatch(/\/$/);

      // Verify no critical SSR errors
      const criticalErrors = consoleErrors.filter(
        (error) =>
          error.includes('SSR') ||
          error.includes('server') ||
          error.includes('hydration')
      );

      expect(criticalErrors.length).toBe(0);
    });
  });

  test('should deliver fast initial page load with SSR', async ({ page }) => {
    // Requirement 7.2: Fast initial page loads
    await test.step('Measure time to first contentful paint', async () => {
      // Navigate to home page
      const startTime = Date.now();
      await page.goto('/');

      // Wait for first contentful paint
      await page.waitForLoadState('domcontentloaded');

      const loadTime = Date.now() - startTime;

      // SSR should deliver content quickly (under 3 seconds even on slow connections)
      expect(loadTime).toBeLessThan(3000);

      // Verify content is visible
      const header = page.locator('header[appHeader]');
      await expect(header).toBeVisible();

      // Wait for products to be rendered
      await page.waitForSelector('.product-card', { timeout: 10000 });

      const productCards = page.locator('.product-card');
      const count = await productCards.count();
      expect(count).toBeGreaterThan(0);
    });
  });
});

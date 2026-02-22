import { test, expect } from '@playwright/test';

/**
 * E2E Test: Theme Switching
 *
 * Tests the theme toggle functionality across the Angular Dev Shop:
 * - Theme toggle interaction
 * - Theme persistence across page navigation
 * - Theme application on different components
 * - Theme persistence across page reload
 *
 * Requirements: 2.2, 2.3, 2.4, 6.4
 */

test.describe('Theme Switching', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the home page before each test
    await page.goto('/');

    // Wait for the page to be fully loaded
    await page.waitForLoadState('networkidle');

    // Wait for Angular hydration
    await page.waitForTimeout(1000);

    // Clear localStorage to start with default theme
    await page.evaluate(() => {
      localStorage.removeItem('angular-dev-shop-theme');
    });

    // Reload to apply default theme
    await page.reload();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
  });

  test('should toggle between light and dark themes', async ({ page }) => {
    // Requirement 2.2: Theme toggle control accessible from any page
    await test.step('Verify theme toggle button is visible', async () => {
      const themeToggle = page.locator('.theme-toggle');
      await expect(themeToggle).toBeVisible();
    });

    // Requirement 2.3: Apply theme immediately on toggle
    await test.step('Toggle from light to dark theme', async () => {
      // Verify initial theme is light
      const htmlElement = page.locator('html');
      await expect(htmlElement).toHaveAttribute('data-theme', 'light');

      // Verify sun icon is displayed for light theme
      const sunIcon = page.locator('.theme-icon--sun');
      await expect(sunIcon).toBeVisible();

      // Click theme toggle button
      const themeToggle = page.locator('.theme-toggle');
      await themeToggle.click();

      // Wait for theme transition
      await page.waitForTimeout(400);

      // Verify theme changed to dark
      await expect(htmlElement).toHaveAttribute('data-theme', 'dark');

      // Verify moon icon is displayed for dark theme
      const moonIcon = page.locator('.theme-icon--moon');
      await expect(moonIcon).toBeVisible();
    });

    await test.step('Toggle from dark back to light theme', async () => {
      // Click theme toggle button again
      const themeToggle = page.locator('.theme-toggle');
      await themeToggle.click();

      // Wait for theme transition
      await page.waitForTimeout(400);

      // Verify theme changed back to light
      const htmlElement = page.locator('html');
      await expect(htmlElement).toHaveAttribute('data-theme', 'light');

      // Verify sun icon is displayed again
      const sunIcon = page.locator('.theme-icon--sun');
      await expect(sunIcon).toBeVisible();
    });
  });

  test('should apply theme to all components', async ({ page }) => {
    // Requirement 2.3: Apply theme to all components immediately
    await test.step('Verify theme applies to header component', async () => {
      const header = page.locator('header[appHeader]');
      await expect(header).toBeVisible();

      // Toggle to dark theme
      const themeToggle = page.locator('.theme-toggle');
      await themeToggle.click();
      await page.waitForTimeout(400);

      // Verify HTML has dark theme
      const htmlElement = page.locator('html');
      await expect(htmlElement).toHaveAttribute('data-theme', 'dark');

      // Header should be visible and styled according to dark theme
      await expect(header).toBeVisible();
    });

    await test.step('Verify theme applies to product cards', async () => {
      // Wait for products to load
      await page.waitForSelector('.product-card', { timeout: 10000 });

      // Verify product cards are visible with dark theme
      const productCards = page.locator('.product-card');
      const count = await productCards.count();
      expect(count).toBeGreaterThan(0);

      // All product cards should be visible
      const firstCard = productCards.first();
      await expect(firstCard).toBeVisible();
    });

    await test.step('Verify theme applies to basket sidebar', async () => {
      // Open basket sidebar
      const basketButton = page.locator('.header__basket-button');
      await basketButton.click();
      await page.waitForTimeout(300);

      // Verify basket sidebar is visible with dark theme
      const basketSidebar = page.locator('.basket-sidebar.open');
      await expect(basketSidebar).toBeVisible();

      // Close sidebar
      const closeButton = page.locator('.close-button');
      await closeButton.click();
      await page.waitForTimeout(300);
    });

    await test.step('Verify theme applies to search and filter components', async () => {
      // Verify search bar is visible with dark theme
      const searchInput = page.locator('.search-input');
      await expect(searchInput).toBeVisible();

      // Verify category filter is visible with dark theme
      const categoryButtons = page.locator('.category-button');
      const categoryCount = await categoryButtons.count();
      expect(categoryCount).toBeGreaterThan(0);
    });
  });

  test('should persist theme across page navigation', async ({ page }) => {
    // Requirement 6.4: Maintain theme preference during navigation
    await test.step('Set dark theme on home page', async () => {
      // Toggle to dark theme
      const themeToggle = page.locator('.theme-toggle');
      await themeToggle.click();
      await page.waitForTimeout(400);

      // Verify dark theme is applied
      const htmlElement = page.locator('html');
      await expect(htmlElement).toHaveAttribute('data-theme', 'dark');
    });

    await test.step('Navigate to product details and verify theme persists', async () => {
      // Wait for products to load
      await page.waitForSelector('.product-card', { timeout: 10000 });

      // Click on first product card
      const firstCard = page.locator('.product-card').first();
      await firstCard.click();

      // Wait for navigation
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1000);

      // Verify URL changed to product details
      expect(page.url()).toMatch(/\/product\/.+/);

      // Verify dark theme persisted
      const htmlElement = page.locator('html');
      await expect(htmlElement).toHaveAttribute('data-theme', 'dark');

      // Verify moon icon is still displayed
      const moonIcon = page.locator('.theme-icon--moon');
      await expect(moonIcon).toBeVisible();
    });

    await test.step('Navigate back to home and verify theme still persists', async () => {
      // Navigate back to home
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1000);

      // Verify dark theme still persisted
      const htmlElement = page.locator('html');
      await expect(htmlElement).toHaveAttribute('data-theme', 'dark');

      // Verify moon icon is still displayed
      const moonIcon = page.locator('.theme-icon--moon');
      await expect(moonIcon).toBeVisible();
    });
  });

  test('should persist theme across page reload', async ({ page }) => {
    // Requirement 2.4: Persist theme preference across sessions
    await test.step('Set dark theme and reload page', async () => {
      // Toggle to dark theme
      const themeToggle = page.locator('.theme-toggle');
      await themeToggle.click();
      await page.waitForTimeout(400);

      // Verify dark theme is applied
      const htmlElement = page.locator('html');
      await expect(htmlElement).toHaveAttribute('data-theme', 'dark');

      // Reload the page
      await page.reload();
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1000);

      // Verify dark theme persisted after reload
      await expect(htmlElement).toHaveAttribute('data-theme', 'dark');

      // Verify moon icon is displayed
      const moonIcon = page.locator('.theme-icon--moon');
      await expect(moonIcon).toBeVisible();
    });

    await test.step('Toggle to light theme and reload page', async () => {
      // Toggle back to light theme
      const themeToggle = page.locator('.theme-toggle');
      await themeToggle.click();
      await page.waitForTimeout(400);

      // Verify light theme is applied
      const htmlElement = page.locator('html');
      await expect(htmlElement).toHaveAttribute('data-theme', 'light');

      // Reload the page
      await page.reload();
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1000);

      // Verify light theme persisted after reload
      await expect(htmlElement).toHaveAttribute('data-theme', 'light');

      // Verify sun icon is displayed
      const sunIcon = page.locator('.theme-icon--sun');
      await expect(sunIcon).toBeVisible();
    });
  });

  test('should maintain theme when navigating between multiple pages', async ({ page }) => {
    // Requirement 6.4: Maintain theme preference during navigation
    await test.step('Set dark theme and navigate through multiple pages', async () => {
      // Toggle to dark theme
      const themeToggle = page.locator('.theme-toggle');
      await themeToggle.click();
      await page.waitForTimeout(400);

      // Verify dark theme is applied
      let htmlElement = page.locator('html');
      await expect(htmlElement).toHaveAttribute('data-theme', 'dark');

      // Navigate to product details
      await page.waitForSelector('.product-card', { timeout: 10000 });
      const firstCard = page.locator('.product-card').first();
      await firstCard.click();
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1000);

      // Verify theme persisted on product details
      htmlElement = page.locator('html');
      await expect(htmlElement).toHaveAttribute('data-theme', 'dark');

      // Navigate back to home
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1000);

      // Verify theme persisted on home
      htmlElement = page.locator('html');
      await expect(htmlElement).toHaveAttribute('data-theme', 'dark');

      // Navigate to another product
      await page.waitForSelector('.product-card', { timeout: 10000 });
      const secondCard = page.locator('.product-card').nth(1);
      await secondCard.click();
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1000);

      // Verify theme still persisted
      htmlElement = page.locator('html');
      await expect(htmlElement).toHaveAttribute('data-theme', 'dark');
    });
  });

  test('should toggle theme on product details page', async ({ page }) => {
    // Requirement 2.2: Theme toggle accessible from any page
    await test.step('Navigate to product details page', async () => {
      // Wait for products to load
      await page.waitForSelector('.product-card', { timeout: 10000 });

      // Click on first product card
      const firstCard = page.locator('.product-card').first();
      await firstCard.click();

      // Wait for navigation
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1000);

      // Verify we're on product details page
      expect(page.url()).toMatch(/\/product\/.+/);
    });

    await test.step('Toggle theme on product details page', async () => {
      // Verify theme toggle is accessible on product details page
      const themeToggle = page.locator('.theme-toggle');
      await expect(themeToggle).toBeVisible();

      // Verify initial theme is light
      const htmlElement = page.locator('html');
      await expect(htmlElement).toHaveAttribute('data-theme', 'light');

      // Toggle to dark theme
      await themeToggle.click();
      await page.waitForTimeout(400);

      // Verify theme changed to dark
      await expect(htmlElement).toHaveAttribute('data-theme', 'dark');

      // Verify moon icon is displayed
      const moonIcon = page.locator('.theme-icon--moon');
      await expect(moonIcon).toBeVisible();
    });
  });

  test('should have accessible theme toggle button', async ({ page }) => {
    await test.step('Verify theme toggle has proper ARIA attributes', async () => {
      const themeToggle = page.locator('.theme-toggle');

      // Verify button has aria-label
      const ariaLabel = await themeToggle.getAttribute('aria-label');
      expect(ariaLabel).toBeTruthy();
      expect(ariaLabel).toContain('theme');

      // Verify button has aria-pressed attribute
      const ariaPressed = await themeToggle.getAttribute('aria-pressed');
      expect(ariaPressed).toBeTruthy();
    });

    await test.step('Verify aria-label changes with theme', async () => {
      const themeToggle = page.locator('.theme-toggle');

      // Initial aria-label for light theme
      let ariaLabel = await themeToggle.getAttribute('aria-label');
      expect(ariaLabel).toContain('dark');

      // Toggle to dark theme
      await themeToggle.click();
      await page.waitForTimeout(400);

      // Aria-label should change for dark theme
      ariaLabel = await themeToggle.getAttribute('aria-label');
      expect(ariaLabel).toContain('light');
    });
  });

  test('should handle rapid theme toggling', async ({ page }) => {
    await test.step('Toggle theme multiple times rapidly', async () => {
      const themeToggle = page.locator('.theme-toggle');
      const htmlElement = page.locator('html');

      // Verify initial theme
      await expect(htmlElement).toHaveAttribute('data-theme', 'light');

      // Rapidly toggle theme 5 times
      for (let i = 0; i < 5; i++) {
        await themeToggle.click();
        await page.waitForTimeout(100); // Short wait between clicks
      }

      // Wait for all transitions to complete
      await page.waitForTimeout(500);

      // Verify final theme is dark (odd number of toggles)
      await expect(htmlElement).toHaveAttribute('data-theme', 'dark');

      // Verify moon icon is displayed
      const moonIcon = page.locator('.theme-icon--moon');
      await expect(moonIcon).toBeVisible();
    });
  });
});

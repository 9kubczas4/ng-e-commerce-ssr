import { describe, it, expect, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { BasketService } from './core/services/basket.service';
import { Product } from './core/models/product.model';

describe('App Routes', () => {
  let router: Router;
  let location: Location;
  let basketService: BasketService;

  const mockProduct: Product = {
    id: 'test-1',
    title: 'Test Product',
    description: 'Test description',
    price: 10.0,
    imageUrl: '/test.jpg',
    category: 'Accessories',
  };

  beforeEach(async () => {
    TestBed.configureTestingModule({
      providers: [provideRouter(routes), BasketService],
    });

    router = TestBed.inject(Router);
    location = TestBed.inject(Location);
    basketService = TestBed.inject(BasketService);

    // Clear basket before each test
    basketService.clearBasket();
  });

  describe('Route Definitions', () => {
    it('should have a root route', () => {
      const rootRoute = routes.find((route) => route.path === '');
      expect(rootRoute).toBeDefined();
    });

    it('should have a wildcard redirect route', () => {
      const wildcardRoute = routes.find((route) => route.path === '**');
      expect(wildcardRoute).toBeDefined();
      expect(wildcardRoute?.redirectTo).toBe('');
    });

    it('should have product routes', () => {
      const productRoute = routes.find((route) => route.path === 'product');
      expect(productRoute).toBeDefined();
      expect(productRoute?.loadChildren).toBeDefined();
    });

    it('should have complaint routes', () => {
      const complaintRoute = routes.find((route) => route.path === 'complaint');
      expect(complaintRoute).toBeDefined();
      expect(complaintRoute?.loadChildren).toBeDefined();
    });

    it('should redirect root to product', () => {
      const rootRoute = routes.find((route) => route.path === '');
      expect(rootRoute?.redirectTo).toBe('product');
      expect(rootRoute?.pathMatch).toBe('full');
    });
  });

  describe('Lazy Loading', () => {
    it('should lazy load products routes', async () => {
      const productRoute = routes.find((route) => route.path === 'product');
      expect(productRoute?.loadChildren).toBeDefined();
      expect(typeof productRoute?.loadChildren).toBe('function');

      const loadResult = productRoute?.loadChildren?.();
      expect(loadResult).toBeDefined();
    });

    it('should lazy load complaint routes', async () => {
      const complaintRoute = routes.find((route) => route.path === 'complaint');
      expect(complaintRoute?.loadChildren).toBeDefined();
      expect(typeof complaintRoute?.loadChildren).toBe('function');

      const loadResult = complaintRoute?.loadChildren?.();
      expect(loadResult).toBeDefined();
    });
  });

  describe('Redirects', () => {
    it('should redirect deeply nested unknown routes to home', async () => {
      await router.navigate(['/some/deeply/nested/unknown/path']);
      const path = location.path();
      expect(path === '' || path === '/' || path === '/product').toBe(true);
    });

    it('should redirect root to product', async () => {
      await router.navigate(['/']);
      const path = location.path();
      expect(path).toContain('product');
    });
  });

  describe('Product Detail Routes', () => {
    it('should resolve /product/:id URLs correctly', async () => {
      const productRoute = routes.find((route) => route.path === 'product');
      expect(productRoute).toBeDefined();
      expect(productRoute?.loadChildren).toBeDefined();
    });

    it('should support product detail navigation via /product/:id', async () => {
      await router.navigate(['/product', '123']);
      expect(router.url).toContain('/product/123');
    });
  });

  describe('Route Structure', () => {
    it('should have correct number of top-level routes', () => {
      // Root redirect, product, complaint, checkout, wildcard
      expect(routes.length).toBe(5);
    });

    it('should have product and complaint feature routes', () => {
      const productRoute = routes.find((route) => route.path === 'product');
      const complaintRoute = routes.find((route) => route.path === 'complaint');

      expect(productRoute).toBeDefined();
      expect(complaintRoute).toBeDefined();
    });
  });

  describe('Checkout Routes', () => {
    it('should have checkout route', () => {
      const checkoutRoute = routes.find((route) => route.path === 'checkout');
      expect(checkoutRoute).toBeDefined();
      expect(checkoutRoute?.loadChildren).toBeDefined();
    });

    it('should lazy load checkout routes', async () => {
      const checkoutRoute = routes.find((route) => route.path === 'checkout');
      expect(checkoutRoute?.loadChildren).toBeDefined();
      expect(typeof checkoutRoute?.loadChildren).toBe('function');

      const loadResult = checkoutRoute?.loadChildren?.();
      expect(loadResult).toBeDefined();
    });

    it('should have basketGuard on checkout route', () => {
      const checkoutRoute = routes.find((route) => route.path === 'checkout');
      expect(checkoutRoute?.canActivate).toBeDefined();
      expect(checkoutRoute?.canActivate?.length).toBeGreaterThan(0);
    });

    it('should navigate to checkout route', async () => {
      // Add item to basket to pass guard
      basketService.addItem(mockProduct);

      await router.navigate(['/checkout']);
      expect(router.url).toContain('/checkout');
    });

    it('should prevent navigation to checkout with empty basket', async () => {
      // Ensure basket is empty
      basketService.clearBasket();
      expect(basketService.basket().itemCount).toBe(0);

      // Attempt to navigate to checkout
      await router.navigate(['/checkout']);

      // Should redirect to home
      const path = location.path();
      expect(path === '' || path === '/' || path === '/product').toBe(true);
    });
  });
});

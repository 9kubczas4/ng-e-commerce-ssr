import { describe, it, expect } from 'vitest';
import { PRODUCTS_ROUTES } from './products.routes';

describe('Products Routes', () => {
  describe('Route Definitions', () => {
    it('should export PRODUCTS_ROUTES constant', () => {
      expect(PRODUCTS_ROUTES).toBeDefined();
      expect(Array.isArray(PRODUCTS_ROUTES)).toBe(true);
    });

    it('should have exactly 2 routes', () => {
      expect(PRODUCTS_ROUTES.length).toBe(2);
    });

    it('should have a root route with empty path', () => {
      const rootRoute = PRODUCTS_ROUTES.find((route) => route.path === '');
      expect(rootRoute).toBeDefined();
    });

    it('should have a product detail route with :id parameter', () => {
      const detailRoute = PRODUCTS_ROUTES.find((route) => route.path === ':id');
      expect(detailRoute).toBeDefined();
    });
  });

  describe('Route Paths', () => {
    it('should contain expected paths', () => {
      const paths = PRODUCTS_ROUTES.map((route) => route.path);
      expect(paths).toContain('');
      expect(paths).toContain(':id');
    });

    it('should have root route at index 0', () => {
      expect(PRODUCTS_ROUTES[0].path).toBe('');
    });

    it('should have detail route at index 1', () => {
      expect(PRODUCTS_ROUTES[1].path).toBe(':id');
    });
  });

  describe('Lazy Loading', () => {
    it('should have loadComponent function for root route', () => {
      const rootRoute = PRODUCTS_ROUTES.find((route) => route.path === '');
      expect(rootRoute?.loadComponent).toBeDefined();
      expect(typeof rootRoute?.loadComponent).toBe('function');
    });

    it('should have loadComponent function for detail route', () => {
      const detailRoute = PRODUCTS_ROUTES.find((route) => route.path === ':id');
      expect(detailRoute?.loadComponent).toBeDefined();
      expect(typeof detailRoute?.loadComponent).toBe('function');
    });

    it('should return promise-like object from root route loadComponent', async () => {
      const rootRoute = PRODUCTS_ROUTES.find((route) => route.path === '');
      const loadResult = rootRoute?.loadComponent?.();
      expect(loadResult).toBeDefined();
      expect(loadResult).toHaveProperty('then');
      // Await the promise to prevent unhandled rejection during test cleanup
      await loadResult;
    });

    it('should return promise-like object from detail route loadComponent', async () => {
      const detailRoute = PRODUCTS_ROUTES.find((route) => route.path === ':id');
      const loadResult = detailRoute?.loadComponent?.();
      expect(loadResult).toBeDefined();
      expect(loadResult).toHaveProperty('then');
      // Await the promise to prevent unhandled rejection during test cleanup
      await loadResult;
    });
  });

  describe('Route Titles', () => {
    it('should have title for root route', () => {
      const rootRoute = PRODUCTS_ROUTES.find((route) => route.path === '');
      expect(rootRoute?.title).toBe('Angular Dev Shop - Home');
    });

    it('should have title for detail route', () => {
      const detailRoute = PRODUCTS_ROUTES.find((route) => route.path === ':id');
      expect(detailRoute?.title).toBe('Product Details - Angular Dev Shop');
    });

    it('should have all routes with titles defined', () => {
      PRODUCTS_ROUTES.forEach((route) => {
        expect(route.title).toBeDefined();
        expect(typeof route.title).toBe('string');
        expect(route.title.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Route Configuration', () => {
    it('should have all routes with loadComponent defined', () => {
      PRODUCTS_ROUTES.forEach((route) => {
        expect(route.loadComponent).toBeDefined();
        expect(typeof route.loadComponent).toBe('function');
      });
    });

    it('should not have redirectTo in any route', () => {
      PRODUCTS_ROUTES.forEach((route) => {
        expect(route.redirectTo).toBeUndefined();
      });
    });

    it('should not have children in any route', () => {
      PRODUCTS_ROUTES.forEach((route) => {
        expect(route.children).toBeUndefined();
      });
    });
  });
});

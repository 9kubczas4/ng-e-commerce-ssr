import { describe, it, expect, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';

describe('App Routes', () => {
  let router: Router;
  let location: Location;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      providers: [provideRouter(routes)],
    });

    router = TestBed.inject(Router);
    location = TestBed.inject(Location);
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

    it('should have main layout as root route', () => {
      const rootRoute = routes.find((route) => route.path === '');
      expect(rootRoute?.loadComponent).toBeDefined();
    });

    it('should have products routes as child of main layout at root path', () => {
      const rootRoute = routes.find((route) => route.path === '');
      const productsRoute = rootRoute?.children?.find((child) => child.path === '');
      expect(productsRoute).toBeDefined();
      expect(productsRoute?.loadChildren).toBeDefined();
    });

    it('should have products routes as child of main layout at product path', () => {
      const rootRoute = routes.find((route) => route.path === '');
      const productRoute = rootRoute?.children?.find((child) => child.path === 'product');
      expect(productRoute).toBeDefined();
      expect(productRoute?.loadChildren).toBeDefined();
    });
  });

  describe('Lazy Loading', () => {
    it('should lazy load MainLayoutComponent', async () => {
      const rootRoute = routes.find((route) => route.path === '');
      expect(rootRoute?.loadComponent).toBeDefined();
      expect(typeof rootRoute?.loadComponent).toBe('function');

      const loadResult = rootRoute?.loadComponent?.();
      expect(loadResult).toBeDefined();
    });

    it('should lazy load products routes at root path', async () => {
      const rootRoute = routes.find((route) => route.path === '');
      const productsRoute = rootRoute?.children?.find((child) => child.path === '');
      expect(productsRoute?.loadChildren).toBeDefined();
      expect(typeof productsRoute?.loadChildren).toBe('function');

      const loadResult = productsRoute?.loadChildren?.();
      expect(loadResult).toBeDefined();
    });

    it('should lazy load products routes at product path', async () => {
      const rootRoute = routes.find((route) => route.path === '');
      const productRoute = rootRoute?.children?.find((child) => child.path === 'product');
      expect(productRoute?.loadChildren).toBeDefined();
      expect(typeof productRoute?.loadChildren).toBe('function');

      const loadResult = productRoute?.loadChildren?.();
      expect(loadResult).toBeDefined();
    });
  });

  describe('Redirects', () => {
    it('should redirect deeply nested unknown routes to home', async () => {
      await router.navigate(['/some/deeply/nested/unknown/path']);
      const path = location.path();
      expect(path === '' || path === '/').toBe(true);
    });

    it('should not redirect valid routes', async () => {
      await router.navigate(['/']);
      const path = location.path();
      expect(path === '' || path === '/').toBe(true);
    });
  });

  describe('Product Detail Routes', () => {
    it('should resolve /product/:id URLs correctly', async () => {
      const rootRoute = routes.find((route) => route.path === '');
      const productRoute = rootRoute?.children?.find((child) => child.path === 'product');
      expect(productRoute).toBeDefined();
      expect(productRoute?.loadChildren).toBeDefined();
    });

    it('should support product detail navigation via /product/:id', async () => {
      await router.navigate(['/product', '123']);
      expect(router.url).toContain('/product/123');
    });

    it('should support product detail navigation via /:id', async () => {
      await router.navigate(['/123']);
      expect(router.url).toContain('/123');
    });
  });

  describe('Route Structure', () => {
    it('should have correct number of top-level routes', () => {
      expect(routes.length).toBe(2);
    });

    it('should have children routes under main layout', () => {
      const rootRoute = routes.find((route) => route.path === '');
      expect(rootRoute?.children).toBeDefined();
      expect(Array.isArray(rootRoute?.children)).toBe(true);
      expect(rootRoute?.children?.length).toBeGreaterThan(0);
    });

    it('should have three child routes under main layout', () => {
      const rootRoute = routes.find((route) => route.path === '');
      expect(rootRoute?.children?.length).toBe(3);
    });
  });
});

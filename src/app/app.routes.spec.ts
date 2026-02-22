import { describe, it, expect, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { Component } from '@angular/core';

// Mock components for testing
@Component({
  selector: 'app-test',
  template: '<div>Test</div>',
})
class _TestComponent {}

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

    it('should have home route as child of main layout', () => {
      const rootRoute = routes.find((route) => route.path === '');
      const homeRoute = rootRoute?.children?.find((child) => child.path === '');
      expect(homeRoute).toBeDefined();
      expect(homeRoute?.title).toBe('Angular Dev Shop - Home');
    });

    // Commented out until product details is implemented
    // it('should have product details route with id parameter', () => {
    //   const rootRoute = routes.find((route) => route.path === '');
    //   const productRoute = rootRoute?.children?.find(
    //     (child) => child.path === 'product/:id'
    //   );
    //   expect(productRoute).toBeDefined();
    //   expect(productRoute?.title).toBe('Product Details - Angular Dev Shop');
    // });
  });

  describe('Lazy Loading', () => {
    it('should lazy load MainLayoutComponent', async () => {
      const rootRoute = routes.find((route) => route.path === '');
      expect(rootRoute?.loadComponent).toBeDefined();
      expect(typeof rootRoute?.loadComponent).toBe('function');

      // Verify the lazy load function returns a promise-like object
      const loadResult = rootRoute?.loadComponent?.();
      expect(loadResult).toBeDefined();
      expect(typeof loadResult?.then).toBe('function');
    });

    it('should lazy load ProductListComponent', async () => {
      const rootRoute = routes.find((route) => route.path === '');
      const homeRoute = rootRoute?.children?.find((child) => child.path === '');
      expect(homeRoute?.loadComponent).toBeDefined();
      expect(typeof homeRoute?.loadComponent).toBe('function');

      // Verify the lazy load function returns a promise-like object
      const loadResult = homeRoute?.loadComponent?.();
      expect(loadResult).toBeDefined();
      expect(typeof loadResult?.then).toBe('function');
    });

    // Commented out until product details is implemented
    // it('should lazy load ProductDetailsPageComponent', async () => {
    //   const rootRoute = routes.find((route) => route.path === '');
    //   const productRoute = rootRoute?.children?.find(
    //     (child) => child.path === 'product/:id'
    //   );
    //   expect(productRoute?.loadComponent).toBeDefined();
    //   expect(typeof productRoute?.loadComponent).toBe('function');

    //   // Verify the lazy load function returns a promise
    //   const loadResult = productRoute?.loadComponent?.();
    //   expect(loadResult).toBeInstanceOf(Promise);
    // });
  });

  describe('Redirects', () => {
    it('should redirect unknown routes to home', async () => {
      await router.navigate(['/unknown-route']);
      const path = location.path();
      // Empty string is equivalent to root path in Angular routing
      expect(path === '' || path === '/').toBe(true);
    });

    it('should redirect deeply nested unknown routes to home', async () => {
      await router.navigate(['/some/deeply/nested/unknown/path']);
      const path = location.path();
      // Empty string is equivalent to root path in Angular routing
      expect(path === '' || path === '/').toBe(true);
    });

    it('should not redirect valid routes', async () => {
      await router.navigate(['/']);
      const path = location.path();
      // Empty string is equivalent to root path in Angular routing
      expect(path === '' || path === '/').toBe(true);
    });
  });

  describe('Route Titles', () => {
    it('should set title for home route', () => {
      const rootRoute = routes.find((route) => route.path === '');
      const homeRoute = rootRoute?.children?.find((child) => child.path === '');
      expect(homeRoute?.title).toBe('Angular Dev Shop - Home');
    });

    // Commented out until product details is implemented
    // it('should set title for product details route', () => {
    //   const rootRoute = routes.find((route) => route.path === '');
    //   const productRoute = rootRoute?.children?.find(
    //     (child) => child.path === 'product/:id'
    //   );
    //   expect(productRoute?.title).toBe('Product Details - Angular Dev Shop');
    // });
  });

  describe('Route Structure', () => {
    it('should have correct number of top-level routes', () => {
      // Root route and wildcard redirect
      expect(routes.length).toBe(2);
    });

    it('should have children routes under main layout', () => {
      const rootRoute = routes.find((route) => route.path === '');
      expect(rootRoute?.children).toBeDefined();
      expect(Array.isArray(rootRoute?.children)).toBe(true);
      expect(rootRoute?.children?.length).toBeGreaterThan(0);
    });
  });
});

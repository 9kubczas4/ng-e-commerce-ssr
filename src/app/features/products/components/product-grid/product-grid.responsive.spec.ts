import { describe, it, expect, beforeEach } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProductGridComponent } from './product-grid.component';
import { Product } from '../../models/product.model';

describe('ProductGridComponent - Responsive Behavior', () => {
  let component: ProductGridComponent;
  let fixture: ComponentFixture<ProductGridComponent>;
  let compiled: HTMLElement;

  const mockProducts: Product[] = [
    {
      id: 'test-1',
      title: 'Test Product 1',
      description: 'Test description 1',
      price: 29.99,
      imageUrl: '/test1.jpg',
      category: 'Apparel'
    },
    {
      id: 'test-2',
      title: 'Test Product 2',
      description: 'Test description 2',
      price: 19.99,
      imageUrl: '/test2.jpg',
      category: 'Accessories'
    }
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductGridComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(ProductGridComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('products', mockProducts);
    fixture.detectChanges();
    compiled = fixture.nativeElement as HTMLElement;
  });

  describe('Mobile Layout Rendering', () => {
    it('should render product grid container', () => {
      const gridContainer = compiled.querySelector('.product-grid-container');
      expect(gridContainer).toBeTruthy();
    });

    it('should render product grid with CSS grid display', () => {
      const grid = compiled.querySelector('.product-grid');
      expect(grid).toBeTruthy();

      const styles = window.getComputedStyle(grid as Element);
      expect(styles.display).toBe('grid');
    });

    it('should have grid gap defined', () => {
      const grid = compiled.querySelector('.product-grid') as Element;
      const styles = window.getComputedStyle(grid);

      // Gap should be defined (either 1rem or 1.5rem depending on viewport)
      expect(styles.gap).toBeTruthy();
    });

    it('should render all product cards in the grid', () => {
      const productCards = compiled.querySelectorAll('app-product-card');
      expect(productCards.length).toBe(mockProducts.length);
    });

    it('should apply grid-template-columns style', () => {
      const grid = compiled.querySelector('.product-grid') as Element;
      const styles = window.getComputedStyle(grid);

      // Should have grid-template-columns defined
      expect(styles.gridTemplateColumns).toBeTruthy();
    });
  });

  describe('Empty State Responsive Rendering', () => {
    beforeEach(() => {
      fixture.componentRef.setInput('searchQuery', 'nonexistent');
      fixture.detectChanges();
      compiled = fixture.nativeElement as HTMLElement;
    });

    it('should render empty state when no products match', () => {
      const emptyState = compiled.querySelector('.empty-state');
      expect(emptyState).toBeTruthy();
    });

    it('should have centered text in empty state', () => {
      const emptyState = compiled.querySelector('.empty-state') as Element;
      const styles = window.getComputedStyle(emptyState);

      expect(styles.textAlign).toBe('center');
    });

    it('should have padding in empty state', () => {
      const emptyState = compiled.querySelector('.empty-state') as Element;
      const styles = window.getComputedStyle(emptyState);

      // Should have padding defined
      expect(styles.padding).toBeTruthy();
    });
  });

  describe('Grid Layout Structure', () => {
    it('should use CSS Grid layout system', () => {
      const grid = compiled.querySelector('.product-grid') as Element;
      const styles = window.getComputedStyle(grid);

      expect(styles.display).toBe('grid');
    });

    it('should have defined gap between grid items', () => {
      const grid = compiled.querySelector('.product-grid') as Element;
      const styles = window.getComputedStyle(grid);

      // Gap should be a non-empty string
      expect(styles.gap).not.toBe('');
      expect(styles.gap).not.toBe('0px');
    });

    it('should render product cards as direct children of grid', () => {
      const grid = compiled.querySelector('.product-grid');
      const directChildren = grid?.children;

      expect(directChildren).toBeTruthy();
      expect(directChildren!.length).toBeGreaterThan(0);
    });
  });

  describe('Responsive Container', () => {
    it('should have full width container', () => {
      const container = compiled.querySelector('.product-grid-container') as Element;
      const styles = window.getComputedStyle(container);

      expect(styles.width).toBeTruthy();
    });

    it('should maintain grid structure with different product counts', () => {
      const singleProduct: Product[] = [mockProducts[0]];
      fixture.componentRef.setInput('products', singleProduct);
      fixture.detectChanges();

      const grid = compiled.querySelector('.product-grid');
      expect(grid).toBeTruthy();

      const productCards = compiled.querySelectorAll('app-product-card');
      expect(productCards.length).toBe(1);
    });

    it('should maintain grid structure with many products', () => {
      const manyProducts: Product[] = Array.from({ length: 12 }, (_, i) => ({
        id: `product-${i}`,
        title: `Product ${i}`,
        description: `Description ${i}`,
        price: 10 + i,
        imageUrl: `/product${i}.jpg`,
        category: i % 2 === 0 ? 'Apparel' : 'Accessories'
      }));

      fixture.componentRef.setInput('products', manyProducts);
      fixture.detectChanges();

      const grid = compiled.querySelector('.product-grid');
      expect(grid).toBeTruthy();

      const productCards = compiled.querySelectorAll('app-product-card');
      expect(productCards.length).toBe(12);
    });
  });
});

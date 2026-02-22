import { describe, it, expect, beforeEach } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProductCardComponent } from './product-card.component';
import { Product } from '../../models/product.model';

describe('ProductCardComponent - Responsive Behavior', () => {
  let component: ProductCardComponent;
  let fixture: ComponentFixture<ProductCardComponent>;
  let compiled: HTMLElement;

  const mockProduct: Product = {
    id: 'test-1',
    title: 'Angular T-Shirt',
    description: 'Premium cotton t-shirt with Angular logo',
    price: 29.99,
    discount: 10,
    imageUrl: '/test.jpg',
    category: 'Apparel'
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductCardComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(ProductCardComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('product', mockProduct);
    fixture.detectChanges();
    compiled = fixture.nativeElement as HTMLElement;
  });

  describe('Touch-Friendly Element Sizes', () => {
    it('should render add to basket button as proper button element', () => {
      const button = compiled.querySelector('.add-to-basket-btn') as HTMLElement;
      expect(button).toBeTruthy();
      expect(button.tagName).toBe('BUTTON');
    });

    it('should have button with CSS class for styling', () => {
      const button = compiled.querySelector('.add-to-basket-btn') as HTMLElement;

      // Button should exist and have the proper class
      expect(button).toBeTruthy();
      expect(button.classList.contains('add-to-basket-btn')).toBe(true);
    });

    it('should have clickable card area', () => {
      const card = compiled.querySelector('.product-card') as HTMLElement;
      expect(card).toBeTruthy();

      // Card should have cursor pointer for clickability
      const styles = window.getComputedStyle(card);
      expect(styles.cursor).toBe('pointer');
    });

    it('should have adequate padding for touch interaction', () => {
      const button = compiled.querySelector('.add-to-basket-btn') as HTMLElement;
      const styles = window.getComputedStyle(button);

      // Button should have padding
      expect(styles.padding).toBeTruthy();
      expect(styles.padding).not.toBe('0px');
    });
  });

  describe('Mobile Layout Structure', () => {
    it('should render product card with flex layout', () => {
      const card = compiled.querySelector('.product-card') as HTMLElement;
      const styles = window.getComputedStyle(card);

      expect(styles.display).toBe('flex');
      expect(styles.flexDirection).toBe('column');
    });

    it('should render product image container', () => {
      const imageContainer = compiled.querySelector('.product-image');
      expect(imageContainer).toBeTruthy();
    });

    it('should render product content section', () => {
      const content = compiled.querySelector('.product-content');
      expect(content).toBeTruthy();
    });

    it('should render product title', () => {
      const title = compiled.querySelector('.product-title');
      expect(title).toBeTruthy();
      expect(title?.textContent).toContain(mockProduct.title);
    });

    it('should render product description', () => {
      const description = compiled.querySelector('.product-description');
      expect(description).toBeTruthy();
      expect(description?.textContent).toContain(mockProduct.description);
    });

    it('should render product footer with pricing and button', () => {
      const footer = compiled.querySelector('.product-footer');
      expect(footer).toBeTruthy();
    });

    it('should have flex layout for footer', () => {
      const footer = compiled.querySelector('.product-footer') as HTMLElement;
      const styles = window.getComputedStyle(footer);

      expect(styles.display).toBe('flex');
    });
  });

  describe('Responsive Typography', () => {
    it('should render title element with content', () => {
      const title = compiled.querySelector('.product-title') as HTMLElement;

      expect(title).toBeTruthy();
      expect(title.textContent).toContain(mockProduct.title);
    });

    it('should render description element with content', () => {
      const description = compiled.querySelector('.product-description') as HTMLElement;

      expect(description).toBeTruthy();
      expect(description.textContent).toContain(mockProduct.description);
    });

    it('should render price element', () => {
      const price = compiled.querySelector('.discounted-price, .price') as HTMLElement;

      expect(price).toBeTruthy();
    });

    it('should truncate long descriptions', () => {
      const description = compiled.querySelector('.product-description') as HTMLElement;
      const styles = window.getComputedStyle(description);

      // Should use line-clamp for truncation
      expect(styles.display).toBe('-webkit-box');
      expect(styles.overflow).toBe('hidden');
    });
  });

  describe('Discount Badge Rendering', () => {
    it('should render discount badge when product has discount', () => {
      const badge = compiled.querySelector('.discount-badge');
      expect(badge).toBeTruthy();
      expect(badge?.textContent).toContain('10%');
    });

    it('should position discount badge absolutely', () => {
      const badge = compiled.querySelector('.discount-badge') as HTMLElement;
      const styles = window.getComputedStyle(badge);

      expect(styles.position).toBe('absolute');
    });

    it('should not render discount badge when product has no discount', () => {
      const productWithoutDiscount: Product = {
        ...mockProduct,
        discount: undefined
      };

      fixture.componentRef.setInput('product', productWithoutDiscount);
      fixture.detectChanges();

      const badge = compiled.querySelector('.discount-badge');
      expect(badge).toBeFalsy();
    });
  });

  describe('Responsive Image Handling', () => {
    it('should render product image container with proper structure', () => {
      const imageContainer = compiled.querySelector('.product-image') as HTMLElement;
      const styles = window.getComputedStyle(imageContainer);

      expect(styles.position).toBe('relative');
      expect(styles.width).toBeTruthy();
    });

    it('should render image element', () => {
      const image = compiled.querySelector('.product-image img');
      expect(image).toBeTruthy();
    });

    it('should have image with object-fit cover', () => {
      const image = compiled.querySelector('.product-image img') as HTMLElement;
      const styles = window.getComputedStyle(image);

      expect(styles.objectFit).toBe('cover');
    });

    it('should render image within container', () => {
      const image = compiled.querySelector('.product-image img') as HTMLElement;

      // Image should exist within the container
      expect(image).toBeTruthy();
      expect(image.parentElement?.classList.contains('product-image')).toBe(true);
    });
  });

  describe('Interactive States', () => {
    it('should have card element for product display', () => {
      const card = compiled.querySelector('.product-card') as HTMLElement;

      // Card should exist as the main container
      expect(card).toBeTruthy();
      expect(card.classList.contains('product-card')).toBe(true);
    });

    it('should have button with proper cursor', () => {
      const button = compiled.querySelector('.add-to-basket-btn') as HTMLElement;
      const styles = window.getComputedStyle(button);

      expect(styles.cursor).toBe('pointer');
    });

    it('should have transition effects defined', () => {
      const card = compiled.querySelector('.product-card') as HTMLElement;
      const styles = window.getComputedStyle(card);

      // Should have transition for smooth interactions
      expect(styles.transition).toBeTruthy();
    });
  });

  describe('Pricing Display', () => {
    it('should show discounted price when discount exists', () => {
      const discountedPrice = compiled.querySelector('.discounted-price');
      expect(discountedPrice).toBeTruthy();
    });

    it('should show original price with strikethrough when discount exists', () => {
      const originalPrice = compiled.querySelector('.original-price');
      expect(originalPrice).toBeTruthy();

      const styles = window.getComputedStyle(originalPrice as Element);
      expect(styles.textDecoration).toContain('line-through');
    });

    it('should calculate correct discounted price', () => {
      const discountedPrice = compiled.querySelector('.discounted-price');
      const expectedPrice = (mockProduct.price * (1 - mockProduct.discount! / 100)).toFixed(2);

      expect(discountedPrice?.textContent).toContain(expectedPrice);
    });

    it('should show regular price when no discount', () => {
      const productWithoutDiscount: Product = {
        ...mockProduct,
        discount: undefined
      };

      fixture.componentRef.setInput('product', productWithoutDiscount);
      fixture.detectChanges();

      const price = compiled.querySelector('.price');
      expect(price).toBeTruthy();
      expect(price?.textContent).toContain(mockProduct.price.toFixed(2));
    });
  });
});

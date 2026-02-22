import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProductCardComponent } from './product-card.component';
import { Product } from '../../../../models/product.model';
import { PLATFORM_ID } from '@angular/core';

describe('ProductCardComponent', () => {
  let component: ProductCardComponent;
  let fixture: ComponentFixture<ProductCardComponent>;

  const mockProductWithDiscount: Product = {
    id: 'test-001',
    title: 'Test Product',
    description: 'Test description for the product',
    price: 100,
    discount: 20,
    imageUrl: '/assets/test.jpg',
    category: 'Apparel'
  };

  const mockProductWithoutDiscount: Product = {
    id: 'test-002',
    title: 'Test Product 2',
    description: 'Another test description',
    price: 50,
    imageUrl: '/assets/test2.jpg',
    category: 'Accessories'
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductCardComponent],
      providers: [
        { provide: PLATFORM_ID, useValue: 'browser' }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProductCardComponent);
    component = fixture.componentInstance;
  });

  describe('Component Logic', () => {
    it('should create component instance', () => {
      fixture.componentRef.setInput('product', mockProductWithDiscount);
      fixture.detectChanges();

      expect(component).toBeTruthy();
    });
  });

  describe('Event Emissions', () => {
    it('should emit addToBasket event with product when onAddToBasket is called', () => {
      fixture.componentRef.setInput('product', mockProductWithDiscount);
      fixture.detectChanges();

      let emittedProduct: Product | undefined;
      component.addToBasket.subscribe((product: Product) => {
        emittedProduct = product;
      });

      const mockEvent = new Event('click');
      vi.spyOn(mockEvent, 'stopPropagation');

      component.onAddToBasket(mockEvent);

      expect(mockEvent.stopPropagation).toHaveBeenCalled();
      expect(emittedProduct).toEqual(mockProductWithDiscount);
    });

    it('should emit cardClick event with product id when onCardClick is called', () => {
      fixture.componentRef.setInput('product', mockProductWithDiscount);
      fixture.detectChanges();

      let emittedId: string | undefined;
      component.cardClick.subscribe((id: string) => {
        emittedId = id;
      });

      component.onCardClick();

      expect(emittedId).toBe('test-001');
    });

    it('should stop event propagation when add to basket button is clicked', () => {
      fixture.componentRef.setInput('product', mockProductWithDiscount);
      fixture.detectChanges();

      const mockEvent = new Event('click');
      vi.spyOn(mockEvent, 'stopPropagation');

      component.onAddToBasket(mockEvent);

      expect(mockEvent.stopPropagation).toHaveBeenCalled();
    });
  });

  describe('Computed Values', () => {
    describe('discountedPrice', () => {
      it('should calculate discounted price correctly when discount is present', () => {
        fixture.componentRef.setInput('product', mockProductWithDiscount);
        fixture.detectChanges();

        const expectedPrice = 100 * (1 - 20 / 100); // 80
        expect(component.discountedPrice()).toBe(expectedPrice);
      });

      it('should return original price when no discount is present', () => {
        fixture.componentRef.setInput('product', mockProductWithoutDiscount);
        fixture.detectChanges();

        expect(component.discountedPrice()).toBe(50);
      });

      it('should handle 0% discount', () => {
        const productWithZeroDiscount: Product = {
          ...mockProductWithoutDiscount,
          discount: 0
        };
        fixture.componentRef.setInput('product', productWithZeroDiscount);
        fixture.detectChanges();

        expect(component.discountedPrice()).toBe(50);
      });

      it('should handle 100% discount', () => {
        const productWithFullDiscount: Product = {
          ...mockProductWithDiscount,
          discount: 100
        };
        fixture.componentRef.setInput('product', productWithFullDiscount);
        fixture.detectChanges();

        expect(component.discountedPrice()).toBe(0);
      });

      it('should recalculate when product input changes', () => {
        fixture.componentRef.setInput('product', mockProductWithDiscount);
        fixture.detectChanges();

        expect(component.discountedPrice()).toBe(80);

        fixture.componentRef.setInput('product', mockProductWithoutDiscount);
        fixture.detectChanges();

        expect(component.discountedPrice()).toBe(50);
      });
    });

    describe('hasDiscount', () => {
      it('should return true when product has a discount', () => {
        fixture.componentRef.setInput('product', mockProductWithDiscount);
        fixture.detectChanges();

        expect(component.hasDiscount()).toBe(true);
      });

      it('should return false when product has no discount', () => {
        fixture.componentRef.setInput('product', mockProductWithoutDiscount);
        fixture.detectChanges();

        expect(component.hasDiscount()).toBe(false);
      });

      it('should return false when discount is 0', () => {
        const productWithZeroDiscount: Product = {
          ...mockProductWithDiscount,
          discount: 0
        };
        fixture.componentRef.setInput('product', productWithZeroDiscount);
        fixture.detectChanges();

        expect(component.hasDiscount()).toBe(false);
      });

      it('should return false when discount is undefined', () => {
        const productWithUndefinedDiscount: Product = {
          ...mockProductWithDiscount,
          discount: undefined
        };
        fixture.componentRef.setInput('product', productWithUndefinedDiscount);
        fixture.detectChanges();

        expect(component.hasDiscount()).toBe(false);
      });
    });
  });
});

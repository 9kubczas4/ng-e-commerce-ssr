import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router, convertToParamMap } from '@angular/router';
import { signal } from '@angular/core';
import { ProductDetailsPageComponent } from './product-details-page.component';
import { ProductService } from '@features/products/services/product.service';
import { BasketService } from '@core/services/basket.service';
import { Product } from '@core/models/product.model';

describe('ProductDetailsPageComponent', () => {
  let component: ProductDetailsPageComponent;
  let fixture: ComponentFixture<ProductDetailsPageComponent>;
  let mockProductService: any;
  let mockBasketService: any;
  let mockRouter: any;
  let mockActivatedRoute: any;

  const mockProduct: Product = {
    id: 'ng-tshirt-001',
    title: 'Angular Logo T-Shirt',
    description: 'Premium cotton t-shirt with the iconic Angular logo. Comfortable fit for coding marathons.',
    price: 29.99,
    discount: 10,
    imageUrl: '/assets/products/angular-tshirt.jpg',
    category: 'Apparel'
  };

  const mockProductNoDiscount: Product = {
    id: 'ng-mug-001',
    title: 'Angular Developer Mug',
    description: 'Start your day with coffee in this ceramic mug featuring Angular branding.',
    price: 14.99,
    imageUrl: '/assets/products/angular-mug.jpg',
    category: 'Accessories'
  };

  beforeEach(async () => {
    mockProductService = {
      products: signal([mockProduct, mockProductNoDiscount]),
      getProductById: vi.fn(),
      loadProducts: vi.fn()
    };

    mockBasketService = {
      addItem: vi.fn(),
      basket: signal({ items: [], totalPrice: 0, itemCount: 0 })
    };

    mockRouter = {
      navigate: vi.fn()
    };

    mockActivatedRoute = {
      snapshot: {
        paramMap: convertToParamMap({ id: 'ng-tshirt-001' })
      }
    };

    await TestBed.configureTestingModule({
      imports: [ProductDetailsPageComponent],
      providers: [
        { provide: ProductService, useValue: mockProductService },
        { provide: BasketService, useValue: mockBasketService },
        { provide: Router, useValue: mockRouter },
        { provide: ActivatedRoute, useValue: mockActivatedRoute }
      ]
    }).compileComponents();
  });

  describe('Product Loading', () => {
    it('should create', () => {
      mockProductService.getProductById.mockReturnValue(mockProduct);
      fixture = TestBed.createComponent(ProductDetailsPageComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();

      expect(component).toBeTruthy();
    });

    it('should load products if products array is empty on init', () => {
      mockProductService.products = signal([]);
      mockProductService.getProductById.mockReturnValue(mockProduct);

      fixture = TestBed.createComponent(ProductDetailsPageComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();

      expect(mockProductService.loadProducts).toHaveBeenCalled();
    });

    it('should not load products if products array is not empty on init', () => {
      mockProductService.products = signal([mockProduct, mockProductNoDiscount]);
      mockProductService.getProductById.mockReturnValue(mockProduct);

      fixture = TestBed.createComponent(ProductDetailsPageComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();

      expect(mockProductService.loadProducts).not.toHaveBeenCalled();
    });

    it('should load product by ID from route params', () => {
      mockProductService.getProductById.mockReturnValue(mockProduct);
      fixture = TestBed.createComponent(ProductDetailsPageComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();

      expect(mockProductService.getProductById).toHaveBeenCalledWith('ng-tshirt-001');
      expect(component.product()).toEqual(mockProduct);
    });

    it('should load product with different ID', () => {
      mockActivatedRoute.snapshot.paramMap = convertToParamMap({ id: 'ng-mug-001' });
      mockProductService.getProductById.mockReturnValue(mockProductNoDiscount);

      fixture = TestBed.createComponent(ProductDetailsPageComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();

      expect(mockProductService.getProductById).toHaveBeenCalledWith('ng-mug-001');
      expect(component.product()).toEqual(mockProductNoDiscount);
    });

    it('should compute product from route params using computed signal', () => {
      mockProductService.getProductById.mockReturnValue(mockProduct);
      fixture = TestBed.createComponent(ProductDetailsPageComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();

      const product = component.product();
      expect(product).toBeDefined();
      expect(product?.id).toBe('ng-tshirt-001');
      expect(product?.title).toBe('Angular Logo T-Shirt');
    });

    it('should return undefined when product ID is not in route', () => {
      mockActivatedRoute.snapshot.paramMap = convertToParamMap({});
      mockProductService.getProductById.mockReturnValue(undefined);

      fixture = TestBed.createComponent(ProductDetailsPageComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();

      expect(component.product()).toBeUndefined();
    });

    it('should calculate discounted price correctly for product with discount', () => {
      mockProductService.getProductById.mockReturnValue(mockProduct);
      fixture = TestBed.createComponent(ProductDetailsPageComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();

      const discountedPrice = component.discountedPrice();
      const expectedPrice = 29.99 * (1 - 10 / 100); // 26.991
      expect(discountedPrice).toBeCloseTo(expectedPrice, 2);
    });

    it('should return original price when product has no discount', () => {
      mockActivatedRoute.snapshot.paramMap = convertToParamMap({ id: 'ng-mug-001' });
      mockProductService.getProductById.mockReturnValue(mockProductNoDiscount);

      fixture = TestBed.createComponent(ProductDetailsPageComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();

      const discountedPrice = component.discountedPrice();
      expect(discountedPrice).toBe(14.99);
    });

    it('should correctly identify product with discount', () => {
      mockProductService.getProductById.mockReturnValue(mockProduct);
      fixture = TestBed.createComponent(ProductDetailsPageComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();

      expect(component.hasDiscount()).toBe(true);
    });

    it('should correctly identify product without discount', () => {
      mockActivatedRoute.snapshot.paramMap = convertToParamMap({ id: 'ng-mug-001' });
      mockProductService.getProductById.mockReturnValue(mockProductNoDiscount);

      fixture = TestBed.createComponent(ProductDetailsPageComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();

      expect(component.hasDiscount()).toBe(false);
    });
  });

  describe('Invalid ID Handling', () => {
    it('should redirect to home when product ID is missing from route', () => {
      mockActivatedRoute.snapshot.paramMap = convertToParamMap({});
      mockProductService.getProductById.mockReturnValue(undefined);

      fixture = TestBed.createComponent(ProductDetailsPageComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();

      expect(mockRouter.navigate).toHaveBeenCalledWith(['/']);
    });

    it('should redirect to home when product is not found', () => {
      mockActivatedRoute.snapshot.paramMap = convertToParamMap({ id: 'invalid-id' });
      mockProductService.getProductById.mockReturnValue(undefined);

      fixture = TestBed.createComponent(ProductDetailsPageComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();

      expect(mockProductService.getProductById).toHaveBeenCalledWith('invalid-id');
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/']);
    });

    it('should not redirect when valid product is found', () => {
      mockProductService.getProductById.mockReturnValue(mockProduct);

      fixture = TestBed.createComponent(ProductDetailsPageComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();

      expect(mockRouter.navigate).not.toHaveBeenCalled();
    });

    it('should handle multiple invalid product IDs', () => {
      const invalidIds = ['invalid-1', 'invalid-2', 'non-existent'];

      invalidIds.forEach((id) => {
        mockActivatedRoute.snapshot.paramMap = convertToParamMap({ id });
        mockProductService.getProductById.mockReturnValue(undefined);
        mockRouter.navigate.mockClear();

        fixture = TestBed.createComponent(ProductDetailsPageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();

        expect(mockRouter.navigate).toHaveBeenCalledWith(['/']);
        fixture.destroy();
      });
    });

    it('should return 0 for discounted price when product is undefined', () => {
      mockActivatedRoute.snapshot.paramMap = convertToParamMap({ id: 'invalid-id' });
      mockProductService.getProductById.mockReturnValue(undefined);

      fixture = TestBed.createComponent(ProductDetailsPageComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();

      expect(component.discountedPrice()).toBe(0);
    });

    it('should return false for hasDiscount when product is undefined', () => {
      mockActivatedRoute.snapshot.paramMap = convertToParamMap({ id: 'invalid-id' });
      mockProductService.getProductById.mockReturnValue(undefined);

      fixture = TestBed.createComponent(ProductDetailsPageComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();

      expect(component.hasDiscount()).toBe(false);
    });
  });

  describe('Add to Basket Functionality', () => {
    beforeEach(() => {
      mockProductService.getProductById.mockReturnValue(mockProduct);
      fixture = TestBed.createComponent(ProductDetailsPageComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    });

    it('should call basketService.addItem when addToBasket is called', () => {
      component.addToBasket();

      expect(mockBasketService.addItem).toHaveBeenCalledWith(mockProduct);
      expect(mockBasketService.addItem).toHaveBeenCalledTimes(1);
    });

    it('should add correct product to basket', () => {
      component.addToBasket();

      const calledWith = mockBasketService.addItem.mock.calls[0][0];
      expect(calledWith.id).toBe('ng-tshirt-001');
      expect(calledWith.title).toBe('Angular Logo T-Shirt');
      expect(calledWith.price).toBe(29.99);
    });

    it('should handle multiple add to basket calls', () => {
      component.addToBasket();
      component.addToBasket();
      component.addToBasket();

      expect(mockBasketService.addItem).toHaveBeenCalledTimes(3);
      expect(mockBasketService.addItem).toHaveBeenCalledWith(mockProduct);
    });

    it('should not call basketService.addItem when product is undefined', () => {
      mockActivatedRoute.snapshot.paramMap = convertToParamMap({ id: 'invalid-id' });
      mockProductService.getProductById.mockReturnValue(undefined);

      const newFixture = TestBed.createComponent(ProductDetailsPageComponent);
      const newComponent = newFixture.componentInstance;
      newFixture.detectChanges();

      mockBasketService.addItem.mockClear();
      newComponent.addToBasket();

      expect(mockBasketService.addItem).not.toHaveBeenCalled();
      newFixture.destroy();
    });

    it('should add product with discount information intact', () => {
      component.addToBasket();

      const calledWith = mockBasketService.addItem.mock.calls[0][0];
      expect(calledWith.discount).toBe(10);
    });

    it('should add product without discount correctly', () => {
      mockActivatedRoute.snapshot.paramMap = convertToParamMap({ id: 'ng-mug-001' });
      mockProductService.getProductById.mockReturnValue(mockProductNoDiscount);

      const newFixture = TestBed.createComponent(ProductDetailsPageComponent);
      const newComponent = newFixture.componentInstance;
      newFixture.detectChanges();

      newComponent.addToBasket();

      expect(mockBasketService.addItem).toHaveBeenCalledWith(mockProductNoDiscount);
      const calledWith = mockBasketService.addItem.mock.calls[0][0];
      expect(calledWith.discount).toBeUndefined();
      newFixture.destroy();
    });
  });

  describe('Navigation', () => {
    beforeEach(() => {
      mockProductService.getProductById.mockReturnValue(mockProduct);
      fixture = TestBed.createComponent(ProductDetailsPageComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
      mockRouter.navigate.mockClear();
    });

    it('should navigate back to home when goBack is called', () => {
      component.goBack();

      expect(mockRouter.navigate).toHaveBeenCalledWith(['/']);
      expect(mockRouter.navigate).toHaveBeenCalledTimes(1);
    });

    it('should handle multiple goBack calls', () => {
      component.goBack();
      component.goBack();

      expect(mockRouter.navigate).toHaveBeenCalledTimes(2);
      expect(mockRouter.navigate).toHaveBeenNthCalledWith(1, ['/']);
      expect(mockRouter.navigate).toHaveBeenNthCalledWith(2, ['/']);
    });
  });

  describe('Component Integration', () => {
    it('should maintain product state after adding to basket', () => {
      mockProductService.getProductById.mockReturnValue(mockProduct);
      fixture = TestBed.createComponent(ProductDetailsPageComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();

      const productBefore = component.product();
      component.addToBasket();
      const productAfter = component.product();

      expect(productAfter).toEqual(productBefore);
      expect(productAfter?.id).toBe('ng-tshirt-001');
    });

    it('should maintain computed values after adding to basket', () => {
      mockProductService.getProductById.mockReturnValue(mockProduct);
      fixture = TestBed.createComponent(ProductDetailsPageComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();

      const priceBefore = component.discountedPrice();
      const hasDiscountBefore = component.hasDiscount();

      component.addToBasket();

      const priceAfter = component.discountedPrice();
      const hasDiscountAfter = component.hasDiscount();

      expect(priceAfter).toBe(priceBefore);
      expect(hasDiscountAfter).toBe(hasDiscountBefore);
    });

    it('should handle complete user flow: load product -> add to basket -> go back', () => {
      mockProductService.getProductById.mockReturnValue(mockProduct);
      fixture = TestBed.createComponent(ProductDetailsPageComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();

      // Verify product loaded
      expect(component.product()).toEqual(mockProduct);
      expect(mockProductService.getProductById).toHaveBeenCalledWith('ng-tshirt-001');

      // Add to basket
      component.addToBasket();
      expect(mockBasketService.addItem).toHaveBeenCalledWith(mockProduct);

      // Navigate back
      component.goBack();
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/']);
    });
  });

  describe('Edge Cases', () => {
    it('should handle product with 0% discount', () => {
      const productZeroDiscount: Product = {
        ...mockProduct,
        discount: 0
      };
      mockProductService.getProductById.mockReturnValue(productZeroDiscount);

      fixture = TestBed.createComponent(ProductDetailsPageComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();

      expect(component.hasDiscount()).toBe(false);
      expect(component.discountedPrice()).toBe(productZeroDiscount.price);
    });

    it('should handle product with 100% discount', () => {
      const productFullDiscount: Product = {
        ...mockProduct,
        discount: 100
      };
      mockProductService.getProductById.mockReturnValue(productFullDiscount);

      fixture = TestBed.createComponent(ProductDetailsPageComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();

      expect(component.hasDiscount()).toBe(true);
      expect(component.discountedPrice()).toBe(0);
    });

    it('should handle product with very high price', () => {
      const expensiveProduct: Product = {
        ...mockProduct,
        price: 9999.99,
        discount: 25
      };
      mockProductService.getProductById.mockReturnValue(expensiveProduct);

      fixture = TestBed.createComponent(ProductDetailsPageComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();

      const expectedPrice = 9999.99 * 0.75;
      expect(component.discountedPrice()).toBeCloseTo(expectedPrice, 2);
    });

    it('should handle product with very low price', () => {
      const cheapProduct: Product = {
        ...mockProduct,
        price: 0.99,
        discount: 10
      };
      mockProductService.getProductById.mockReturnValue(cheapProduct);

      fixture = TestBed.createComponent(ProductDetailsPageComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();

      const expectedPrice = 0.99 * 0.9;
      expect(component.discountedPrice()).toBeCloseTo(expectedPrice, 2);
    });

    it('should handle empty product ID string', () => {
      mockActivatedRoute.snapshot.paramMap = convertToParamMap({ id: '' });
      mockProductService.getProductById.mockReturnValue(undefined);

      fixture = TestBed.createComponent(ProductDetailsPageComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();

      expect(mockRouter.navigate).toHaveBeenCalledWith(['/']);
    });

    it('should handle product ID with special characters', () => {
      const specialId = 'ng-product-@#$-001';
      mockActivatedRoute.snapshot.paramMap = convertToParamMap({ id: specialId });
      mockProductService.getProductById.mockReturnValue(mockProduct);

      fixture = TestBed.createComponent(ProductDetailsPageComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();

      expect(mockProductService.getProductById).toHaveBeenCalledWith(specialId);
    });
  });
});

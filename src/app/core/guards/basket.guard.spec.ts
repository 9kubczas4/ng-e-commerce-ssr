import { TestBed } from '@angular/core/testing';
import { Router, UrlTree } from '@angular/router';
import { basketGuard } from './basket.guard';
import { BasketService } from '../services/basket.service';
import { Product } from '../models/product.model';

describe('basketGuard', () => {
  let basketService: BasketService;
  let router: Router;

  const mockProduct: Product = {
    id: 'test-1',
    title: 'Test Product',
    description: 'Test description',
    price: 10.00,
    imageUrl: '/test.jpg',
    category: 'Accessories'
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        BasketService,
        {
          provide: Router,
          useValue: {
            createUrlTree: vi.fn((commands: string[]) => {
              return { toString: () => commands.join('/') } as UrlTree;
            })
          }
        }
      ]
    });

    basketService = TestBed.inject(BasketService);
    router = TestBed.inject(Router);

    // Clear basket before each test
    basketService.clearBasket();
    localStorage.clear();
  });

  it('should allow navigation when basket has items', () => {
    // Add item to basket
    basketService.addItem(mockProduct);

    // Execute guard
    const result = TestBed.runInInjectionContext(() => basketGuard({} as any, {} as any));

    // Should return true to allow navigation
    expect(result).toBe(true);
  });

  it('should redirect to home when basket is empty', () => {
    // Ensure basket is empty
    expect(basketService.basket().itemCount).toBe(0);

    // Execute guard
    const result = TestBed.runInInjectionContext(() => basketGuard({} as any, {} as any));

    // Should return UrlTree for redirect
    expect(result).not.toBe(true);
    expect(router.createUrlTree).toHaveBeenCalledWith(['/']);
  });

  it('should redirect when basket becomes empty after items are removed', () => {
    // Add and then remove item
    basketService.addItem(mockProduct);
    basketService.removeItem(mockProduct.id);

    // Verify basket is empty
    expect(basketService.basket().itemCount).toBe(0);

    // Execute guard
    const result = TestBed.runInInjectionContext(() => basketGuard({} as any, {} as any));

    // Should redirect to home
    expect(result).not.toBe(true);
    expect(router.createUrlTree).toHaveBeenCalledWith(['/']);
  });

  it('should allow navigation when basket has multiple items', () => {
    const mockProduct2: Product = {
      id: 'test-2',
      title: 'Test Product 2',
      description: 'Test description 2',
      price: 20.00,
      imageUrl: '/test2.jpg',
      category: 'Apparel'
    };

    // Add multiple items
    basketService.addItem(mockProduct);
    basketService.addItem(mockProduct2);

    // Execute guard
    const result = TestBed.runInInjectionContext(() => basketGuard({} as any, {} as any));

    // Should allow navigation
    expect(result).toBe(true);
  });

  it('should allow navigation when basket has item with quantity > 1', () => {
    // Add item and increase quantity
    basketService.addItem(mockProduct);
    basketService.updateQuantity(mockProduct.id, 3);

    // Verify item count
    expect(basketService.basket().itemCount).toBe(3);

    // Execute guard
    const result = TestBed.runInInjectionContext(() => basketGuard({} as any, {} as any));

    // Should allow navigation
    expect(result).toBe(true);
  });
});

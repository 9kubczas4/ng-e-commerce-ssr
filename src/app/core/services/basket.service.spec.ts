import { TestBed } from '@angular/core/testing';
import { PLATFORM_ID } from '@angular/core';
import { BasketService } from './basket.service';
import { Product } from '../models/product.model';

describe('BasketService', () => {
  let service: BasketService;

  const mockProduct1: Product = {
    id: 'test-1',
    title: 'Test Product 1',
    description: 'Test description',
    price: 10.00,
    imageUrl: '/test.jpg',
    category: 'Accessories'
  };

  const mockProduct2: Product = {
    id: 'test-2',
    title: 'Test Product 2',
    description: 'Test description 2',
    price: 20.00,
    discount: 10,
    imageUrl: '/test2.jpg',
    category: 'Apparel'
  };

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BasketService);

    // Clear localStorage before each test
    localStorage.clear();

    // Clear basket
    service.clearBasket();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should start with empty basket', () => {
    const basket = service.basket();
    expect(basket.items).toEqual([]);
    expect(basket.totalPrice).toBe(0);
    expect(basket.itemCount).toBe(0);
  });

  describe('addItem', () => {
    it('should add a new product to basket', () => {
      service.addItem(mockProduct1);

      const basket = service.basket();
      expect(basket.items.length).toBe(1);
      expect(basket.items[0].product.id).toBe('test-1');
      expect(basket.items[0].quantity).toBe(1);
      expect(basket.itemCount).toBe(1);
      expect(basket.totalPrice).toBe(10.00);
    });

    it('should increment quantity when adding existing product', () => {
      service.addItem(mockProduct1);
      service.addItem(mockProduct1);

      const basket = service.basket();
      expect(basket.items.length).toBe(1);
      expect(basket.items[0].quantity).toBe(2);
      expect(basket.itemCount).toBe(2);
      expect(basket.totalPrice).toBe(20.00);
    });

    it('should add multiple different products', () => {
      service.addItem(mockProduct1);
      service.addItem(mockProduct2);

      const basket = service.basket();
      expect(basket.items.length).toBe(2);
      expect(basket.itemCount).toBe(2);
    });

    it('should respect maximum quantity limit', () => {
      // Add product 99 times
      for (let i = 0; i < 100; i++) {
        service.addItem(mockProduct1);
      }

      const basket = service.basket();
      expect(basket.items[0].quantity).toBe(99);
    });
  });

  describe('removeItem', () => {
    it('should remove product from basket', () => {
      service.addItem(mockProduct1);
      service.removeItem('test-1');

      const basket = service.basket();
      expect(basket.items.length).toBe(0);
      expect(basket.itemCount).toBe(0);
      expect(basket.totalPrice).toBe(0);
    });

    it('should only remove specified product', () => {
      service.addItem(mockProduct1);
      service.addItem(mockProduct2);
      service.removeItem('test-1');

      const basket = service.basket();
      expect(basket.items.length).toBe(1);
      expect(basket.items[0].product.id).toBe('test-2');
    });

    it('should handle removing non-existent product', () => {
      service.addItem(mockProduct1);
      service.removeItem('non-existent');

      const basket = service.basket();
      expect(basket.items.length).toBe(1);
    });
  });

  describe('updateQuantity', () => {
    beforeEach(() => {
      service.addItem(mockProduct1);
    });

    it('should update quantity to valid value', () => {
      service.updateQuantity('test-1', 5);

      const basket = service.basket();
      expect(basket.items[0].quantity).toBe(5);
      expect(basket.itemCount).toBe(5);
      expect(basket.totalPrice).toBe(50.00);
    });

    it('should reject negative quantity', () => {
      service.updateQuantity('test-1', -1);

      const basket = service.basket();
      expect(basket.items[0].quantity).toBe(1); // Should remain unchanged
    });

    it('should reject zero quantity', () => {
      service.updateQuantity('test-1', 0);

      const basket = service.basket();
      expect(basket.items[0].quantity).toBe(1); // Should remain unchanged
    });

    it('should reject non-integer quantity', () => {
      service.updateQuantity('test-1', 2.5);

      const basket = service.basket();
      expect(basket.items[0].quantity).toBe(1); // Should remain unchanged
    });

    it('should reject quantity above maximum', () => {
      service.updateQuantity('test-1', 100);

      const basket = service.basket();
      expect(basket.items[0].quantity).toBe(1); // Should remain unchanged
    });

    it('should accept maximum quantity', () => {
      service.updateQuantity('test-1', 99);

      const basket = service.basket();
      expect(basket.items[0].quantity).toBe(99);
    });
  });

  describe('calculateTotals', () => {
    it('should calculate total without discount', () => {
      service.addItem(mockProduct1);
      service.updateQuantity('test-1', 3);

      const basket = service.basket();
      expect(basket.totalPrice).toBe(30.00);
    });

    it('should apply discount to item price', () => {
      service.addItem(mockProduct2); // $20 with 10% discount = $18

      const basket = service.basket();
      expect(basket.totalPrice).toBe(18.00);
    });

    it('should apply discount before multiplying by quantity', () => {
      service.addItem(mockProduct2); // $20 with 10% discount = $18
      service.updateQuantity('test-2', 2); // $18 * 2 = $36

      const basket = service.basket();
      expect(basket.totalPrice).toBe(36.00);
    });

    it('should calculate total for multiple products', () => {
      service.addItem(mockProduct1); // $10
      service.addItem(mockProduct2); // $18 (with discount)

      const basket = service.basket();
      expect(basket.totalPrice).toBe(28.00);
    });

    it('should count total items correctly', () => {
      service.addItem(mockProduct1);
      service.updateQuantity('test-1', 3);
      service.addItem(mockProduct2);
      service.updateQuantity('test-2', 2);

      const basket = service.basket();
      expect(basket.itemCount).toBe(5);
    });
  });

  describe('clearBasket', () => {
    it('should clear all items from basket', () => {
      service.addItem(mockProduct1);
      service.addItem(mockProduct2);
      service.clearBasket();

      const basket = service.basket();
      expect(basket.items.length).toBe(0);
      expect(basket.itemCount).toBe(0);
      expect(basket.totalPrice).toBe(0);
    });
  });

  describe('LocalStorage persistence', () => {
    it('should save basket to localStorage', () => {
      service.addItem(mockProduct1);

      const stored = localStorage.getItem('angular-dev-shop-basket');
      expect(stored).toBeTruthy();

      const data = JSON.parse(stored!);
      expect(data.items.length).toBe(1);
      expect(data.items[0].product.id).toBe('test-1');
    });

    it('should load basket from localStorage on initialization', () => {
      // Add item and save
      service.addItem(mockProduct1);

      // Create new service instance using TestBed (simulates page reload)
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({});
      const newService = TestBed.inject(BasketService);

      const basket = newService.basket();
      expect(basket.items.length).toBe(1);
      expect(basket.items[0].product.id).toBe('test-1');
    });

    it('should handle corrupted localStorage data', () => {
      localStorage.setItem('angular-dev-shop-basket', 'invalid json');

      // Should not throw error - create new service using TestBed
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({});
      const newService = TestBed.inject(BasketService);
      const basket = newService.basket();

      expect(basket.items.length).toBe(0);
    });

    it('should handle missing localStorage data', () => {
      localStorage.removeItem('angular-dev-shop-basket');

      // Create new service using TestBed
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({});
      const newService = TestBed.inject(BasketService);
      const basket = newService.basket();

      expect(basket.items.length).toBe(0);
    });

    it('should handle QuotaExceededError when saving to localStorage', () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      // Mock localStorage.setItem to throw QuotaExceededError
      // Need to handle both the availability check and the actual save
      let callCount = 0;
      const setItemSpy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
        callCount++;
        // First call is the availability check, let it pass
        if (callCount === 1) {
          return;
        }
        // Second call is the actual save, throw error
        const error = new Error('QuotaExceededError');
        error.name = 'QuotaExceededError';
        throw error;
      });

      // This should not throw, but handle the error gracefully
      expect(() => service.addItem(mockProduct1)).not.toThrow();

      // Verify error was logged with new error message format
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('LocalStorage quota exceeded while trying to save basket')
      );

      // Basket should still be updated in memory
      const basket = service.basket();
      expect(basket.items.length).toBe(1);

      setItemSpy.mockRestore();
      consoleErrorSpy.mockRestore();
      consoleWarnSpy.mockRestore();
    });

    it('should handle generic localStorage save errors', () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      // Mock localStorage.setItem to throw generic error
      // Need to handle both the availability check and the actual save
      let callCount = 0;
      const setItemSpy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
        callCount++;
        // First call is the availability check, let it pass
        if (callCount === 1) {
          return;
        }
        // Second call is the actual save, throw error
        throw new Error('Generic storage error');
      });

      // This should not throw, but handle the error gracefully
      expect(() => service.addItem(mockProduct1)).not.toThrow();

      // Verify error was logged with new error message format
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('Failed to save basket to/from LocalStorage'),
        expect.any(String)
      );

      // Basket should still be updated in memory
      const basket = service.basket();
      expect(basket.items.length).toBe(1);

      setItemSpy.mockRestore();
      consoleErrorSpy.mockRestore();
      consoleWarnSpy.mockRestore();
    });

    it('should handle localStorage load errors', () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      // Mock localStorage.getItem to throw error
      const getItemSpy = vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
        throw new Error('Storage access denied');
      });

      // Create new service instance - should not throw
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({});

      expect(() => {
        const newService = TestBed.inject(BasketService);
        const basket = newService.basket();
        expect(basket.items.length).toBe(0);
      }).not.toThrow();

      // Verify error was logged with new error message format
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('Failed to load basket to/from LocalStorage'),
        expect.any(String)
      );

      getItemSpy.mockRestore();
      consoleErrorSpy.mockRestore();
      consoleWarnSpy.mockRestore();
    });

    it('should continue with empty basket when localStorage is unavailable', () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      // Mock localStorage to be completely unavailable
      const getItemSpy = vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
        throw new Error('localStorage is not available');
      });

      // Create new service instance
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({});
      const newService = TestBed.inject(BasketService);

      // Should have empty basket
      const basket = newService.basket();
      expect(basket.items).toEqual([]);
      expect(basket.totalPrice).toBe(0);
      expect(basket.itemCount).toBe(0);

      getItemSpy.mockRestore();
      consoleErrorSpy.mockRestore();
    });
  });

  describe('SSR Platform Detection', () => {
    it('should not access localStorage on server platform', () => {
      const getItemSpy = vi.spyOn(Storage.prototype, 'getItem');
      const setItemSpy = vi.spyOn(Storage.prototype, 'setItem');
      const removeItemSpy = vi.spyOn(Storage.prototype, 'removeItem');

      // Create service with server platform
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        providers: [
          { provide: PLATFORM_ID, useValue: 'server' }
        ]
      });
      const serverService = TestBed.inject(BasketService);

      // Clear the spies after initialization (platform check happens during construction)
      getItemSpy.mockClear();
      setItemSpy.mockClear();
      removeItemSpy.mockClear();

      // Add item on server
      serverService.addItem(mockProduct1);

      // Verify localStorage was not accessed for save (no setItem calls for actual data)
      expect(setItemSpy).not.toHaveBeenCalled();

      // Basket should still work in memory
      const basket = serverService.basket();
      expect(basket.items.length).toBe(1);
      expect(basket.items[0].product.id).toBe('test-1');

      getItemSpy.mockRestore();
      setItemSpy.mockRestore();
      removeItemSpy.mockRestore();
    });

    it('should access localStorage on browser platform', () => {
      const getItemSpy = vi.spyOn(Storage.prototype, 'getItem');
      const setItemSpy = vi.spyOn(Storage.prototype, 'setItem');

      // Create service with browser platform
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        providers: [
          { provide: PLATFORM_ID, useValue: 'browser' }
        ]
      });
      const browserService = TestBed.inject(BasketService);

      // Verify localStorage was accessed during initialization (availability check + load)
      expect(getItemSpy).toHaveBeenCalled();

      // Clear spies before adding item
      getItemSpy.mockClear();
      setItemSpy.mockClear();

      // Add item on browser
      browserService.addItem(mockProduct1);

      // Verify localStorage was accessed for save (availability check + actual save)
      expect(setItemSpy).toHaveBeenCalled();

      getItemSpy.mockRestore();
      setItemSpy.mockRestore();
    });

    it('should maintain basket state in memory on server without localStorage', () => {
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        providers: [
          { provide: PLATFORM_ID, useValue: 'server' }
        ]
      });
      const serverService = TestBed.inject(BasketService);

      // Perform basket operations
      serverService.addItem(mockProduct1);
      serverService.addItem(mockProduct2);
      serverService.updateQuantity('test-1', 3);

      // Verify basket state is maintained in memory
      const basket = serverService.basket();
      expect(basket.items.length).toBe(2);
      expect(basket.items[0].quantity).toBe(3);
      expect(basket.itemCount).toBe(4);
      expect(basket.totalPrice).toBe(48.00); // (10 * 3) + (20 * 0.9 * 1)
    });

    it('should handle all basket operations on server platform', () => {
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        providers: [
          { provide: PLATFORM_ID, useValue: 'server' }
        ]
      });
      const serverService = TestBed.inject(BasketService);

      // Test add
      serverService.addItem(mockProduct1);
      expect(serverService.basket().items.length).toBe(1);

      // Test update quantity
      serverService.updateQuantity('test-1', 5);
      expect(serverService.basket().items[0].quantity).toBe(5);

      // Test remove
      serverService.removeItem('test-1');
      expect(serverService.basket().items.length).toBe(0);

      // Test clear
      serverService.addItem(mockProduct2);
      serverService.clearBasket();
      expect(serverService.basket().items.length).toBe(0);
    });
  });
});

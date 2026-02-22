import { TestBed } from '@angular/core/testing';
import { PLATFORM_ID } from '@angular/core';
import { BasketService } from './basket.service';
import { Product } from '../../features/products/models/product.model';

describe('BasketService - Error Handling', () => {
  let service: BasketService;

  const mockProduct: Product = {
    id: 'test-1',
    title: 'Test Product',
    description: 'Test description',
    price: 10.00,
    imageUrl: '/test.jpg',
    category: 'Accessories'
  };

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BasketService);
    localStorage.clear();
    service.clearBasket();
  });

  describe('LocalStorage Error Scenarios', () => {
    it('should handle QuotaExceededError gracefully', () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const consoleInfoSpy = vi.spyOn(console, 'info').mockImplementation(() => {});

      let callCount = 0;
      const setItemSpy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation((_key: string) => {
        callCount++;
        // First call is availability check
        if (callCount === 1) {
          return;
        }
        // Second call is actual save - throw QuotaExceededError
        if (callCount === 2) {
          const error = new Error('QuotaExceededError');
          error.name = 'QuotaExceededError';
          throw error;
        }
        // Third call is recovery attempt - succeed
        return;
      });

      // Should not throw
      expect(() => service.addItem(mockProduct)).not.toThrow();

      // Verify error was logged
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('LocalStorage quota exceeded while trying to save basket')
      );

      // Verify recovery was attempted
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('Attempting to recover from storage quota error')
      );

      // Verify recovery succeeded
      expect(consoleInfoSpy).toHaveBeenCalledWith(
        expect.stringContaining('Storage recovery successful')
      );

      // Basket should still be updated in memory
      const basket = service.basket();
      expect(basket.items.length).toBe(1);

      setItemSpy.mockRestore();
      consoleErrorSpy.mockRestore();
      consoleWarnSpy.mockRestore();
      consoleInfoSpy.mockRestore();
    });

    it('should handle QuotaExceededError when recovery fails', () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      let callCount = 0;
      const setItemSpy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
        callCount++;
        // First call is availability check
        if (callCount === 1) {
          return;
        }
        // All subsequent calls throw QuotaExceededError
        const error = new Error('QuotaExceededError');
        error.name = 'QuotaExceededError';
        throw error;
      });

      // Should not throw
      expect(() => service.addItem(mockProduct)).not.toThrow();

      // Verify error was logged
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('LocalStorage quota exceeded while trying to save basket')
      );

      // Verify recovery was attempted
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('Attempting to recover from storage quota error')
      );

      // Verify recovery failure was logged
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('Storage recovery failed'),
        expect.anything()
      );

      // Basket should still be updated in memory
      const basket = service.basket();
      expect(basket.items.length).toBe(1);

      setItemSpy.mockRestore();
      consoleErrorSpy.mockRestore();
      consoleWarnSpy.mockRestore();
    });

    it('should handle SecurityError when accessing localStorage', () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      let callCount = 0;
      const setItemSpy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
        callCount++;
        // First call is availability check
        if (callCount === 1) {
          return;
        }
        // Second call throws SecurityError
        const error = new Error('SecurityError');
        error.name = 'SecurityError';
        throw error;
      });

      // Should not throw
      expect(() => service.addItem(mockProduct)).not.toThrow();

      // Verify SecurityError was logged with appropriate message
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('LocalStorage access denied (SecurityError) while trying to save basket')
      );
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('This may occur in private browsing mode')
      );

      // Basket should still be updated in memory
      const basket = service.basket();
      expect(basket.items.length).toBe(1);

      setItemSpy.mockRestore();
      consoleErrorSpy.mockRestore();
    });

    it('should handle generic Error when saving to localStorage', () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      let callCount = 0;
      const setItemSpy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
        callCount++;
        // First call is availability check
        if (callCount === 1) {
          return;
        }
        // Second call throws generic error
        throw new Error('Generic storage error');
      });

      // Should not throw
      expect(() => service.addItem(mockProduct)).not.toThrow();

      // Verify error was logged
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('Failed to save basket to/from LocalStorage'),
        'Generic storage error'
      );

      // Basket should still be updated in memory
      const basket = service.basket();
      expect(basket.items.length).toBe(1);

      setItemSpy.mockRestore();
      consoleErrorSpy.mockRestore();
    });

    it('should handle non-Error exceptions when saving', () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      let callCount = 0;
      const setItemSpy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
        callCount++;
        // First call is availability check
        if (callCount === 1) {
          return;
        }
        // Second call throws non-Error object
        throw 'String error';
      });

      // Should not throw
      expect(() => service.addItem(mockProduct)).not.toThrow();

      // Verify unknown error was logged
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('Unknown error occurred while trying to save basket'),
        'String error'
      );

      // Basket should still be updated in memory
      const basket = service.basket();
      expect(basket.items.length).toBe(1);

      setItemSpy.mockRestore();
      consoleErrorSpy.mockRestore();
    });

    it('should handle errors when loading from localStorage', () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

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

      // Verify error was logged
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('Failed to load basket to/from LocalStorage'),
        'Storage access denied'
      );

      getItemSpy.mockRestore();
      consoleErrorSpy.mockRestore();
    });

    it('should handle corrupted JSON data in localStorage', () => {
      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      localStorage.setItem('angular-dev-shop-basket', 'invalid json {{{');

      // Create new service instance - should not throw
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({});
      const newService = TestBed.inject(BasketService);

      // Should start with empty basket
      const basket = newService.basket();
      expect(basket.items.length).toBe(0);

      consoleWarnSpy.mockRestore();
    });

    it('should handle invalid data structure in localStorage', () => {
      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      // Valid JSON but invalid structure
      localStorage.setItem('angular-dev-shop-basket', JSON.stringify({ invalid: 'structure' }));

      // Create new service instance
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({});
      const newService = TestBed.inject(BasketService);

      // Should start with empty basket
      const basket = newService.basket();
      expect(basket.items.length).toBe(0);

      // Verify warning was logged
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('Invalid basket data structure in LocalStorage')
      );

      consoleWarnSpy.mockRestore();
    });

    it('should handle localStorage unavailability gracefully', () => {
      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      // Mock localStorage to be unavailable (availability check fails)
      const setItemSpy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
        // Availability check fails
        throw new Error('localStorage not available');
      });

      // Should not throw
      expect(() => service.addItem(mockProduct)).not.toThrow();

      // Verify warning was logged
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('LocalStorage is not available')
      );

      // Basket should still work in memory
      const basket = service.basket();
      expect(basket.items.length).toBe(1);

      setItemSpy.mockRestore();
      consoleWarnSpy.mockRestore();
    });

    it('should handle localStorage unavailability on load', () => {
      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      // Mock localStorage to be unavailable during load
      const setItemSpy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
        throw new Error('localStorage not available');
      });

      // Create new service instance
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({});
      const newService = TestBed.inject(BasketService);

      // Should start with empty basket
      const basket = newService.basket();
      expect(basket.items.length).toBe(0);

      // Verify warning was logged
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('LocalStorage is not available')
      );

      setItemSpy.mockRestore();
      consoleWarnSpy.mockRestore();
    });
  });

  describe('Quantity Validation', () => {
    beforeEach(() => {
      service.addItem(mockProduct);
    });

    it('should reject negative quantity', () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      service.updateQuantity('test-1', -5);

      // Quantity should remain unchanged
      const basket = service.basket();
      expect(basket.items[0].quantity).toBe(1);

      // Error should be logged
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('Invalid quantity: -5')
      );

      consoleErrorSpy.mockRestore();
    });

    it('should reject zero quantity', () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      service.updateQuantity('test-1', 0);

      // Quantity should remain unchanged
      const basket = service.basket();
      expect(basket.items[0].quantity).toBe(1);

      // Error should be logged
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('Invalid quantity: 0')
      );

      consoleErrorSpy.mockRestore();
    });

    it('should reject non-integer quantity', () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      service.updateQuantity('test-1', 2.5);

      // Quantity should remain unchanged
      const basket = service.basket();
      expect(basket.items[0].quantity).toBe(1);

      // Error should be logged
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('Invalid quantity: 2.5')
      );

      consoleErrorSpy.mockRestore();
    });

    it('should reject quantity above maximum (99)', () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      service.updateQuantity('test-1', 100);

      // Quantity should remain unchanged
      const basket = service.basket();
      expect(basket.items[0].quantity).toBe(1);

      // Error should be logged
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('Invalid quantity: 100')
      );

      consoleErrorSpy.mockRestore();
    });

    it('should reject NaN quantity', () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      service.updateQuantity('test-1', NaN);

      // Quantity should remain unchanged
      const basket = service.basket();
      expect(basket.items[0].quantity).toBe(1);

      // Error should be logged
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('Invalid quantity: NaN')
      );

      consoleErrorSpy.mockRestore();
    });

    it('should reject Infinity quantity', () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      service.updateQuantity('test-1', Infinity);

      // Quantity should remain unchanged
      const basket = service.basket();
      expect(basket.items[0].quantity).toBe(1);

      // Error should be logged
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('Invalid quantity: Infinity')
      );

      consoleErrorSpy.mockRestore();
    });

    it('should accept valid quantity at boundary (1)', () => {
      service.updateQuantity('test-1', 1);

      const basket = service.basket();
      expect(basket.items[0].quantity).toBe(1);
    });

    it('should accept valid quantity at boundary (99)', () => {
      service.updateQuantity('test-1', 99);

      const basket = service.basket();
      expect(basket.items[0].quantity).toBe(99);
    });

    it('should accept valid quantity in middle range', () => {
      service.updateQuantity('test-1', 50);

      const basket = service.basket();
      expect(basket.items[0].quantity).toBe(50);
    });

    it('should log error message with correct format', () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      service.updateQuantity('test-1', -1);

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Invalid quantity: -1. Must be a positive integer between 1 and 99'
      );

      consoleErrorSpy.mockRestore();
    });
  });

  describe('Platform Detection Error Handling', () => {
    it('should handle all operations on server platform without errors', () => {
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        providers: [
          { provide: PLATFORM_ID, useValue: 'server' }
        ]
      });
      const serverService = TestBed.inject(BasketService);

      // All operations should work without throwing
      expect(() => {
        serverService.addItem(mockProduct);
        serverService.updateQuantity('test-1', 5);
        serverService.removeItem('test-1');
        serverService.clearBasket();
      }).not.toThrow();
    });

    it('should not attempt localStorage operations on server', () => {
      const setItemSpy = vi.spyOn(Storage.prototype, 'setItem');
      const getItemSpy = vi.spyOn(Storage.prototype, 'getItem');

      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        providers: [
          { provide: PLATFORM_ID, useValue: 'server' }
        ]
      });
      const serverService = TestBed.inject(BasketService);

      // Clear spies after initialization
      setItemSpy.mockClear();
      getItemSpy.mockClear();

      // Perform operations
      serverService.addItem(mockProduct);
      serverService.updateQuantity('test-1', 3);
      serverService.removeItem('test-1');

      // Verify no localStorage calls were made
      expect(setItemSpy).not.toHaveBeenCalled();
      expect(getItemSpy).not.toHaveBeenCalled();

      setItemSpy.mockRestore();
      getItemSpy.mockRestore();
    });
  });
});

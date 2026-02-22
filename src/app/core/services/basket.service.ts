import { Injectable, PLATFORM_ID, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Basket, BasketItem } from '../models/basket.model';
import { Product } from '../models/product.model';

const BASKET_STORAGE_KEY = 'angular-dev-shop-basket';
const MAX_QUANTITY = 99;

@Injectable({
  providedIn: 'root'
})
export class BasketService {
  private platformId = inject(PLATFORM_ID);

  private basketSignal = signal<Basket<Product>>({
    items: [],
    totalPrice: 0,
    itemCount: 0
  });

  basket = this.basketSignal.asReadonly();

  constructor() {
    this.loadFromStorage();
  }

  addItem(product: Product): void {
    const currentBasket = this.basketSignal();
    const existingItemIndex = currentBasket.items.findIndex(
      item => item.product.id === product.id
    );

    let updatedItems: BasketItem<Product>[];

    if (existingItemIndex >= 0) {
      // Product exists, increment quantity
      updatedItems = currentBasket.items.map((item, index) => {
        if (index === existingItemIndex) {
          const newQuantity = Math.min(item.quantity + 1, MAX_QUANTITY);
          return { ...item, quantity: newQuantity };
        }
        return item;
      });
    } else {
      // New product, add to basket
      updatedItems = [...currentBasket.items, { product, quantity: 1 }];
    }

    this.updateBasket(updatedItems);
  }

  removeItem(productId: string): void {
    const currentBasket = this.basketSignal();
    const updatedItems = currentBasket.items.filter(
      item => item.product.id !== productId
    );

    this.updateBasket(updatedItems);
  }

  updateQuantity(productId: string, quantity: number): void {
    // Validate quantity - must be positive integer between 1 and MAX_QUANTITY
    const validatedQuantity = this.validateQuantity(quantity);

    if (validatedQuantity === null) {
      console.error(`Invalid quantity: ${quantity}. Must be a positive integer between 1 and ${MAX_QUANTITY}`);
      return;
    }

    const currentBasket = this.basketSignal();
    const updatedItems = currentBasket.items.map(item => {
      if (item.product.id === productId) {
        return { ...item, quantity: validatedQuantity };
      }
      return item;
    });

    this.updateBasket(updatedItems);
  }

  /**
   * Validate quantity input
   * @param quantity - The quantity to validate
   * @returns Validated quantity or null if invalid
   */
  private validateQuantity(quantity: number): number | null {
    // Check if it's a number
    if (typeof quantity !== 'number' || isNaN(quantity)) {
      return null;
    }

    // Check if it's an integer
    if (!Number.isInteger(quantity)) {
      return null;
    }

    // Check if it's within valid range
    if (quantity < 1 || quantity > MAX_QUANTITY) {
      return null;
    }

    return quantity;
  }

  clearBasket(): void {
    this.updateBasket([]);
  }

  private updateBasket(items: BasketItem<Product>[]): void {
    const { totalPrice, itemCount } = this.calculateTotals(items);

    this.basketSignal.set({
      items,
      totalPrice,
      itemCount
    });

    this.saveToStorage();
  }

  private calculateTotals(items: BasketItem<Product>[]): { totalPrice: number; itemCount: number } {
    let totalPrice = 0;
    let itemCount = 0;

    for (const item of items) {
      const { product, quantity } = item;

      // Calculate price with discount applied
      const itemPrice = product.discount
        ? product.price * (1 - product.discount / 100)
        : product.price;

      totalPrice += itemPrice * quantity;
      itemCount += quantity;
    }

    // Round to 2 decimal places
    totalPrice = Math.round(totalPrice * 100) / 100;

    return { totalPrice, itemCount };
  }

  private saveToStorage(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    try {
      // Check if localStorage is available
      if (!this.isLocalStorageAvailable()) {
        console.warn('LocalStorage is not available. Basket will not be persisted.');
        return;
      }

      const basket = this.basketSignal();
      const data = {
        items: basket.items,
        timestamp: Date.now()
      };

      const serializedData = JSON.stringify(data);
      localStorage.setItem(BASKET_STORAGE_KEY, serializedData);
    } catch (error) {
      this.handleStorageError(error, 'save');
    }
  }

  private loadFromStorage(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    try {
      // Check if localStorage is available
      if (!this.isLocalStorageAvailable()) {
        console.warn('LocalStorage is not available. Starting with empty basket.');
        return;
      }

      const stored = localStorage.getItem(BASKET_STORAGE_KEY);
      if (stored) {
        const data = JSON.parse(stored);

        // Validate data structure
        if (data && data.items && Array.isArray(data.items)) {
          this.updateBasket(data.items);
        } else {
          console.warn('Invalid basket data structure in LocalStorage. Starting with empty basket.');
        }
      }
    } catch (error) {
      this.handleStorageError(error, 'load');
      // Continue with empty basket on error - graceful degradation
    }
  }

  /**
   * Check if LocalStorage is available and accessible
   */
  private isLocalStorageAvailable(): boolean {
    try {
      const testKey = '__angular_dev_shop_test__';
      localStorage.setItem(testKey, 'test');
      localStorage.removeItem(testKey);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Handle storage errors with specific error types
   */
  private handleStorageError(error: unknown, operation: 'save' | 'load'): void {
    if (error instanceof Error) {
      if (error.name === 'QuotaExceededError') {
        console.error(
          `LocalStorage quota exceeded while trying to ${operation} basket. ` +
          'Consider clearing old data or reducing basket size.'
        );

        // Attempt to clear old basket data and retry save operation
        if (operation === 'save') {
          this.attemptStorageRecovery();
        }
      } else if (error.name === 'SecurityError') {
        console.error(
          `LocalStorage access denied (SecurityError) while trying to ${operation} basket. ` +
          'This may occur in private browsing mode or due to browser security settings.'
        );
      } else {
        console.error(`Failed to ${operation} basket to/from LocalStorage:`, error.message);
      }
    } else {
      console.error(`Unknown error occurred while trying to ${operation} basket:`, error);
    }
  }

  /**
   * Attempt to recover from QuotaExceededError by clearing storage
   */
  private attemptStorageRecovery(): void {
    try {
      console.warn('Attempting to recover from storage quota error by clearing basket data...');
      localStorage.removeItem(BASKET_STORAGE_KEY);

      // Try to save again with current basket
      const basket = this.basketSignal();
      const data = {
        items: basket.items,
        timestamp: Date.now()
      };
      localStorage.setItem(BASKET_STORAGE_KEY, JSON.stringify(data));
      console.info('Storage recovery successful. Basket saved.');
    } catch (recoveryError) {
      console.error('Storage recovery failed. Basket will not be persisted:', recoveryError);
    }
  }
}

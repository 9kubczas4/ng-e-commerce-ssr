import { Injectable, PLATFORM_ID, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Basket, BasketItem } from '../../features/basket/models/basket-item.model';
import { Product } from '../../features/products/models/product.model';

const BASKET_STORAGE_KEY = 'angular-dev-shop-basket';
const MAX_QUANTITY = 99;

@Injectable({
  providedIn: 'root'
})
export class BasketService {
  private platformId = inject(PLATFORM_ID);

  private basketSignal = signal<Basket>({
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

    let updatedItems: BasketItem[];

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
    // Validate quantity
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > MAX_QUANTITY) {
      console.error(`Invalid quantity: ${quantity}. Must be between 1 and ${MAX_QUANTITY}`);
      return;
    }

    const currentBasket = this.basketSignal();
    const updatedItems = currentBasket.items.map(item => {
      if (item.product.id === productId) {
        return { ...item, quantity };
      }
      return item;
    });

    this.updateBasket(updatedItems);
  }

  clearBasket(): void {
    this.updateBasket([]);
  }

  private updateBasket(items: BasketItem[]): void {
    const { totalPrice, itemCount } = this.calculateTotals(items);

    this.basketSignal.set({
      items,
      totalPrice,
      itemCount
    });

    this.saveToStorage();
  }

  private calculateTotals(items: BasketItem[]): { totalPrice: number; itemCount: number } {
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
      const basket = this.basketSignal();
      const data = {
        items: basket.items,
        timestamp: Date.now()
      };
      localStorage.setItem(BASKET_STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      if (error instanceof Error && error.name === 'QuotaExceededError') {
        console.error('LocalStorage quota exceeded. Unable to save basket.');
      } else {
        console.error('Failed to save basket to LocalStorage:', error);
      }
    }
  }

  private loadFromStorage(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    try {
      const stored = localStorage.getItem(BASKET_STORAGE_KEY);
      if (stored) {
        const data = JSON.parse(stored);
        if (data.items && Array.isArray(data.items)) {
          this.updateBasket(data.items);
        }
      }
    } catch (error) {
      console.error('Failed to load basket from LocalStorage:', error);
      // Continue with empty basket on error
    }
  }
}

import { Injectable, signal, inject, PLATFORM_ID, TransferState, makeStateKey } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Product, SAMPLE_PRODUCTS } from '../../features/products/models/product.model';

const PRODUCTS_KEY = makeStateKey<Product[]>('products');

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private platformId = inject(PLATFORM_ID);
  private transferState = inject(TransferState);
  private productsSignal = signal<Product[]>([]);

  products = this.productsSignal.asReadonly();

  loadProducts(): void {
    // Check if data is available in TransferState (from server)
    if (this.transferState.hasKey(PRODUCTS_KEY)) {
      const products = this.transferState.get(PRODUCTS_KEY, []);
      this.productsSignal.set(products);
      // Remove the key to prevent memory leaks
      this.transferState.remove(PRODUCTS_KEY);
    } else {
      // Load products normally
      this.productsSignal.set(SAMPLE_PRODUCTS);

      // If on server, store in TransferState for client hydration
      if (!isPlatformBrowser(this.platformId)) {
        this.transferState.set(PRODUCTS_KEY, SAMPLE_PRODUCTS);
      }
    }
  }

  getProductById(id: string): Product | undefined {
    return this.products().find(product => product.id === id);
  }

  searchProducts(query: string, products: Product[]): Product[] {
    if (!query || query.trim() === '') {
      return products;
    }

    const lowerQuery = query.toLowerCase().trim();

    return products.filter(product =>
      product.title.toLowerCase().includes(lowerQuery) ||
      product.description.toLowerCase().includes(lowerQuery)
    );
  }

  filterByCategory(category: string, products: Product[]): Product[] {
    return products.filter(product => product.category === category);
  }
}

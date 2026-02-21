import { Injectable, signal } from '@angular/core';
import { Product, SAMPLE_PRODUCTS } from '../../features/products/models/product.model';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private productsSignal = signal<Product[]>([]);

  products = this.productsSignal.asReadonly();

  loadProducts(): void {
    this.productsSignal.set(SAMPLE_PRODUCTS);
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

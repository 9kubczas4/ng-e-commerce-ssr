import { Injectable, signal, inject, PLATFORM_ID, TransferState, makeStateKey } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Product } from '@core/models/product.model';

const PRODUCTS_KEY = makeStateKey<Product[]>('products');

export const SAMPLE_PRODUCTS: Product[] = [
  {
    id: 'ng-tshirt-001',
    title: 'Angular Logo T-Shirt',
    description: 'Premium cotton t-shirt with the iconic Angular logo. Comfortable fit for coding marathons and tech meetups. Available in multiple sizes.',
    price: 29.99,
    discount: 10,
    imageUrl: '/assets/products/angular-tshirt.png',
    category: 'Apparel'
  },
  {
    id: 'ng-mug-001',
    title: 'Angular Developer Mug',
    description: 'Start your day with coffee in this ceramic mug featuring Angular branding. Microwave and dishwasher safe.',
    price: 14.99,
    imageUrl: '/assets/products/angular-mug.png',
    category: 'Accessories'
  },
  {
    id: 'ng-hoodie-001',
    title: 'Angular Hoodie',
    description: 'Stay warm while coding with this comfortable hoodie featuring the Angular shield logo. Made from soft fleece material with a kangaroo pocket.',
    price: 49.99,
    discount: 15,
    imageUrl: '/assets/products/angular-hoodie.png',
    category: 'Apparel'
  },
  {
    id: 'ng-stickers-001',
    title: 'Angular Sticker Pack',
    description: 'Collection of 10 high-quality vinyl stickers featuring Angular logos and developer humor. Perfect for laptops and water bottles.',
    price: 9.99,
    imageUrl: '/assets/products/angular-stickers.png',
    category: 'Stickers'
  },
  {
    id: 'ng-book-001',
    title: 'Angular Best Practices Guide',
    description: 'Comprehensive guide to building modern Angular applications with standalone components, signals, and SSR. Written by Angular experts.',
    price: 39.99,
    discount: 20,
    imageUrl: '/assets/products/angular-book.png',
    category: 'Books'
  },
  {
    id: 'ng-cap-001',
    title: 'Angular Baseball Cap',
    description: 'Adjustable baseball cap with embroidered Angular logo. One size fits all with snapback closure.',
    price: 19.99,
    imageUrl: '/assets/products/angular-cap.png',
    category: 'Accessories'
  },
  {
    id: 'ng-mousepad-001',
    title: 'Angular Mouse Pad',
    description: 'Large gaming mouse pad with Angular branding and smooth surface for precise mouse control. Non-slip rubber base.',
    price: 12.99,
    discount: 5,
    imageUrl: '/assets/products/angular-mousepad.png',
    category: 'Accessories'
  },
  {
    id: 'ng-notebook-001',
    title: 'Angular Developer Notebook',
    description: 'Hardcover notebook with 200 lined pages for sketching components, planning architecture, and taking notes during code reviews.',
    price: 16.99,
    imageUrl: '/assets/products/angular-notebook.png',
    category: 'Accessories'
  },
  {
    id: 'ng-keychain-001',
    title: 'Angular Logo Keychain',
    description: 'Metal keychain with the Angular shield logo. Durable and stylish accessory for your keys.',
    price: 7.99,
    imageUrl: '/assets/products/angular-keychain.png',
    category: 'Accessories'
  },
  {
    id: 'ng-poster-001',
    title: 'Angular Architecture Poster',
    description: 'Large format poster illustrating Angular application architecture patterns. Perfect for office or home workspace.',
    price: 24.99,
    discount: 10,
    imageUrl: '/assets/products/angular-poster.png',
    category: 'Accessories'
  },
  {
    id: 'ng-socks-001',
    title: 'Angular Developer Socks',
    description: 'Comfortable crew socks with Angular logo pattern. Made from breathable cotton blend. Sold as a pair.',
    price: 11.99,
    imageUrl: '/assets/products/angular-socks.png',
    category: 'Apparel'
  },
  {
    id: 'ng-usb-001',
    title: 'Angular USB Drive 32GB',
    description: 'High-speed USB 3.0 flash drive with Angular branding. 32GB capacity for storing your projects and documentation.',
    price: 22.99,
    discount: 15,
    imageUrl: '/assets/products/angular-usb.png',
    category: 'Electronics'
  }
];

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private platformId = inject(PLATFORM_ID);
  private transferState = inject(TransferState);
  private productsSignal = signal<Product[]>([]);
  private loadingSignal = signal<boolean>(false);

  products = this.productsSignal.asReadonly();
  loading = this.loadingSignal.asReadonly();

  loadProducts(): void {
    // Check if data is available in TransferState (from server)
    if (this.transferState.hasKey(PRODUCTS_KEY)) {
      const products = this.transferState.get(PRODUCTS_KEY, []);
      this.productsSignal.set(products);
      // Remove the key to prevent memory leaks
      this.transferState.remove(PRODUCTS_KEY);
    } else {
      // Simulate loading state for better UX
      this.loadingSignal.set(true);

      // Simulate async loading with a small delay
      setTimeout(() => {
        this.productsSignal.set(SAMPLE_PRODUCTS);
        this.loadingSignal.set(false);

        // If on server, store in TransferState for client hydration
        if (!isPlatformBrowser(this.platformId)) {
          this.transferState.set(PRODUCTS_KEY, SAMPLE_PRODUCTS);
        }
      }, 300);
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

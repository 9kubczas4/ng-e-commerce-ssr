import { TestBed } from '@angular/core/testing';
import { PLATFORM_ID } from '@angular/core';
import { ProductService, SAMPLE_PRODUCTS } from './product.service';
import { Product } from '@core/models/product.model';
import { TransferState, makeStateKey } from '@angular/core';

describe('ProductService', () => {
  let service: ProductService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [TransferState]
    });
    service = TestBed.inject(ProductService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('loadProducts', () => {
    it('should load sample products into the signal', async () => {
      service.loadProducts();
      // Wait for async loading to complete
      await new Promise(resolve => setTimeout(resolve, 350));
      expect(service.products()).toEqual(SAMPLE_PRODUCTS);
    });

    it('should have empty products array initially', () => {
      expect(service.products()).toEqual([]);
    });
  });

  describe('getProductById', () => {
    beforeEach(async () => {
      service.loadProducts();
      // Wait for async loading to complete
      await new Promise(resolve => setTimeout(resolve, 350));
    });

    it('should return product when valid ID is provided', () => {
      const product = service.getProductById('ng-tshirt-001');
      expect(product).toBeDefined();
      expect(product?.id).toBe('ng-tshirt-001');
      expect(product?.title).toBe('Angular Logo T-Shirt');
    });

    it('should return undefined when invalid ID is provided', () => {
      const product = service.getProductById('invalid-id-123');
      expect(product).toBeUndefined();
    });

    it('should return undefined when empty string ID is provided', () => {
      const product = service.getProductById('');
      expect(product).toBeUndefined();
    });

    it('should handle special characters in ID', () => {
      const product = service.getProductById('ng-tshirt-001!@#$%');
      expect(product).toBeUndefined();
    });

    it('should be case-sensitive for product IDs', () => {
      const product = service.getProductById('NG-TSHIRT-001');
      expect(product).toBeUndefined();
    });
  });

  describe('searchProducts', () => {
    const mockProducts: Product[] = [
      {
        id: 'test-1',
        title: 'Angular T-Shirt',
        description: 'A great shirt for developers',
        price: 29.99,
        imageUrl: '/test.jpg',
        category: 'Apparel'
      },
      {
        id: 'test-2',
        title: 'React Mug',
        description: 'Coffee mug with React logo',
        price: 14.99,
        imageUrl: '/test2.jpg',
        category: 'Accessories'
      },
      {
        id: 'test-3',
        title: 'Vue Stickers',
        description: 'Sticker pack for laptops',
        price: 9.99,
        imageUrl: '/test3.jpg',
        category: 'Stickers'
      }
    ];

    it('should return all products when query is empty string', () => {
      const results = service.searchProducts('', mockProducts);
      expect(results).toEqual(mockProducts);
    });

    it('should return all products when query is whitespace only', () => {
      const results = service.searchProducts('   ', mockProducts);
      expect(results).toEqual(mockProducts);
    });

    it('should return products matching title (case-insensitive)', () => {
      const results = service.searchProducts('angular', mockProducts);
      expect(results).toHaveLength(1);
      expect(results[0].id).toBe('test-1');
    });

    it('should return products matching description (case-insensitive)', () => {
      const results = service.searchProducts('coffee', mockProducts);
      expect(results).toHaveLength(1);
      expect(results[0].id).toBe('test-2');
    });

    it('should handle uppercase query', () => {
      const results = service.searchProducts('ANGULAR', mockProducts);
      expect(results).toHaveLength(1); // Matches title in test-1 only
    });

    it('should handle mixed case query', () => {
      const results = service.searchProducts('AnGuLaR', mockProducts);
      expect(results).toHaveLength(1);
    });

    it('should return empty array when no matches found', () => {
      const results = service.searchProducts('nonexistent', mockProducts);
      expect(results).toEqual([]);
    });

    it('should handle empty products array', () => {
      const results = service.searchProducts('angular', []);
      expect(results).toEqual([]);
    });

    it('should handle special characters in query', () => {
      const specialProducts: Product[] = [
        {
          id: 'special-1',
          title: 'Product with @#$ symbols',
          description: 'Test description',
          price: 10,
          imageUrl: '/test.jpg',
          category: 'Accessories'
        }
      ];
      const results = service.searchProducts('@#$', specialProducts);
      expect(results).toHaveLength(1);
    });

    it('should trim whitespace from query', () => {
      const results = service.searchProducts('  angular  ', mockProducts);
      expect(results).toHaveLength(1);
    });

    it('should match partial words', () => {
      const results = service.searchProducts('ang', mockProducts);
      expect(results).toHaveLength(1);
    });
  });

  describe('filterByCategory', () => {
    const mockProducts: Product[] = [
      {
        id: 'test-1',
        title: 'T-Shirt',
        description: 'A shirt',
        price: 29.99,
        imageUrl: '/test.jpg',
        category: 'Apparel'
      },
      {
        id: 'test-2',
        title: 'Mug',
        description: 'A mug',
        price: 14.99,
        imageUrl: '/test2.jpg',
        category: 'Accessories'
      },
      {
        id: 'test-3',
        title: 'Hoodie',
        description: 'A hoodie',
        price: 49.99,
        imageUrl: '/test3.jpg',
        category: 'Apparel'
      }
    ];

    it('should return products matching the category', () => {
      const results = service.filterByCategory('Apparel', mockProducts);
      expect(results).toHaveLength(2);
      expect(results.every(p => p.category === 'Apparel')).toBe(true);
    });

    it('should return empty array when no products match category', () => {
      const results = service.filterByCategory('Books', mockProducts);
      expect(results).toEqual([]);
    });

    it('should handle empty products array', () => {
      const results = service.filterByCategory('Apparel', []);
      expect(results).toEqual([]);
    });

    it('should be case-sensitive for category names', () => {
      const results = service.filterByCategory('apparel', mockProducts);
      expect(results).toEqual([]);
    });

    it('should return single product when only one matches', () => {
      const results = service.filterByCategory('Accessories', mockProducts);
      expect(results).toHaveLength(1);
      expect(results[0].id).toBe('test-2');
    });
  });

  describe('SSR Platform Detection and TransferState', () => {
    const PRODUCTS_KEY = makeStateKey<Product[]>('products');

    it('should use TransferState data when available', () => {
      const mockProducts: Product[] = [
        {
          id: 'transfer-1',
          title: 'Transfer Product',
          description: 'From server',
          price: 99.99,
          imageUrl: '/transfer.jpg',
          category: 'Test'
        }
      ];

      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        providers: [TransferState]
      });

      const newTransferState = TestBed.inject(TransferState);
      newTransferState.set(PRODUCTS_KEY, mockProducts);

      const newService = TestBed.inject(ProductService);
      newService.loadProducts();

      expect(newService.products()).toEqual(mockProducts);
    });

    it('should remove TransferState key after using it', () => {
      const mockProducts: Product[] = [SAMPLE_PRODUCTS[0]];

      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        providers: [TransferState]
      });

      const newTransferState = TestBed.inject(TransferState);
      newTransferState.set(PRODUCTS_KEY, mockProducts);

      const newService = TestBed.inject(ProductService);
      newService.loadProducts();

      expect(newTransferState.hasKey(PRODUCTS_KEY)).toBe(false);
    });

    it('should load SAMPLE_PRODUCTS when TransferState is empty on browser', async () => {
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        providers: [
          TransferState,
          { provide: PLATFORM_ID, useValue: 'browser' }
        ]
      });

      const newService = TestBed.inject(ProductService);
      newService.loadProducts();
      // Wait for async loading to complete
      await new Promise(resolve => setTimeout(resolve, 350));

      expect(newService.products()).toEqual(SAMPLE_PRODUCTS);
    });

    it('should set TransferState on server platform', async () => {
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        providers: [
          TransferState,
          { provide: PLATFORM_ID, useValue: 'server' }
        ]
      });

      const newTransferState = TestBed.inject(TransferState);
      const newService = TestBed.inject(ProductService);

      newService.loadProducts();
      // Wait for async loading to complete
      await new Promise(resolve => setTimeout(resolve, 350));

      expect(newTransferState.hasKey(PRODUCTS_KEY)).toBe(true);
      expect(newTransferState.get(PRODUCTS_KEY, [])).toEqual(SAMPLE_PRODUCTS);
    });

    it('should not set TransferState on browser platform', () => {
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        providers: [
          TransferState,
          { provide: PLATFORM_ID, useValue: 'browser' }
        ]
      });

      const newTransferState = TestBed.inject(TransferState);
      const newService = TestBed.inject(ProductService);

      newService.loadProducts();

      expect(newTransferState.hasKey(PRODUCTS_KEY)).toBe(false);
    });

    it('should work correctly on server without browser APIs', async () => {
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        providers: [
          TransferState,
          { provide: PLATFORM_ID, useValue: 'server' }
        ]
      });

      const newService = TestBed.inject(ProductService);

      // Should not throw when loading products on server
      expect(() => newService.loadProducts()).not.toThrow();

      // Wait for async loading to complete
      await new Promise(resolve => setTimeout(resolve, 350));

      // Should have products loaded
      expect(newService.products()).toEqual(SAMPLE_PRODUCTS);

      // Should be able to search and filter
      const searchResults = newService.searchProducts('Angular', newService.products());
      expect(searchResults.length).toBeGreaterThan(0);

      const filterResults = newService.filterByCategory('Apparel', newService.products());
      expect(filterResults.length).toBeGreaterThan(0);
    });

    it('should handle TransferState priority over direct load', () => {
      const transferProducts: Product[] = [
        {
          id: 'priority-1',
          title: 'Priority Product',
          description: 'Should be used',
          price: 1.00,
          imageUrl: '/priority.jpg',
          category: 'Test'
        }
      ];

      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        providers: [
          TransferState,
          { provide: PLATFORM_ID, useValue: 'browser' }
        ]
      });

      const newTransferState = TestBed.inject(TransferState);
      newTransferState.set(PRODUCTS_KEY, transferProducts);

      const newService = TestBed.inject(ProductService);
      newService.loadProducts();

      // Should use TransferState data, not SAMPLE_PRODUCTS
      expect(newService.products()).toEqual(transferProducts);
      expect(newService.products()).not.toEqual(SAMPLE_PRODUCTS);
    });
  });
});

import { TestBed } from '@angular/core/testing';
import { ProductService } from './product.service';
import { Product, SAMPLE_PRODUCTS } from '../../features/products/models/product.model';
import { TransferState } from '@angular/core';

describe('ProductService', () => {
  let service: ProductService;
  let transferState: TransferState;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [TransferState]
    });
    service = TestBed.inject(ProductService);
    transferState = TestBed.inject(TransferState);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('loadProducts', () => {
    it('should load sample products into the signal', () => {
      service.loadProducts();
      expect(service.products()).toEqual(SAMPLE_PRODUCTS);
    });

    it('should have empty products array initially', () => {
      expect(service.products()).toEqual([]);
    });
  });

  describe('getProductById', () => {
    beforeEach(() => {
      service.loadProducts();
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
});

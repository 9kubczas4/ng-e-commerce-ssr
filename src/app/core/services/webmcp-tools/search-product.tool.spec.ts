import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createSearchProductTool } from './search-product.tool';
import { Product } from '@core/models/product.model';
import { SearchProductResponse, ErrorObject } from '@core/models/webmcp.model';

describe('SearchProductTool - Edge Cases', () => {
  const mockProducts: Product[] = [
    {
      id: 'test-1',
      title: 'Angular T-Shirt',
      description: 'A comfortable t-shirt with Angular logo',
      price: 29.99,
      category: 'Apparel',
      imageUrl: '/test.png'
    },
    {
      id: 'test-2',
      title: 'React Mug',
      description: 'Coffee mug for React developers',
      price: 14.99,
      category: 'Accessories',
      imageUrl: '/test2.png'
    },
    {
      id: 'test-3',
      title: 'Vue Stickers',
      description: 'Sticker pack with Vue logos',
      price: 9.99,
      category: 'Stickers',
      imageUrl: '/test3.png'
    }
  ];

  let mockProductService: {
    products: () => Product[];
    searchProducts: (query: string, products: Product[]) => Product[];
    filterByCategory: (category: string, products: Product[]) => Product[];
  };

  let mockSearchStateService: {
    setSearchState: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    mockProductService = {
      products: () => mockProducts,
      searchProducts: (query: string, products: Product[]) => {
        if (!query || query.trim() === '') {
          return products;
        }
        const lowerQuery = query.toLowerCase().trim();
        return products.filter(product =>
          product.title.toLowerCase().includes(lowerQuery) ||
          product.description.toLowerCase().includes(lowerQuery)
        );
      },
      filterByCategory: (category: string, products: Product[]) => {
        return products.filter(product => product.category === category);
      }
    };

    mockSearchStateService = {
      setSearchState: vi.fn()
    };
  });

  describe('Empty query edge case', () => {
    it('should return all products when query is empty string', async () => {
      const tool = createSearchProductTool(mockProductService as any, mockSearchStateService as any);
      const result = await tool.execute({ query: '' });

      const response: SearchProductResponse = JSON.parse(result.content[0].text);

      expect(response.products).toHaveLength(3);
      expect(response.count).toBe(3);
      expect(response.message).toBe('Found 3 products.');
      expect(mockSearchStateService.setSearchState).toHaveBeenCalledWith('', null);
    });

    it('should return all products when query is undefined', async () => {
      const tool = createSearchProductTool(mockProductService as any, mockSearchStateService as any);
      const result = await tool.execute({});

      const response: SearchProductResponse = JSON.parse(result.content[0].text);

      expect(response.products).toHaveLength(3);
      expect(response.count).toBe(3);
      expect(response.message).toBe('Found 3 products.');
      expect(mockSearchStateService.setSearchState).toHaveBeenCalledWith('', null);
    });

    it('should return all products when query is whitespace only', async () => {
      const tool = createSearchProductTool(mockProductService as any, mockSearchStateService as any);
      const result = await tool.execute({ query: '   ' });

      const response: SearchProductResponse = JSON.parse(result.content[0].text);

      expect(response.products).toHaveLength(3);
      expect(response.count).toBe(3);
      expect(response.message).toBe('Found 3 products.');
      expect(mockSearchStateService.setSearchState).toHaveBeenCalledWith('   ', null);
    });
  });

  describe('No results edge case', () => {
    it('should return empty array with descriptive message when no products match', async () => {
      const tool = createSearchProductTool(mockProductService as any, mockSearchStateService as any);
      const result = await tool.execute({ query: 'nonexistent product xyz' });

      const response: SearchProductResponse = JSON.parse(result.content[0].text);

      expect(response.products).toHaveLength(0);
      expect(response.count).toBe(0);
      expect(response.message).toBe('No products found matching your search criteria.');
      expect(mockSearchStateService.setSearchState).toHaveBeenCalledWith('nonexistent product xyz', null);
    });

    it('should return empty array when category filter matches no products', async () => {
      const tool = createSearchProductTool(mockProductService as any, mockSearchStateService as any);
      const result = await tool.execute({ category: 'Electronics' });

      const response: SearchProductResponse = JSON.parse(result.content[0].text);

      expect(response.products).toHaveLength(0);
      expect(response.count).toBe(0);
      expect(response.message).toBe('No products found matching your search criteria.');
      expect(mockSearchStateService.setSearchState).toHaveBeenCalledWith('', 'Electronics');
    });

    it('should return empty array when both query and category match no products', async () => {
      const tool = createSearchProductTool(mockProductService as any, mockSearchStateService as any);
      const result = await tool.execute({
        query: 'Angular',
        category: 'Electronics'
      });

      const response: SearchProductResponse = JSON.parse(result.content[0].text);

      expect(response.products).toHaveLength(0);
      expect(response.count).toBe(0);
      expect(response.message).toBe('No products found matching your search criteria.');
      expect(mockSearchStateService.setSearchState).toHaveBeenCalledWith('Angular', 'Electronics');
    });
  });

  describe('Error handling for invalid parameters', () => {
    it('should handle service errors gracefully', async () => {
      const errorService = {
        products: () => {
          throw new Error('Database connection failed');
        },
        searchProducts: mockProductService.searchProducts,
        filterByCategory: mockProductService.filterByCategory
      };

      const tool = createSearchProductTool(errorService as any, mockSearchStateService as any);
      const result = await tool.execute({ query: 'test' });

      const errorResponse: ErrorObject = JSON.parse(result.content[0].text);

      expect(errorResponse.error).toBe('Failed to search products');
      expect(errorResponse.details).toBe('Database connection failed');
      expect(errorResponse.code).toBe('SEARCH_ERROR');
    });

    it('should handle searchProducts method errors gracefully', async () => {
      const errorService = {
        products: () => mockProducts,
        searchProducts: () => {
          throw new Error('Search index corrupted');
        },
        filterByCategory: mockProductService.filterByCategory
      };

      const tool = createSearchProductTool(errorService as any, mockSearchStateService as any);
      const result = await tool.execute({ query: 'Angular' });

      const errorResponse: ErrorObject = JSON.parse(result.content[0].text);

      expect(errorResponse.error).toBe('Failed to search products');
      expect(errorResponse.details).toBe('Search index corrupted');
      expect(errorResponse.code).toBe('SEARCH_ERROR');
    });

    it('should handle filterByCategory method errors gracefully', async () => {
      const errorService = {
        products: () => mockProducts,
        searchProducts: mockProductService.searchProducts,
        filterByCategory: () => {
          throw new Error('Category filter failed');
        }
      };

      const tool = createSearchProductTool(errorService as any, mockSearchStateService as any);
      const result = await tool.execute({ category: 'Apparel' });

      const errorResponse: ErrorObject = JSON.parse(result.content[0].text);

      expect(errorResponse.error).toBe('Failed to search products');
      expect(errorResponse.details).toBe('Category filter failed');
      expect(errorResponse.code).toBe('SEARCH_ERROR');
    });

    it('should handle unknown errors gracefully', async () => {
      const errorService = {
        products: () => {
          throw 'String error';
        },
        searchProducts: mockProductService.searchProducts,
        filterByCategory: mockProductService.filterByCategory
      };

      const tool = createSearchProductTool(errorService as any, mockSearchStateService as any);
      const result = await tool.execute({ query: 'test' });

      const errorResponse: ErrorObject = JSON.parse(result.content[0].text);

      expect(errorResponse.error).toBe('Failed to search products');
      expect(errorResponse.details).toBe('Unknown error');
      expect(errorResponse.code).toBe('SEARCH_ERROR');
    });
  });

  describe('Message formatting', () => {
    it('should use singular form for single product result', async () => {
      const tool = createSearchProductTool(mockProductService as any, mockSearchStateService as any);
      const result = await tool.execute({ query: 'React' });

      const response: SearchProductResponse = JSON.parse(result.content[0].text);

      expect(response.products).toHaveLength(1);
      expect(response.count).toBe(1);
      expect(response.message).toBe('Found 1 product.');
    });

    it('should use plural form for multiple product results', async () => {
      const tool = createSearchProductTool(mockProductService as any, mockSearchStateService as any);
      const result = await tool.execute({ query: 'logo' });

      const response: SearchProductResponse = JSON.parse(result.content[0].text);

      expect(response.products.length).toBeGreaterThan(1);
      expect(response.count).toBe(response.products.length);
      expect(response.message).toContain('products.');
    });
  });

  describe('UI state synchronization', () => {
    it('should sync UI state when search is performed with query only', async () => {
      const tool = createSearchProductTool(mockProductService as any, mockSearchStateService as any);
      await tool.execute({ query: 'Angular' });

      expect(mockSearchStateService.setSearchState).toHaveBeenCalledWith('Angular', null);
    });

    it('should sync UI state when search is performed with category only', async () => {
      const tool = createSearchProductTool(mockProductService as any, mockSearchStateService as any);
      await tool.execute({ category: 'Apparel' });

      expect(mockSearchStateService.setSearchState).toHaveBeenCalledWith('', 'Apparel');
    });

    it('should sync UI state when search is performed with both query and category', async () => {
      const tool = createSearchProductTool(mockProductService as any, mockSearchStateService as any);
      await tool.execute({ query: 'shirt', category: 'Apparel' });

      expect(mockSearchStateService.setSearchState).toHaveBeenCalledWith('shirt', 'Apparel');
    });
  });
});

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createNavigateToPageTool } from './navigate-to-page.tool';
import { Router } from '@angular/router';
import { ProductService } from '../product.service';
import { Product } from '@core/models/product.model';

describe('navigate_to_page WebMCP Tool', () => {
  let mockRouter: { navigate: ReturnType<typeof vi.fn> };
  let mockProductService: { getProductById: ReturnType<typeof vi.fn> };
  let tool: ReturnType<typeof createNavigateToPageTool>;

  const mockProduct: Product = {
    id: 'product-1',
    title: 'Angular T-Shirt',
    description: 'Premium Angular branded t-shirt',
    price: 29.99,
    discount: 10,
    imageUrl: '/assets/tshirt.jpg',
    category: 'Apparel'
  };

  beforeEach(() => {
    mockRouter = {
      navigate: vi.fn().mockResolvedValue(true)
    };

    mockProductService = {
      getProductById: vi.fn()
    };

    tool = createNavigateToPageTool(
      mockRouter as unknown as Router,
      mockProductService as unknown as ProductService
    );
  });

  describe('Tool Definition', () => {
    it('should have correct name', () => {
      expect(tool.name).toBe('navigate_to_page');
    });

    it('should have description', () => {
      expect(tool.description).toBeDefined();
      expect(tool.description.length).toBeGreaterThan(0);
    });

    it('should have input schema with page property', () => {
      expect(tool.inputSchema.properties.page).toBeDefined();
      expect(tool.inputSchema.properties.page.type).toBe('string');
      expect(tool.inputSchema.properties.page.enum).toEqual([
        'complaint',
        'product_detail',
        'home',
        'checkout'
      ]);
    });

    it('should have input schema with optional productId property', () => {
      expect(tool.inputSchema.properties.productId).toBeDefined();
      expect(tool.inputSchema.properties.productId.type).toBe('string');
    });

    it('should require page parameter', () => {
      expect(tool.inputSchema.required).toContain('page');
    });
  });

  describe('Input Validation', () => {
    it('should reject null input', async () => {
      const result = await tool.execute(null as any);
      const response = JSON.parse(result.content[0].text);

      expect(response.success).toBe(false);
      expect(response.error).toBe('INVALID_INPUT');
    });

    it('should reject undefined input', async () => {
      const result = await tool.execute(undefined as any);
      const response = JSON.parse(result.content[0].text);

      expect(response.success).toBe(false);
      expect(response.error).toBe('INVALID_INPUT');
    });

    it('should reject non-object input', async () => {
      const result = await tool.execute('invalid' as any);
      const response = JSON.parse(result.content[0].text);

      expect(response.success).toBe(false);
      expect(response.error).toBe('INVALID_INPUT');
    });

    it('should reject missing page parameter', async () => {
      const result = await tool.execute({} as any);
      const response = JSON.parse(result.content[0].text);

      expect(response.success).toBe(false);
      expect(response.error).toBe('MISSING_PAGE');
    });

    it('should reject non-string page parameter', async () => {
      const result = await tool.execute({ page: 123 } as any);
      const response = JSON.parse(result.content[0].text);

      expect(response.success).toBe(false);
      expect(response.error).toBe('MISSING_PAGE');
    });

    it('should reject invalid page value', async () => {
      const result = await tool.execute({ page: 'invalid_page' } as any);
      const response = JSON.parse(result.content[0].text);

      expect(response.success).toBe(false);
      expect(response.error).toBe('INVALID_PAGE');
      expect(response.message).toContain('invalid_page');
    });
  });

  describe('Complaint Page Navigation', () => {
    it('should navigate to complaint form', async () => {
      const result = await tool.execute({ page: 'complaint' });
      const response = JSON.parse(result.content[0].text);

      expect(response.success).toBe(true);
      expect(response.message).toContain('complaint form');
      expect(response.page).toBe('complaint');
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/complaint']);
    });
  });

  describe('Home Page Navigation', () => {
    it('should navigate to home page', async () => {
      const result = await tool.execute({ page: 'home' });
      const response = JSON.parse(result.content[0].text);

      expect(response.success).toBe(true);
      expect(response.message).toContain('home page');
      expect(response.page).toBe('home');
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/product']);
    });
  });

  describe('Checkout Page Navigation', () => {
    it('should navigate to checkout page', async () => {
      const result = await tool.execute({ page: 'checkout' });
      const response = JSON.parse(result.content[0].text);

      expect(response.success).toBe(true);
      expect(response.message).toContain('checkout');
      expect(response.page).toBe('checkout');
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/checkout']);
    });
  });

  describe('Product Detail Navigation', () => {
    it('should require productId for product_detail page', async () => {
      const result = await tool.execute({ page: 'product_detail' });
      const response = JSON.parse(result.content[0].text);

      expect(response.success).toBe(false);
      expect(response.error).toBe('MISSING_PRODUCT_ID');
    });

    it('should reject non-string productId', async () => {
      const result = await tool.execute({
        page: 'product_detail',
        productId: 123
      } as any);
      const response = JSON.parse(result.content[0].text);

      expect(response.success).toBe(false);
      expect(response.error).toBe('MISSING_PRODUCT_ID');
    });

    it('should reject empty productId', async () => {
      const result = await tool.execute({
        page: 'product_detail',
        productId: ''
      });
      const response = JSON.parse(result.content[0].text);

      expect(response.success).toBe(false);
      expect(response.error).toBe('MISSING_PRODUCT_ID');
    });

    it('should reject non-existent product', async () => {
      mockProductService.getProductById.mockReturnValue(null);

      const result = await tool.execute({
        page: 'product_detail',
        productId: 'non-existent'
      });
      const response = JSON.parse(result.content[0].text);

      expect(response.success).toBe(false);
      expect(response.error).toBe('PRODUCT_NOT_FOUND');
      expect(response.message).toContain('non-existent');
      expect(mockProductService.getProductById).toHaveBeenCalledWith('non-existent');
    });

    it('should navigate to product detail with valid productId', async () => {
      mockProductService.getProductById.mockReturnValue(mockProduct);

      const result = await tool.execute({
        page: 'product_detail',
        productId: 'product-1'
      });
      const response = JSON.parse(result.content[0].text);

      expect(response.success).toBe(true);
      expect(response.message).toContain('product detail page');
      expect(response.message).toContain('Angular T-Shirt');
      expect(response.productId).toBe('product-1');
      expect(response.productTitle).toBe('Angular T-Shirt');
      expect(mockProductService.getProductById).toHaveBeenCalledWith('product-1');
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/product', 'product-1']);
    });

    it('should navigate to different product details', async () => {
      const anotherProduct: Product = {
        id: 'product-2',
        title: 'Angular Mug',
        description: 'Coffee mug',
        price: 14.99,
        imageUrl: '/assets/mug.jpg',
        category: 'Accessories'
      };
      mockProductService.getProductById.mockReturnValue(anotherProduct);

      const result = await tool.execute({
        page: 'product_detail',
        productId: 'product-2'
      });
      const response = JSON.parse(result.content[0].text);

      expect(response.success).toBe(true);
      expect(response.productId).toBe('product-2');
      expect(response.productTitle).toBe('Angular Mug');
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/product', 'product-2']);
    });
  });

  describe('Error Handling', () => {
    it('should handle router navigation errors', async () => {
      mockRouter.navigate.mockRejectedValue(new Error('Navigation failed'));

      const result = await tool.execute({ page: 'complaint' });
      const response = JSON.parse(result.content[0].text);

      expect(response.success).toBe(false);
      expect(response.error).toBe('NAVIGATION_ERROR');
      expect(response.message).toContain('Navigation failed');
    });

    it('should handle product service errors', async () => {
      mockProductService.getProductById.mockImplementation(() => {
        throw new Error('Database error');
      });

      const result = await tool.execute({
        page: 'product_detail',
        productId: 'product-1'
      });
      const response = JSON.parse(result.content[0].text);

      expect(response.success).toBe(false);
      expect(response.error).toBe('NAVIGATION_ERROR');
      expect(response.message).toContain('Database error');
    });

    it('should handle unknown errors', async () => {
      mockRouter.navigate.mockRejectedValue('Unknown error');

      const result = await tool.execute({ page: 'home' });
      const response = JSON.parse(result.content[0].text);

      expect(response.success).toBe(false);
      expect(response.error).toBe('NAVIGATION_ERROR');
    });
  });
});

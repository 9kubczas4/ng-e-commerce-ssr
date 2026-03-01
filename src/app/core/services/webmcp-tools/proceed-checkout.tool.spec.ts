import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createProceedCheckoutTool } from './proceed-checkout.tool';
import { Product } from '@core/models/product.model';
import { Basket } from '@core/models/basket.model';
import { ProceedCheckoutResponse, ErrorObject } from '@core/models/webmcp.model';

describe('ProceedCheckoutTool', () => {
  const mockProduct: Product = {
    id: 'product-1',
    title: 'Angular T-Shirt',
    description: 'A comfortable t-shirt with Angular logo',
    price: 29.99,
    category: 'Apparel',
    imageUrl: '/test.png'
  };

  let mockBasketService: {
    basket: () => Basket<Product>;
  };

  let mockRouter: {
    navigate: ReturnType<typeof vi.fn>;
  };

  let emptyBasket: Basket<Product>;
  let basketWithItems: Basket<Product>;

  beforeEach(() => {
    emptyBasket = {
      items: [],
      totalPrice: 0,
      itemCount: 0
    };

    basketWithItems = {
      items: [
        {
          product: mockProduct,
          quantity: 2
        }
      ],
      totalPrice: 59.98,
      itemCount: 2
    };

    mockBasketService = {
      basket: vi.fn(() => basketWithItems)
    };

    mockRouter = {
      navigate: vi.fn().mockResolvedValue(true)
    };
  });

  describe('Successful navigation with non-empty basket', () => {
    it('should navigate to checkout when basket has items', async () => {
      const tool = createProceedCheckoutTool(mockBasketService as any, mockRouter as any);
      const result = await tool.execute({});

      const response: ProceedCheckoutResponse = JSON.parse(result.content[0].text);

      expect(response.success).toBe(true);
      expect(response.navigated).toBe(true);
      expect(response.message).toContain('Successfully navigated to checkout');
      expect(response.message).toContain('2 item(s)');
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/checkout']);
    });

    it('should navigate to checkout with single item in basket', async () => {
      mockBasketService.basket = vi.fn(() => ({
        items: [{ product: mockProduct, quantity: 1 }],
        totalPrice: 29.99,
        itemCount: 1
      }));

      const tool = createProceedCheckoutTool(mockBasketService as any, mockRouter as any);
      const result = await tool.execute({});

      const response: ProceedCheckoutResponse = JSON.parse(result.content[0].text);

      expect(response.success).toBe(true);
      expect(response.navigated).toBe(true);
      expect(response.message).toContain('1 item(s)');
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/checkout']);
    });

    it('should navigate to checkout with multiple items in basket', async () => {
      mockBasketService.basket = vi.fn(() => ({
        items: [
          { product: mockProduct, quantity: 3 },
          { product: { ...mockProduct, id: 'product-2' }, quantity: 2 }
        ],
        totalPrice: 149.95,
        itemCount: 5
      }));

      const tool = createProceedCheckoutTool(mockBasketService as any, mockRouter as any);
      const result = await tool.execute({});

      const response: ProceedCheckoutResponse = JSON.parse(result.content[0].text);

      expect(response.success).toBe(true);
      expect(response.navigated).toBe(true);
      expect(response.message).toContain('5 item(s)');
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/checkout']);
    });

    it('should work with no parameters provided', async () => {
      const tool = createProceedCheckoutTool(mockBasketService as any, mockRouter as any);
      const result = await tool.execute({});

      const response: ProceedCheckoutResponse = JSON.parse(result.content[0].text);

      expect(response.success).toBe(true);
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/checkout']);
    });

    it('should work with null parameters', async () => {
      const tool = createProceedCheckoutTool(mockBasketService as any, mockRouter as any);
      const result = await tool.execute(null);

      const response: ProceedCheckoutResponse = JSON.parse(result.content[0].text);

      expect(response.success).toBe(true);
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/checkout']);
    });
  });

  describe('Error when basket is empty', () => {
    it('should return error when basket is empty', async () => {
      mockBasketService.basket = vi.fn(() => emptyBasket);

      const tool = createProceedCheckoutTool(mockBasketService as any, mockRouter as any);
      const result = await tool.execute({});

      const errorResponse: ErrorObject = JSON.parse(result.content[0].text);

      expect(errorResponse.error).toBe('Cannot proceed to checkout');
      expect(errorResponse.details).toContain('basket is empty');
      expect(errorResponse.details).toContain('add items');
      expect(errorResponse.code).toBe('EMPTY_BASKET');
      expect(mockRouter.navigate).not.toHaveBeenCalled();
    });

    it('should return error when basket itemCount is 0', async () => {
      mockBasketService.basket = vi.fn(() => ({
        items: [],
        totalPrice: 0,
        itemCount: 0
      }));

      const tool = createProceedCheckoutTool(mockBasketService as any, mockRouter as any);
      const result = await tool.execute({});

      const errorResponse: ErrorObject = JSON.parse(result.content[0].text);

      expect(errorResponse.error).toBe('Cannot proceed to checkout');
      expect(errorResponse.code).toBe('EMPTY_BASKET');
      expect(mockRouter.navigate).not.toHaveBeenCalled();
    });
  });

  describe('Success response structure', () => {
    it('should return correct response structure on success', async () => {
      const tool = createProceedCheckoutTool(mockBasketService as any, mockRouter as any);
      const result = await tool.execute({});

      const response: ProceedCheckoutResponse = JSON.parse(result.content[0].text);

      expect(response).toHaveProperty('success');
      expect(response).toHaveProperty('message');
      expect(response).toHaveProperty('navigated');
      expect(typeof response.success).toBe('boolean');
      expect(typeof response.message).toBe('string');
      expect(typeof response.navigated).toBe('boolean');
    });

    it('should have success=true and navigated=true on successful navigation', async () => {
      const tool = createProceedCheckoutTool(mockBasketService as any, mockRouter as any);
      const result = await tool.execute({});

      const response: ProceedCheckoutResponse = JSON.parse(result.content[0].text);

      expect(response.success).toBe(true);
      expect(response.navigated).toBe(true);
    });

    it('should include item count in success message', async () => {
      mockBasketService.basket = vi.fn(() => ({
        items: [{ product: mockProduct, quantity: 7 }],
        totalPrice: 209.93,
        itemCount: 7
      }));

      const tool = createProceedCheckoutTool(mockBasketService as any, mockRouter as any);
      const result = await tool.execute({});

      const response: ProceedCheckoutResponse = JSON.parse(result.content[0].text);

      expect(response.message).toContain('7 item(s)');
    });
  });

  describe('Error handling for navigation failures', () => {
    it('should handle router navigation errors gracefully', async () => {
      mockRouter.navigate = vi.fn().mockRejectedValue(new Error('Navigation failed'));

      const tool = createProceedCheckoutTool(mockBasketService as any, mockRouter as any);
      const result = await tool.execute({});

      const errorResponse: ErrorObject = JSON.parse(result.content[0].text);

      expect(errorResponse.error).toBe('Failed to proceed to checkout');
      expect(errorResponse.details).toBe('Navigation failed');
      expect(errorResponse.code).toBe('CHECKOUT_NAVIGATION_ERROR');
    });

    it('should handle basket service errors gracefully', async () => {
      mockBasketService.basket = vi.fn(() => {
        throw new Error('Basket state corrupted');
      });

      const tool = createProceedCheckoutTool(mockBasketService as any, mockRouter as any);
      const result = await tool.execute({});

      const errorResponse: ErrorObject = JSON.parse(result.content[0].text);

      expect(errorResponse.error).toBe('Failed to proceed to checkout');
      expect(errorResponse.details).toBe('Basket state corrupted');
      expect(errorResponse.code).toBe('CHECKOUT_NAVIGATION_ERROR');
      expect(mockRouter.navigate).not.toHaveBeenCalled();
    });

    it('should handle unknown errors gracefully', async () => {
      mockBasketService.basket = vi.fn(() => {
        throw 'String error';
      });

      const tool = createProceedCheckoutTool(mockBasketService as any, mockRouter as any);
      const result = await tool.execute({});

      const errorResponse: ErrorObject = JSON.parse(result.content[0].text);

      expect(errorResponse.error).toBe('Failed to proceed to checkout');
      expect(errorResponse.details).toBe('Unknown error');
      expect(errorResponse.code).toBe('CHECKOUT_NAVIGATION_ERROR');
    });
  });

  describe('Tool registration properties', () => {
    it('should have correct tool name', () => {
      const tool = createProceedCheckoutTool(mockBasketService as any, mockRouter as any);
      expect(tool.name).toBe('proceed_checkout');
    });

    it('should have descriptive tool description', () => {
      const tool = createProceedCheckoutTool(mockBasketService as any, mockRouter as any);
      expect(tool.description).toContain('Navigate');
      expect(tool.description).toContain('checkout');
      expect(tool.description).toContain('purchase');
    });

    it('should have empty input schema with no required parameters', () => {
      const tool = createProceedCheckoutTool(mockBasketService as any, mockRouter as any);
      expect(tool.inputSchema.type).toBe('object');
      expect(tool.inputSchema.properties).toEqual({});
      expect(tool.inputSchema.required).toEqual([]);
    });

    it('should have execute function', () => {
      const tool = createProceedCheckoutTool(mockBasketService as any, mockRouter as any);
      expect(typeof tool.execute).toBe('function');
    });
  });
});

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createAddToBasketTool } from './add-to-basket.tool';
import { Product } from '@core/models/product.model';
import { Basket } from '@core/models/basket.model';
import { AddToBasketResponse, ErrorObject } from '@core/models/webmcp.model';

describe('AddToBasketTool - Edge Cases', () => {
  const mockProducts: Product[] = [
    {
      id: 'product-1',
      title: 'Angular T-Shirt',
      description: 'A comfortable t-shirt with Angular logo',
      price: 29.99,
      category: 'Apparel',
      imageUrl: '/test.png'
    },
    {
      id: 'product-2',
      title: 'React Mug',
      description: 'Coffee mug for React developers',
      price: 14.99,
      category: 'Accessories',
      imageUrl: '/test2.png'
    }
  ];

  let mockBasketService: {
    basket: () => Basket<Product>;
    addItem: ReturnType<typeof vi.fn>;
  };

  let mockProductService: {
    products: () => Product[];
  };

  let emptyBasket: Basket<Product>;
  let basketWithProduct: Basket<Product>;
  let basketAtMaxQuantity: Basket<Product>;

  beforeEach(() => {
    emptyBasket = {
      items: [],
      totalPrice: 0,
      itemCount: 0
    };

    basketWithProduct = {
      items: [
        {
          product: mockProducts[0],
          quantity: 5
        }
      ],
      totalPrice: 149.95,
      itemCount: 5
    };

    basketAtMaxQuantity = {
      items: [
        {
          product: mockProducts[0],
          quantity: 99
        }
      ],
      totalPrice: 2969.01,
      itemCount: 99
    };

    mockBasketService = {
      basket: vi.fn(() => emptyBasket),
      addItem: vi.fn()
    };

    mockProductService = {
      products: () => mockProducts
    };
  });

  describe('Maximum quantity limit error', () => {
    it('should return error when product is already at maximum quantity (99)', async () => {
      mockBasketService.basket = vi.fn(() => basketAtMaxQuantity);

      const tool = createAddToBasketTool(mockBasketService as any, mockProductService as any);
      const result = await tool.execute({ productId: 'product-1' });

      const errorResponse: ErrorObject = JSON.parse(result.content[0].text);

      expect(errorResponse.error).toBe('Maximum quantity reached');
      expect(errorResponse.details).toContain('Angular T-Shirt');
      expect(errorResponse.details).toContain('99');
      expect(errorResponse.code).toBe('MAX_QUANTITY_EXCEEDED');
      expect(mockBasketService.addItem).not.toHaveBeenCalled();
    });

    it('should allow adding product when quantity is below maximum', async () => {
      mockBasketService.basket = vi.fn()
        .mockReturnValueOnce(basketWithProduct)
        .mockReturnValueOnce({
          items: [
            {
              product: mockProducts[0],
              quantity: 6
            }
          ],
          totalPrice: 179.94,
          itemCount: 6
        });

      const tool = createAddToBasketTool(mockBasketService as any, mockProductService as any);
      const result = await tool.execute({ productId: 'product-1' });

      const response: AddToBasketResponse = JSON.parse(result.content[0].text);

      expect(response.success).toBe(true);
      expect(response.message).toContain('Increased quantity');
      expect(mockBasketService.addItem).toHaveBeenCalledWith(mockProducts[0]);
    });
  });

  describe('Invalid product ID error', () => {
    it('should return error when product ID does not exist', async () => {
      const tool = createAddToBasketTool(mockBasketService as any, mockProductService as any);
      const result = await tool.execute({ productId: 'nonexistent-id' });

      const errorResponse: ErrorObject = JSON.parse(result.content[0].text);

      expect(errorResponse.error).toBe('Product not found');
      expect(errorResponse.details).toContain('nonexistent-id');
      expect(errorResponse.code).toBe('PRODUCT_NOT_FOUND');
      expect(mockBasketService.addItem).not.toHaveBeenCalled();
    });

    it('should return error when product ID is missing', async () => {
      const tool = createAddToBasketTool(mockBasketService as any, mockProductService as any);
      const result = await tool.execute({});

      const errorResponse: ErrorObject = JSON.parse(result.content[0].text);

      expect(errorResponse.error).toBe('Invalid product ID');
      expect(errorResponse.details).toContain('required');
      expect(errorResponse.code).toBe('INVALID_PRODUCT_ID');
      expect(mockBasketService.addItem).not.toHaveBeenCalled();
    });

    it('should return error when product ID is not a string', async () => {
      const tool = createAddToBasketTool(mockBasketService as any, mockProductService as any);
      const result = await tool.execute({ productId: 123 });

      const errorResponse: ErrorObject = JSON.parse(result.content[0].text);

      expect(errorResponse.error).toBe('Invalid product ID');
      expect(errorResponse.details).toContain('must be a string');
      expect(errorResponse.code).toBe('INVALID_PRODUCT_ID');
      expect(mockBasketService.addItem).not.toHaveBeenCalled();
    });

    it('should return error when product ID is empty string', async () => {
      const tool = createAddToBasketTool(mockBasketService as any, mockProductService as any);
      const result = await tool.execute({ productId: '' });

      const errorResponse: ErrorObject = JSON.parse(result.content[0].text);

      expect(errorResponse.error).toBe('Invalid product ID');
      expect(errorResponse.code).toBe('INVALID_PRODUCT_ID');
      expect(mockBasketService.addItem).not.toHaveBeenCalled();
    });

    it('should return error when parameters are null', async () => {
      const tool = createAddToBasketTool(mockBasketService as any, mockProductService as any);
      const result = await tool.execute(null);

      const errorResponse: ErrorObject = JSON.parse(result.content[0].text);

      expect(errorResponse.error).toBe('Invalid parameters');
      expect(errorResponse.code).toBe('INVALID_PARAMS');
      expect(mockBasketService.addItem).not.toHaveBeenCalled();
    });

    it('should return error when parameters are not an object', async () => {
      const tool = createAddToBasketTool(mockBasketService as any, mockProductService as any);
      const result = await tool.execute('invalid');

      const errorResponse: ErrorObject = JSON.parse(result.content[0].text);

      expect(errorResponse.error).toBe('Invalid parameters');
      expect(errorResponse.code).toBe('INVALID_PARAMS');
      expect(mockBasketService.addItem).not.toHaveBeenCalled();
    });
  });

  describe('Basket state updates correctly', () => {
    it('should add new product to empty basket and return updated state', async () => {
      mockBasketService.basket = vi.fn()
        .mockReturnValueOnce(emptyBasket)
        .mockReturnValueOnce({
          items: [
            {
              product: mockProducts[0],
              quantity: 1
            }
          ],
          totalPrice: 29.99,
          itemCount: 1
        });

      const tool = createAddToBasketTool(mockBasketService as any, mockProductService as any);
      const result = await tool.execute({ productId: 'product-1' });

      const response: AddToBasketResponse = JSON.parse(result.content[0].text);

      expect(response.success).toBe(true);
      expect(response.message).toContain('Added');
      expect(response.message).toContain('Angular T-Shirt');
      expect(response.basket.itemCount).toBe(1);
      expect(response.basket.totalPrice).toBe(29.99);
      expect(mockBasketService.addItem).toHaveBeenCalledWith(mockProducts[0]);
    });

    it('should increment quantity for existing product and return updated state', async () => {
      mockBasketService.basket = vi.fn()
        .mockReturnValueOnce(basketWithProduct)
        .mockReturnValueOnce({
          items: [
            {
              product: mockProducts[0],
              quantity: 6
            }
          ],
          totalPrice: 179.94,
          itemCount: 6
        });

      const tool = createAddToBasketTool(mockBasketService as any, mockProductService as any);
      const result = await tool.execute({ productId: 'product-1' });

      const response: AddToBasketResponse = JSON.parse(result.content[0].text);

      expect(response.success).toBe(true);
      expect(response.message).toContain('Increased quantity');
      expect(response.message).toContain('Angular T-Shirt');
      expect(response.basket.itemCount).toBe(6);
      expect(response.basket.totalPrice).toBe(179.94);
      expect(mockBasketService.addItem).toHaveBeenCalledWith(mockProducts[0]);
    });

    it('should add second product to basket with existing product', async () => {
      mockBasketService.basket = vi.fn()
        .mockReturnValueOnce(basketWithProduct)
        .mockReturnValueOnce({
          items: [
            {
              product: mockProducts[0],
              quantity: 5
            },
            {
              product: mockProducts[1],
              quantity: 1
            }
          ],
          totalPrice: 164.94,
          itemCount: 6
        });

      const tool = createAddToBasketTool(mockBasketService as any, mockProductService as any);
      const result = await tool.execute({ productId: 'product-2' });

      const response: AddToBasketResponse = JSON.parse(result.content[0].text);

      expect(response.success).toBe(true);
      expect(response.message).toContain('Added');
      expect(response.message).toContain('React Mug');
      expect(response.basket.itemCount).toBe(6);
      expect(response.basket.totalPrice).toBe(164.94);
      expect(mockBasketService.addItem).toHaveBeenCalledWith(mockProducts[1]);
    });

    it('should return correct basket state with multiple items', async () => {
      const multiItemBasket: Basket<Product> = {
        items: [
          {
            product: mockProducts[0],
            quantity: 3
          },
          {
            product: mockProducts[1],
            quantity: 2
          }
        ],
        totalPrice: 119.95,
        itemCount: 5
      };

      mockBasketService.basket = vi.fn()
        .mockReturnValueOnce(multiItemBasket)
        .mockReturnValueOnce({
          items: [
            {
              product: mockProducts[0],
              quantity: 4
            },
            {
              product: mockProducts[1],
              quantity: 2
            }
          ],
          totalPrice: 149.94,
          itemCount: 6
        });

      const tool = createAddToBasketTool(mockBasketService as any, mockProductService as any);
      const result = await tool.execute({ productId: 'product-1' });

      const response: AddToBasketResponse = JSON.parse(result.content[0].text);

      expect(response.success).toBe(true);
      expect(response.basket.itemCount).toBe(6);
      expect(response.basket.totalPrice).toBe(149.94);
    });
  });

  describe('Error handling for service failures', () => {
    it('should handle product service errors gracefully', async () => {
      const errorProductService = {
        products: () => {
          throw new Error('Database connection failed');
        }
      };

      const tool = createAddToBasketTool(mockBasketService as any, errorProductService as any);
      const result = await tool.execute({ productId: 'product-1' });

      const errorResponse: ErrorObject = JSON.parse(result.content[0].text);

      expect(errorResponse.error).toBe('Failed to add product to basket');
      expect(errorResponse.details).toBe('Database connection failed');
      expect(errorResponse.code).toBe('ADD_TO_BASKET_ERROR');
      expect(mockBasketService.addItem).not.toHaveBeenCalled();
    });

    it('should handle basket service errors gracefully', async () => {
      mockBasketService.basket = vi.fn(() => {
        throw new Error('Basket state corrupted');
      });

      const tool = createAddToBasketTool(mockBasketService as any, mockProductService as any);
      const result = await tool.execute({ productId: 'product-1' });

      const errorResponse: ErrorObject = JSON.parse(result.content[0].text);

      expect(errorResponse.error).toBe('Failed to add product to basket');
      expect(errorResponse.details).toBe('Basket state corrupted');
      expect(errorResponse.code).toBe('ADD_TO_BASKET_ERROR');
    });

    it('should handle addItem method errors gracefully', async () => {
      mockBasketService.addItem = vi.fn(() => {
        throw new Error('Failed to persist basket');
      });

      const tool = createAddToBasketTool(mockBasketService as any, mockProductService as any);
      const result = await tool.execute({ productId: 'product-1' });

      const errorResponse: ErrorObject = JSON.parse(result.content[0].text);

      expect(errorResponse.error).toBe('Failed to add product to basket');
      expect(errorResponse.details).toBe('Failed to persist basket');
      expect(errorResponse.code).toBe('ADD_TO_BASKET_ERROR');
    });

    it('should handle unknown errors gracefully', async () => {
      mockProductService.products = () => {
        throw 'String error';
      };

      const tool = createAddToBasketTool(mockBasketService as any, mockProductService as any);
      const result = await tool.execute({ productId: 'product-1' });

      const errorResponse: ErrorObject = JSON.parse(result.content[0].text);

      expect(errorResponse.error).toBe('Failed to add product to basket');
      expect(errorResponse.details).toBe('Unknown error');
      expect(errorResponse.code).toBe('ADD_TO_BASKET_ERROR');
    });
  });

  describe('Message formatting', () => {
    it('should use "Added" message for new product', async () => {
      mockBasketService.basket = vi.fn()
        .mockReturnValueOnce(emptyBasket)
        .mockReturnValueOnce({
          items: [{ product: mockProducts[0], quantity: 1 }],
          totalPrice: 29.99,
          itemCount: 1
        });

      const tool = createAddToBasketTool(mockBasketService as any, mockProductService as any);
      const result = await tool.execute({ productId: 'product-1' });

      const response: AddToBasketResponse = JSON.parse(result.content[0].text);

      expect(response.message).toMatch(/^Added/);
      expect(response.message).toContain('Angular T-Shirt');
    });

    it('should use "Increased quantity" message for existing product', async () => {
      mockBasketService.basket = vi.fn()
        .mockReturnValueOnce(basketWithProduct)
        .mockReturnValueOnce({
          items: [{ product: mockProducts[0], quantity: 6 }],
          totalPrice: 179.94,
          itemCount: 6
        });

      const tool = createAddToBasketTool(mockBasketService as any, mockProductService as any);
      const result = await tool.execute({ productId: 'product-1' });

      const response: AddToBasketResponse = JSON.parse(result.content[0].text);

      expect(response.message).toMatch(/^Increased quantity/);
      expect(response.message).toContain('Angular T-Shirt');
    });
  });
});

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createManageBasketQuantityTool } from './manage-basket-quantity.tool';
import { BasketService } from '../basket.service';
import { ProductService } from '../product.service';
import { signal } from '@angular/core';
import { Basket } from '@core/models/basket.model';
import { Product } from '@core/models/product.model';

describe('ManageBasketQuantityTool', () => {
  let mockBasketService: BasketService;
  let mockProductService: ProductService;
  let basketSignal: ReturnType<typeof signal<Basket<Product>>>;
  let productsSignal: ReturnType<typeof signal<Product[]>>;

  const mockProduct: Product = {
    id: 'prod-1',
    title: 'Test Product',
    description: 'Test description',
    price: 29.99,
    discount: 0,
    category: 'Electronics',
    imageUrl: '/test.jpg'
  };

  const mockProduct2: Product = {
    id: 'prod-2',
    title: 'Another Product',
    description: 'Another description',
    price: 49.99,
    discount: 10,
    category: 'Books',
    imageUrl: '/test2.jpg'
  };

  beforeEach(() => {
    // Create signals
    basketSignal = signal<Basket<Product>>({
      items: [
        { product: mockProduct, quantity: 2 },
        { product: mockProduct2, quantity: 1 }
      ],
      totalPrice: 104.97,
      itemCount: 3
    });

    productsSignal = signal<Product[]>([mockProduct, mockProduct2]);

    // Create mock services
    mockBasketService = {
      basket: basketSignal.asReadonly(),
      updateQuantity: vi.fn((productId: string, quantity: number) => {
        const currentBasket = basketSignal();
        const updatedItems = currentBasket.items.map(item => {
          if (item.product.id === productId) {
            return { ...item, quantity };
          }
          return item;
        });

        // Recalculate totals
        let totalPrice = 0;
        let itemCount = 0;
        for (const item of updatedItems) {
          const itemPrice = item.product.discount
            ? item.product.price * (1 - item.product.discount / 100)
            : item.product.price;
          totalPrice += itemPrice * item.quantity;
          itemCount += item.quantity;
        }

        basketSignal.set({
          items: updatedItems,
          totalPrice: Math.round(totalPrice * 100) / 100,
          itemCount
        });
      }),
      removeItem: vi.fn((productId: string) => {
        const currentBasket = basketSignal();
        const updatedItems = currentBasket.items.filter(
          item => item.product.id !== productId
        );

        // Recalculate totals
        let totalPrice = 0;
        let itemCount = 0;
        for (const item of updatedItems) {
          const itemPrice = item.product.discount
            ? item.product.price * (1 - item.product.discount / 100)
            : item.product.price;
          totalPrice += itemPrice * item.quantity;
          itemCount += item.quantity;
        }

        basketSignal.set({
          items: updatedItems,
          totalPrice: Math.round(totalPrice * 100) / 100,
          itemCount
        });
      })
    } as unknown as BasketService;

    mockProductService = {
      products: productsSignal.asReadonly()
    } as unknown as ProductService;
  });

  describe('Tool Registration', () => {
    it('should create tool with correct name and description', () => {
      const tool = createManageBasketQuantityTool(mockBasketService, mockProductService);

      expect(tool.name).toBe('manage_basket_quantity');
      expect(tool.description).toContain('Update the quantity');
      expect(tool.description).toContain('shopping basket');
    });

    it('should have correct input schema', () => {
      const tool = createManageBasketQuantityTool(mockBasketService, mockProductService);

      expect(tool.inputSchema.type).toBe('object');
      expect(tool.inputSchema.properties.productId).toBeDefined();
      expect(tool.inputSchema.properties.quantity).toBeDefined();
      expect(tool.inputSchema.properties.productId.type).toBe('string');
      expect(tool.inputSchema.properties.quantity.type).toBe('number');
      expect(tool.inputSchema.required).toEqual(['productId', 'quantity']);
    });
  });

  describe('Update Quantity', () => {
    it('should update quantity successfully', async () => {
      const tool = createManageBasketQuantityTool(mockBasketService, mockProductService);

      const response = await tool.execute({ productId: 'prod-1', quantity: 5 });
      const result = JSON.parse(response.content[0].text);

      expect(mockBasketService.updateQuantity).toHaveBeenCalledWith('prod-1', 5);
      expect(result.success).toBe(true);
      expect(result.productId).toBe('prod-1');
      expect(result.newQuantity).toBe(5);
      expect(result.message).toContain('Test Product');
      expect(result.message).toContain('2 to 5');
    });

    it('should update quantity to 1', async () => {
      const tool = createManageBasketQuantityTool(mockBasketService, mockProductService);

      const response = await tool.execute({ productId: 'prod-1', quantity: 1 });
      const result = JSON.parse(response.content[0].text);

      expect(mockBasketService.updateQuantity).toHaveBeenCalledWith('prod-1', 1);
      expect(result.success).toBe(true);
      expect(result.newQuantity).toBe(1);
    });

    it('should update quantity to maximum (99)', async () => {
      const tool = createManageBasketQuantityTool(mockBasketService, mockProductService);

      const response = await tool.execute({ productId: 'prod-1', quantity: 99 });
      const result = JSON.parse(response.content[0].text);

      expect(mockBasketService.updateQuantity).toHaveBeenCalledWith('prod-1', 99);
      expect(result.success).toBe(true);
      expect(result.newQuantity).toBe(99);
    });

    it('should return updated basket state', async () => {
      const tool = createManageBasketQuantityTool(mockBasketService, mockProductService);

      const response = await tool.execute({ productId: 'prod-1', quantity: 3 });
      const result = JSON.parse(response.content[0].text);

      expect(result.basket).toBeDefined();
      expect(result.basket.itemCount).toBeDefined();
      expect(result.basket.totalPrice).toBeDefined();
      expect(typeof result.basket.itemCount).toBe('number');
      expect(typeof result.basket.totalPrice).toBe('number');
    });
  });

  describe('Remove Item (Quantity 0)', () => {
    it('should remove item when quantity is 0', async () => {
      const tool = createManageBasketQuantityTool(mockBasketService, mockProductService);

      const response = await tool.execute({ productId: 'prod-1', quantity: 0 });
      const result = JSON.parse(response.content[0].text);

      expect(mockBasketService.removeItem).toHaveBeenCalledWith('prod-1');
      expect(mockBasketService.updateQuantity).not.toHaveBeenCalled();
      expect(result.success).toBe(true);
      expect(result.newQuantity).toBe(0);
      expect(result.message).toContain('Removed');
      expect(result.message).toContain('Test Product');
    });

    it('should return updated basket state after removal', async () => {
      const tool = createManageBasketQuantityTool(mockBasketService, mockProductService);

      const response = await tool.execute({ productId: 'prod-1', quantity: 0 });
      const result = JSON.parse(response.content[0].text);

      expect(result.basket.itemCount).toBe(1); // Only prod-2 remains
    });
  });

  describe('Input Validation', () => {
    it('should return error for non-object parameters', async () => {
      const tool = createManageBasketQuantityTool(mockBasketService, mockProductService);

      const response = await tool.execute('invalid');
      const error = JSON.parse(response.content[0].text);

      expect(error.error).toBe('Invalid parameters');
      expect(error.code).toBe('INVALID_PARAMS');
      expect(mockBasketService.updateQuantity).not.toHaveBeenCalled();
    });

    it('should return error for null parameters', async () => {
      const tool = createManageBasketQuantityTool(mockBasketService, mockProductService);

      const response = await tool.execute(null);
      const error = JSON.parse(response.content[0].text);

      expect(error.error).toBe('Invalid parameters');
      expect(error.code).toBe('INVALID_PARAMS');
    });

    it('should return error for missing productId', async () => {
      const tool = createManageBasketQuantityTool(mockBasketService, mockProductService);

      const response = await tool.execute({ quantity: 5 });
      const error = JSON.parse(response.content[0].text);

      expect(error.error).toBe('Invalid product ID');
      expect(error.code).toBe('INVALID_PRODUCT_ID');
    });

    it('should return error for non-string productId', async () => {
      const tool = createManageBasketQuantityTool(mockBasketService, mockProductService);

      const response = await tool.execute({ productId: 123, quantity: 5 });
      const error = JSON.parse(response.content[0].text);

      expect(error.error).toBe('Invalid product ID');
      expect(error.code).toBe('INVALID_PRODUCT_ID');
    });

    it('should return error for missing quantity', async () => {
      const tool = createManageBasketQuantityTool(mockBasketService, mockProductService);

      const response = await tool.execute({ productId: 'prod-1' });
      const error = JSON.parse(response.content[0].text);

      expect(error.error).toBe('Invalid quantity');
      expect(error.code).toBe('INVALID_QUANTITY_TYPE');
    });

    it('should return error for non-number quantity', async () => {
      const tool = createManageBasketQuantityTool(mockBasketService, mockProductService);

      const response = await tool.execute({ productId: 'prod-1', quantity: '5' });
      const error = JSON.parse(response.content[0].text);

      expect(error.error).toBe('Invalid quantity');
      expect(error.code).toBe('INVALID_QUANTITY_TYPE');
    });

    it('should return error for non-integer quantity', async () => {
      const tool = createManageBasketQuantityTool(mockBasketService, mockProductService);

      const response = await tool.execute({ productId: 'prod-1', quantity: 5.5 });
      const error = JSON.parse(response.content[0].text);

      expect(error.error).toBe('Invalid quantity');
      expect(error.code).toBe('INVALID_QUANTITY_INTEGER');
    });

    it('should return error for negative quantity', async () => {
      const tool = createManageBasketQuantityTool(mockBasketService, mockProductService);

      const response = await tool.execute({ productId: 'prod-1', quantity: -1 });
      const error = JSON.parse(response.content[0].text);

      expect(error.error).toBe('Invalid quantity range');
      expect(error.code).toBe('INVALID_QUANTITY_RANGE');
      expect(error.details).toContain('0 and 99');
    });

    it('should return error for quantity above maximum', async () => {
      const tool = createManageBasketQuantityTool(mockBasketService, mockProductService);

      const response = await tool.execute({ productId: 'prod-1', quantity: 100 });
      const error = JSON.parse(response.content[0].text);

      expect(error.error).toBe('Invalid quantity range');
      expect(error.code).toBe('INVALID_QUANTITY_RANGE');
    });

    it('should return error for product not in catalog', async () => {
      const tool = createManageBasketQuantityTool(mockBasketService, mockProductService);

      const response = await tool.execute({ productId: 'invalid-id', quantity: 5 });
      const error = JSON.parse(response.content[0].text);

      expect(error.error).toBe('Product not found');
      expect(error.code).toBe('PRODUCT_NOT_FOUND');
      expect(error.details).toContain('invalid-id');
    });

    it('should return error for product not in basket', async () => {
      const tool = createManageBasketQuantityTool(mockBasketService, mockProductService);

      // Add a product to catalog but not to basket
      const newProduct: Product = {
        id: 'prod-3',
        title: 'New Product',
        description: 'New description',
        price: 19.99,
        discount: 0,
        category: 'Stickers',
        imageUrl: '/test3.jpg'
      };
      productsSignal.set([...productsSignal(), newProduct]);

      const response = await tool.execute({ productId: 'prod-3', quantity: 5 });
      const error = JSON.parse(response.content[0].text);

      expect(error.error).toBe('Product not in basket');
      expect(error.code).toBe('PRODUCT_NOT_IN_BASKET');
      expect(error.details).toContain('New Product');
      expect(error.details).toContain('Add it first');
    });
  });

  describe('Error Handling', () => {
    it('should handle basket service errors gracefully', async () => {
      const tool = createManageBasketQuantityTool(mockBasketService, mockProductService);
      vi.spyOn(mockBasketService, 'updateQuantity').mockImplementation(() => {
        throw new Error('Basket update failed');
      });

      const response = await tool.execute({ productId: 'prod-1', quantity: 5 });
      const error = JSON.parse(response.content[0].text);

      expect(error.error).toBe('Failed to manage basket quantity');
      expect(error.details).toBe('Basket update failed');
      expect(error.code).toBe('MANAGE_QUANTITY_ERROR');
    });

    it('should handle product service errors gracefully', async () => {
      const tool = createManageBasketQuantityTool(mockBasketService, mockProductService);
      vi.spyOn(mockProductService, 'products').mockImplementation(() => {
        throw new Error('Product service error');
      });

      const response = await tool.execute({ productId: 'prod-1', quantity: 5 });
      const error = JSON.parse(response.content[0].text);

      expect(error.error).toBe('Failed to manage basket quantity');
      expect(error.details).toBe('Product service error');
      expect(error.code).toBe('MANAGE_QUANTITY_ERROR');
    });

    it('should handle unknown errors gracefully', async () => {
      const tool = createManageBasketQuantityTool(mockBasketService, mockProductService);
      vi.spyOn(mockBasketService, 'updateQuantity').mockImplementation(() => {
        throw 'String error';
      });

      const response = await tool.execute({ productId: 'prod-1', quantity: 5 });
      const error = JSON.parse(response.content[0].text);

      expect(error.error).toBe('Failed to manage basket quantity');
      expect(error.details).toBe('Unknown error');
      expect(error.code).toBe('MANAGE_QUANTITY_ERROR');
    });
  });

  describe('Response Structure', () => {
    it('should return correct response structure for successful update', async () => {
      const tool = createManageBasketQuantityTool(mockBasketService, mockProductService);

      const response = await tool.execute({ productId: 'prod-1', quantity: 5 });

      expect(response.content).toHaveLength(1);
      expect(response.content[0].type).toBe('text');

      const result = JSON.parse(response.content[0].text);
      expect(result).toHaveProperty('success');
      expect(result).toHaveProperty('message');
      expect(result).toHaveProperty('productId');
      expect(result).toHaveProperty('newQuantity');
      expect(result).toHaveProperty('basket');
      expect(result.basket).toHaveProperty('itemCount');
      expect(result.basket).toHaveProperty('totalPrice');
    });

    it('should return correct response structure for removal', async () => {
      const tool = createManageBasketQuantityTool(mockBasketService, mockProductService);

      const response = await tool.execute({ productId: 'prod-1', quantity: 0 });

      const result = JSON.parse(response.content[0].text);
      expect(result.success).toBe(true);
      expect(result.newQuantity).toBe(0);
      expect(result.productId).toBe('prod-1');
    });
  });
});

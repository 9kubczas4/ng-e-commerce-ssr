import {
  ToolRegistration,
  ToolResponse,
  ErrorObject
} from '@core/models/webmcp.model';
import { BasketService } from '../basket.service';
import { ProductService } from '../product.service';

const MAX_QUANTITY = 99;

/**
 * Parameters for manage_basket_quantity tool
 */
export interface ManageBasketQuantityParams {
  productId: string;
  quantity: number;
}

/**
 * Response from manage_basket_quantity tool
 */
export interface ManageBasketQuantityResponse {
  success: boolean;
  message: string;
  productId: string;
  newQuantity: number;
  basket: {
    itemCount: number;
    totalPrice: number;
  };
}

/**
 * Creates the manage_basket_quantity WebMCP tool
 * Allows AI agents to update the quantity of items in the shopping basket
 */
export function createManageBasketQuantityTool(
  basketService: BasketService,
  productService: ProductService
): ToolRegistration {

  return {
    name: 'manage_basket_quantity',
    description: 'Update the quantity of a product in the shopping basket. Use this tool when the user wants to change how many of a specific item they have in their cart. You can increase or decrease the quantity. The quantity must be between 1 and 99. To remove an item completely, set quantity to 0 or use a separate remove tool if available.',
    inputSchema: {
      type: 'object',
      properties: {
        productId: {
          type: 'string',
          description: 'The unique identifier of the product whose quantity should be updated. Must be a valid product ID that exists in the basket.'
        },
        quantity: {
          type: 'number',
          description: `The new quantity for the product. Must be a positive integer between 1 and ${MAX_QUANTITY}. Set to 0 to remove the item from the basket.`
        }
      },
      required: ['productId', 'quantity']
    },
    execute: async (params: unknown): Promise<ToolResponse> => {
      try {
        // Validate parameters object
        if (!params || typeof params !== 'object') {
          const errorObj: ErrorObject = {
            error: 'Invalid parameters',
            details: 'Parameters must be an object',
            code: 'INVALID_PARAMS'
          };
          return {
            content: [{
              type: 'text',
              text: JSON.stringify(errorObj)
            }]
          };
        }

        const quantityParams = params as ManageBasketQuantityParams;

        // Validate productId
        if (!quantityParams.productId || typeof quantityParams.productId !== 'string') {
          const errorObj: ErrorObject = {
            error: 'Invalid product ID',
            details: 'Product ID is required and must be a string',
            code: 'INVALID_PRODUCT_ID'
          };
          return {
            content: [{
              type: 'text',
              text: JSON.stringify(errorObj)
            }]
          };
        }

        // Validate quantity type
        if (quantityParams.quantity === undefined || typeof quantityParams.quantity !== 'number') {
          const errorObj: ErrorObject = {
            error: 'Invalid quantity',
            details: 'Quantity is required and must be a number',
            code: 'INVALID_QUANTITY_TYPE'
          };
          return {
            content: [{
              type: 'text',
              text: JSON.stringify(errorObj)
            }]
          };
        }

        // Validate quantity is an integer
        if (!Number.isInteger(quantityParams.quantity)) {
          const errorObj: ErrorObject = {
            error: 'Invalid quantity',
            details: 'Quantity must be an integer',
            code: 'INVALID_QUANTITY_INTEGER'
          };
          return {
            content: [{
              type: 'text',
              text: JSON.stringify(errorObj)
            }]
          };
        }

        // Validate quantity range (0 to MAX_QUANTITY, where 0 means remove)
        if (quantityParams.quantity < 0 || quantityParams.quantity > MAX_QUANTITY) {
          const errorObj: ErrorObject = {
            error: 'Invalid quantity range',
            details: `Quantity must be between 0 and ${MAX_QUANTITY}. Use 0 to remove the item.`,
            code: 'INVALID_QUANTITY_RANGE'
          };
          return {
            content: [{
              type: 'text',
              text: JSON.stringify(errorObj)
            }]
          };
        }

        // Check if product exists in catalog
        const products = productService.products();
        const product = products.find(p => p.id === quantityParams.productId);

        if (!product) {
          const errorObj: ErrorObject = {
            error: 'Product not found',
            details: `No product found with ID: ${quantityParams.productId}`,
            code: 'PRODUCT_NOT_FOUND'
          };
          return {
            content: [{
              type: 'text',
              text: JSON.stringify(errorObj)
            }]
          };
        }

        // Check if product is in basket
        const currentBasket = basketService.basket();
        const basketItem = currentBasket.items.find(
          item => item.product.id === quantityParams.productId
        );

        if (!basketItem) {
          const errorObj: ErrorObject = {
            error: 'Product not in basket',
            details: `Product "${product.title}" is not in the basket. Add it first before updating quantity.`,
            code: 'PRODUCT_NOT_IN_BASKET'
          };
          return {
            content: [{
              type: 'text',
              text: JSON.stringify(errorObj)
            }]
          };
        }

        // Handle quantity = 0 (remove item)
        if (quantityParams.quantity === 0) {
          basketService.removeItem(quantityParams.productId);
          const updatedBasket = basketService.basket();

          const response: Omit<ManageBasketQuantityResponse, 'newQuantity'> & { newQuantity: number } = {
            success: true,
            message: `Removed "${product.title}" from basket`,
            productId: quantityParams.productId,
            newQuantity: 0,
            basket: {
              itemCount: updatedBasket.itemCount,
              totalPrice: updatedBasket.totalPrice
            }
          };

          return {
            content: [{
              type: 'text',
              text: JSON.stringify(response)
            }]
          };
        }

        // Update quantity
        const oldQuantity = basketItem.quantity;
        basketService.updateQuantity(quantityParams.productId, quantityParams.quantity);

        // Get updated basket state
        const updatedBasket = basketService.basket();

        // Build success response
        const response: ManageBasketQuantityResponse = {
          success: true,
          message: `Updated "${product.title}" quantity from ${oldQuantity} to ${quantityParams.quantity}`,
          productId: quantityParams.productId,
          newQuantity: quantityParams.quantity,
          basket: {
            itemCount: updatedBasket.itemCount,
            totalPrice: updatedBasket.totalPrice
          }
        };

        return {
          content: [{
            type: 'text',
            text: JSON.stringify(response)
          }]
        };
      } catch (error) {
        // Handle errors gracefully
        const errorObj: ErrorObject = {
          error: 'Failed to manage basket quantity',
          details: error instanceof Error ? error.message : 'Unknown error',
          code: 'MANAGE_QUANTITY_ERROR'
        };

        console.error('Manage basket quantity tool error:', error);

        return {
          content: [{
            type: 'text',
            text: JSON.stringify(errorObj)
          }]
        };
      }
    }
  };
}

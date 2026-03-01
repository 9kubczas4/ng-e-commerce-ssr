import {
  ToolRegistration,
  ToolResponse,
  AddToBasketParams,
  AddToBasketResponse,
  ErrorObject
} from '@core/models/webmcp.model';
import { BasketService } from '../basket.service';
import { ProductService } from '../product.service';

const MAX_QUANTITY = 99;

/**
 * Creates the add_product_to_basket WebMCP tool
 * Allows AI agents to add products to the user's shopping basket
 * Validates product existence and quantity limits before adding
 */
export function createAddToBasketTool(
  basketService: BasketService,
  productService: ProductService
): ToolRegistration {

  return {
    name: 'add_product_to_basket',
    description: 'Add a product to the shopping basket. Use this tool when the user wants to add an item to their cart. Provide the product ID to add. If the product already exists in the basket, its quantity will be incremented by 1. The tool validates that the product exists and respects the maximum quantity limit.',
    inputSchema: {
      type: 'object',
      properties: {
        productId: {
          type: 'string',
          description: 'The unique identifier of the product to add to the basket. Must be a valid product ID from the catalog.'
        }
      },
      required: ['productId']
    },
    execute: async (params: unknown): Promise<ToolResponse> => {
      try {
        // Validate parameters
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

        const addParams = params as AddToBasketParams;

        // Validate productId is provided
        if (!addParams.productId || typeof addParams.productId !== 'string') {
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

        // Find the product in the catalog
        const products = productService.products();
        const product = products.find(p => p.id === addParams.productId);

        if (!product) {
          const errorObj: ErrorObject = {
            error: 'Product not found',
            details: `No product found with ID: ${addParams.productId}`,
            code: 'PRODUCT_NOT_FOUND'
          };
          return {
            content: [{
              type: 'text',
              text: JSON.stringify(errorObj)
            }]
          };
        }

        // Check if product is already in basket and at max quantity
        const currentBasket = basketService.basket();
        const existingItem = currentBasket.items.find(
          item => item.product.id === addParams.productId
        );

        if (existingItem && existingItem.quantity >= MAX_QUANTITY) {
          const errorObj: ErrorObject = {
            error: 'Maximum quantity reached',
            details: `Product "${product.title}" is already at maximum quantity (${MAX_QUANTITY}) in the basket`,
            code: 'MAX_QUANTITY_EXCEEDED'
          };
          return {
            content: [{
              type: 'text',
              text: JSON.stringify(errorObj)
            }]
          };
        }

        // Add product to basket
        basketService.addItem(product);

        // Get updated basket state
        const updatedBasket = basketService.basket();

        // Build success response
        const response: AddToBasketResponse = {
          success: true,
          message: existingItem
            ? `Increased quantity of "${product.title}" in basket`
            : `Added "${product.title}" to basket`,
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
        // Handle unexpected errors gracefully
        const errorObj: ErrorObject = {
          error: 'Failed to add product to basket',
          details: error instanceof Error ? error.message : 'Unknown error',
          code: 'ADD_TO_BASKET_ERROR'
        };

        console.error('Add to basket tool error:', error);

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

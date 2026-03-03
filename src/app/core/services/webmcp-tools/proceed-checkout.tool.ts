import { Router } from '@angular/router';
import {
  ToolRegistration,
  ToolResponse,
  ProceedCheckoutResponse,
  ErrorObject
} from '@core/models/webmcp.model';
import { BasketService } from '../basket.service';

/**
 * Creates the proceed_checkout WebMCP tool
 * Allows AI agents to navigate users to the checkout page
 * Validates that the basket is not empty before navigation
 */
export function createProceedCheckoutTool(
  basketService: BasketService,
  router: Router
): ToolRegistration {

  return {
    name: 'proceed_checkout',
    description: 'Navigate the user to the checkout page to complete their purchase. Use this tool when the user is ready to checkout and complete their order. The tool validates that the basket is not empty before navigating. No parameters are required.',
    inputSchema: {
      type: 'object',
      properties: {},
      required: []
    },
    execute: async (params: unknown): Promise<ToolResponse> => {
      try {
        // Check if basket is empty
        const currentBasket = basketService.basket();

        if (currentBasket.itemCount === 0) {
          const errorObj: ErrorObject = {
            error: 'Cannot proceed to checkout',
            details: 'The basket is empty. Please add items to the basket before proceeding to checkout.',
            code: 'EMPTY_BASKET'
          };
          return {
            content: [{
              type: 'text',
              text: JSON.stringify(errorObj)
            }]
          };
        }

        // Navigate to checkout
        await router.navigate(['/checkout']);

        // Build success response
        const response: ProceedCheckoutResponse = {
          success: true,
          message: `Successfully navigated to checkout with ${currentBasket.itemCount} item(s) in basket`,
          navigated: true
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
          error: 'Failed to proceed to checkout',
          details: error instanceof Error ? error.message : 'Unknown error',
          code: 'CHECKOUT_NAVIGATION_ERROR'
        };

        console.error('Proceed to checkout tool error:', error);

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

import { Router } from '@angular/router';
import { ProductService } from '../product.service';

export interface NavigateToPageInput {
  page: 'complaint' | 'product_detail' | 'home' | 'checkout';
  productId?: string;
}

export function createNavigateToPageTool(router: Router, productService: ProductService) {
  return {
    name: 'navigate_to_page',
    description: 'Navigate to different pages in the application. Use this when the user wants to view a specific page like the complaint form, product details, home page, or checkout.',
    inputSchema: {
      type: 'object',
      properties: {
        page: {
          type: 'string',
          enum: ['complaint', 'product_detail', 'home', 'checkout'],
          description: 'The page to navigate to. Use "complaint" for the complaint form, "product_detail" to view a specific product, "home" for the product catalog, or "checkout" for the checkout page.'
        },
        productId: {
          type: 'string',
          description: 'Required when page is "product_detail". The ID of the product to view. Must be a valid product ID from the catalog.'
        }
      },
      required: ['page']
    },
    execute: async (input: NavigateToPageInput) => {
      try {
        // Input validation
        if (!input || typeof input !== 'object') {
          return {
            content: [{
              type: 'text',
              text: JSON.stringify({
                success: false,
                error: 'INVALID_INPUT',
                message: 'Input must be an object'
              })
            }]
          };
        }

        const { page, productId } = input;

        // Validate page parameter
        if (!page || typeof page !== 'string') {
          return {
            content: [{
              type: 'text',
              text: JSON.stringify({
                success: false,
                error: 'MISSING_PAGE',
                message: 'Page parameter is required and must be a string'
              })
            }]
          };
        }

        const validPages = ['complaint', 'product_detail', 'home', 'checkout'];
        if (!validPages.includes(page)) {
          return {
            content: [{
              type: 'text',
              text: JSON.stringify({
                success: false,
                error: 'INVALID_PAGE',
                message: `Invalid page "${page}". Must be one of: ${validPages.join(', ')}`
              })
            }]
          };
        }

        // Handle product_detail navigation
        if (page === 'product_detail') {
          if (!productId || typeof productId !== 'string') {
            return {
              content: [{
                type: 'text',
                text: JSON.stringify({
                  success: false,
                  error: 'MISSING_PRODUCT_ID',
                  message: 'productId is required when navigating to product_detail'
                })
              }]
            };
          }

          // Validate product exists
          const product = productService.getProductById(productId);
          if (!product) {
            return {
              content: [{
                type: 'text',
                text: JSON.stringify({
                  success: false,
                  error: 'PRODUCT_NOT_FOUND',
                  message: `Product with ID "${productId}" not found`
                })
              }]
            };
          }

          await router.navigate(['/product', productId]);
          return {
            content: [{
              type: 'text',
              text: JSON.stringify({
                success: true,
                message: `Navigated to product detail page for "${product.title}"`,
                productId,
                productTitle: product.title
              })
            }]
          };
        }

        // Handle other page navigations
        const routeMap: Record<string, string> = {
          complaint: '/complaint',
          home: '/product',
          checkout: '/checkout'
        };

        const route = routeMap[page];
        await router.navigate([route]);

        const pageNames: Record<string, string> = {
          complaint: 'complaint form',
          home: 'home page (product catalog)',
          checkout: 'checkout page'
        };

        return {
          content: [{
            type: 'text',
            text: JSON.stringify({
              success: true,
              message: `Navigated to ${pageNames[page]}`,
              page
            })
          }]
        };

      } catch (error) {
        console.error('[WebMCP] navigate_to_page error:', error);
        return {
          content: [{
            type: 'text',
            text: JSON.stringify({
              success: false,
              error: 'NAVIGATION_ERROR',
              message: error instanceof Error ? error.message : 'Unknown error during navigation'
            })
          }]
        };
      }
    }
  };
}

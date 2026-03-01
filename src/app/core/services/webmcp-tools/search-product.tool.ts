import {
  ToolRegistration,
  ToolResponse,
  SearchProductParams,
  SearchProductResponse,
  ErrorObject
} from '@core/models/webmcp.model';
import { ProductService } from '../product.service';
import { SearchState } from '../search-state.service';

/**
 * Creates the search_product WebMCP tool
 * Allows AI agents to search for products by query and/or category
 * Syncs search state with the UI for visual feedback
 */
export function createSearchProductTool(
  productService: ProductService,
  searchStateService: SearchState
): ToolRegistration {

  return {
    name: 'search_product',
    description: 'Search for products in the Angular Dev Shop catalog. Use this tool when the user wants to find products by name, description, or category. You can search by query text (matches title and description), filter by category, or combine both. If no query is provided, all products (or all products in the specified category) are returned.',
    inputSchema: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'Search query to match against product titles and descriptions. Leave empty to return all products.'
        },
        category: {
          type: 'string',
          description: 'Filter products by category. Valid categories: Apparel, Accessories, Books, Stickers, Electronics.',
          enum: ['Apparel', 'Accessories', 'Books', 'Stickers', 'Electronics']
        }
      }
    },
    execute: async (params: unknown): Promise<ToolResponse> => {
      try {
        // Validate and cast parameters
        const searchParams = params as SearchProductParams;

        // Sync UI state with search parameters
        searchStateService.setSearchState(
          searchParams.query || '',
          searchParams.category || null
        );

        // Get all products
        let products = productService.products();

        // Apply category filter if provided
        if (searchParams.category) {
          products = productService.filterByCategory(searchParams.category, products);
        }

        // Apply search query if provided
        if (searchParams.query !== undefined) {
          products = productService.searchProducts(searchParams.query, products);
        }

        // Build response
        const response: SearchProductResponse = {
          products,
          count: products.length,
          message: products.length === 0
            ? 'No products found matching your search criteria.'
            : `Found ${products.length} product${products.length === 1 ? '' : 's'}.`
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
          error: 'Failed to search products',
          details: error instanceof Error ? error.message : 'Unknown error',
          code: 'SEARCH_ERROR'
        };

        console.error('Search product tool error:', error);

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

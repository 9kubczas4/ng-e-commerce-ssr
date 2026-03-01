import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { createSearchProductTool } from './webmcp-tools/search-product.tool';
import { createAddToBasketTool } from './webmcp-tools/add-to-basket.tool';
import { createProceedCheckoutTool } from './webmcp-tools/proceed-checkout.tool';
import { ProductService } from './product.service';
import { SearchState } from './search-state.service';
import { BasketService } from './basket.service';

@Injectable({
  providedIn: 'root'
})
export class WebMCPService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly productService = inject(ProductService);
  private readonly searchState = inject(SearchState);
  private readonly basketService = inject(BasketService);
  private readonly router = inject(Router);
  private toolsRegistered = false;

  isWebMCPAvailable(): boolean {
    if (!isPlatformBrowser(this.platformId)) {
      return false;
    }

    return typeof navigator !== 'undefined' && 'modelContext' in navigator;
  }

  initializeTools(): void {
    // Skip registration in SSR context
    if (!isPlatformBrowser(this.platformId)) {
      console.log('[WebMCP] Skipping tool registration in SSR context');
      return;
    }

    // Check if WebMCP API is available
    if (!this.isWebMCPAvailable()) {
      console.warn('[WebMCP] WebMCP API not available. Tools will not be registered.');
      return;
    }

    // Prevent duplicate registration
    if (this.toolsRegistered) {
      console.log('[WebMCP] Tools already registered');
      return;
    }

    try {
      // Register tools
      const nav = navigator as Navigator & {
        modelContext?: {
          registerTool: (tool: unknown) => void;
          clearContext: () => void;
        };
      };

      // Register search_product tool
      try {
        const searchProductTool = createSearchProductTool(this.productService, this.searchState);
        nav.modelContext?.registerTool(searchProductTool);
        console.log('[WebMCP] Registered search_product tool');
      } catch (error) {
        console.error('[WebMCP] Failed to register search_product tool:', error);
      }

      // Register add_product_to_basket tool
      try {
        const addToBasketTool = createAddToBasketTool(this.basketService, this.productService);
        nav.modelContext?.registerTool(addToBasketTool);
        console.log('[WebMCP] Registered add_product_to_basket tool');
      } catch (error) {
        console.error('[WebMCP] Failed to register add_product_to_basket tool:', error);
      }

      // Register proceed_checkout tool
      try {
        const proceedCheckoutTool = createProceedCheckoutTool(this.basketService, this.router);
        nav.modelContext?.registerTool(proceedCheckoutTool);
        console.log('[WebMCP] Registered proceed_checkout tool');
      } catch (error) {
        console.error('[WebMCP] Failed to register proceed_checkout tool:', error);
      }

      this.toolsRegistered = true;
      console.log('[WebMCP] Tools registered successfully');
    } catch (error) {
      console.error('[WebMCP] Error registering tools:', error);
      // Don't throw - allow application to continue without WebMCP
    }
  }

  destroyTools(): void {
    // Skip cleanup in SSR context
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    // Check if WebMCP API is available
    if (!this.isWebMCPAvailable()) {
      return;
    }

    // Only clean up if tools were registered
    if (!this.toolsRegistered) {
      return;
    }

    try {
      // Use clearContext to remove all registered tools at once
      const nav = navigator as Navigator & { modelContext?: { clearContext: () => void } };
      nav.modelContext?.clearContext();
      this.toolsRegistered = false;
      console.log('[WebMCP] Tools unregistered successfully');
    } catch (error) {
      console.error('[WebMCP] Error unregistering tools:', error);
    }
  }
}

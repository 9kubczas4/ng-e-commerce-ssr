import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { createSearchProductTool } from './webmcp-tools/search-product.tool';
import { createAddToBasketTool } from './webmcp-tools/add-to-basket.tool';
import { createProceedCheckoutTool } from './webmcp-tools/proceed-checkout.tool';
import { createToggleThemeTool } from './webmcp-tools/toggle-theme.tool';
import { createManageBasketQuantityTool } from './webmcp-tools/manage-basket-quantity.tool';
import { createNavigateToPageTool } from './webmcp-tools/navigate-to-page.tool';
import { ProductService } from './product.service';
import { SearchState } from './search-state.service';
import { BasketService } from './basket.service';
import { ThemeService } from './theme.service';

interface ModelContextAPI {
  registerTool: (tool: unknown) => void;
  clearContext: () => void;
}

type NavigatorWithModelContext = Navigator & { modelContext?: ModelContextAPI };

@Injectable({
  providedIn: 'root'
})
export class WebMCPService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly productService = inject(ProductService);
  private readonly searchState = inject(SearchState);
  private readonly basketService = inject(BasketService);
  private readonly router = inject(Router);
  private readonly themeService = inject(ThemeService);
  private toolsRegistered = false;

  isWebMCPAvailable(): boolean {
    return isPlatformBrowser(this.platformId) &&
           typeof navigator !== 'undefined' &&
           'modelContext' in navigator;
  }

  initializeTools(): void {
    if (!this.canRegisterTools()) {
      return;
    }

    try {
      const modelContext = this.getModelContext();

      this.registerTool(modelContext, 'search_product', () =>
        createSearchProductTool(this.productService, this.searchState)
      );

      this.registerTool(modelContext, 'add_product_to_basket', () =>
        createAddToBasketTool(this.basketService, this.productService)
      );

      this.registerTool(modelContext, 'proceed_checkout', () =>
        createProceedCheckoutTool(this.basketService, this.router)
      );

      this.registerTool(modelContext, 'toggle_theme', () =>
        createToggleThemeTool(this.themeService)
      );

      this.registerTool(modelContext, 'manage_basket_quantity', () =>
        createManageBasketQuantityTool(this.basketService, this.productService)
      );

      this.registerTool(modelContext, 'navigate_to_page', () =>
        createNavigateToPageTool(this.router, this.productService)
      );

      this.toolsRegistered = true;
      console.log('[WebMCP] Tools registered successfully');
    } catch (error) {
      console.error('[WebMCP] Error registering tools:', error);
    }
  }

  destroyTools(): void {
    if (!this.isWebMCPAvailable() || !this.toolsRegistered) {
      return;
    }

    try {
      this.getModelContext()?.clearContext();
      this.toolsRegistered = false;
      console.log('[WebMCP] Tools unregistered successfully');
    } catch (error) {
      console.error('[WebMCP] Error unregistering tools:', error);
    }
  }

  private canRegisterTools(): boolean {
    if (!isPlatformBrowser(this.platformId)) {
      console.log('[WebMCP] Skipping tool registration in SSR context');
      return false;
    }

    if (!this.isWebMCPAvailable()) {
      console.warn('[WebMCP] WebMCP API not available. Tools will not be registered.');
      return false;
    }

    if (this.toolsRegistered) {
      console.log('[WebMCP] Tools already registered');
      return false;
    }

    return true;
  }

  private getModelContext(): ModelContextAPI | undefined {
    return (navigator as NavigatorWithModelContext).modelContext;
  }

  private registerTool(modelContext: ModelContextAPI | undefined, name: string, factory: () => unknown): void {
    try {
      const tool = factory();
      modelContext?.registerTool(tool);
      console.log(`[WebMCP] Registered ${name} tool`);
    } catch (error) {
      console.error(`[WebMCP] Failed to register ${name} tool:`, error);
    }
  }
}

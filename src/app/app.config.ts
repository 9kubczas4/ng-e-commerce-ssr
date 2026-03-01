import { ApplicationConfig, provideBrowserGlobalErrorListeners, APP_INITIALIZER } from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';

import { routes } from './app.routes';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { WebMCPService } from '@core/services/webmcp.service';
import { ProductService } from '@core/services/product.service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes, withComponentInputBinding()),
    provideClientHydration(withEventReplay()),
    {
      provide: APP_INITIALIZER,
      useFactory: (webmcpService: WebMCPService, productService: ProductService) => {
        return () => {
          webmcpService.initializeTools(productService);
        };
      },
      deps: [WebMCPService, ProductService],
      multi: true
    }
  ],
};

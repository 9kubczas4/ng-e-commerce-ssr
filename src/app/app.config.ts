import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideAppInitializer, inject, DestroyRef } from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';

import { routes } from './app.routes';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { WebMCPService } from '@core/services/webmcp.service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes, withComponentInputBinding()),
    provideClientHydration(withEventReplay()),
    provideAppInitializer(() => {
      const webmcpService = inject(WebMCPService);
      const destroyRef = inject(DestroyRef);

      // Initialize WebMCP tools (only runs in browser context)
      webmcpService.initializeTools();

      // Register cleanup on application destroy
      destroyRef.onDestroy(() => {
        webmcpService.destroyTools();
      });
    })
  ],
};

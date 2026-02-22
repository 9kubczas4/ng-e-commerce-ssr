import { Injectable, PLATFORM_ID, inject, signal, effect } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

export type Theme = 'light' | 'dark';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private platformId = inject(PLATFORM_ID);
  private readonly STORAGE_KEY = 'angular-dev-shop-theme';

  private themeSignal = signal<Theme>(this.loadTheme());

  // Read-only signal for consumers
  currentTheme = this.themeSignal.asReadonly();

  constructor() {
    // Apply theme on initialization
    this.applyTheme(this.themeSignal());

    // Set up effect to apply and save theme whenever it changes
    effect(() => {
      const theme = this.themeSignal();
      this.applyTheme(theme);
      this.saveTheme(theme);
    });
  }

  /**
   * Toggle between light and dark themes
   */
  toggleTheme(): void {
    const newTheme: Theme = this.themeSignal() === 'light' ? 'dark' : 'light';
    this.themeSignal.set(newTheme);
  }

  /**
   * Set a specific theme
   */
  setTheme(theme: Theme): void {
    this.themeSignal.set(theme);
  }

  /**
   * Apply theme by setting data-theme attribute on document root
   * Adds smooth transition class during theme change
   */
  private applyTheme(theme: Theme): void {
    if (isPlatformBrowser(this.platformId)) {
      const root = document.documentElement;

      // Add transition class for smooth theme switching
      root.classList.add('theme-transition');

      // Set the new theme
      root.setAttribute('data-theme', theme);

      // Remove transition class after animation completes
      setTimeout(() => {
        root.classList.remove('theme-transition');
      }, 300);
    }
  }

  /**
   * Save theme preference to LocalStorage
   */
  private saveTheme(theme: Theme): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    try {
      // Check if localStorage is available
      if (!this.isLocalStorageAvailable()) {
        console.warn('LocalStorage is not available. Theme preference will not be persisted.');
        return;
      }

      localStorage.setItem(this.STORAGE_KEY, theme);
    } catch (error) {
      this.handleStorageError(error, 'save');
    }
  }

  /**
   * Load theme preference from LocalStorage
   */
  private loadTheme(): Theme {
    if (isPlatformBrowser(this.platformId)) {
      try {
        // Check if localStorage is available
        if (!this.isLocalStorageAvailable()) {
          console.warn('LocalStorage is not available. Using default theme.');
          return 'light';
        }

        const savedTheme = localStorage.getItem(this.STORAGE_KEY);

        // Validate theme value
        if (savedTheme === 'light' || savedTheme === 'dark') {
          return savedTheme;
        } else if (savedTheme !== null) {
          console.warn(`Invalid theme value in LocalStorage: "${savedTheme}". Using default theme.`);
        }
      } catch (error) {
        this.handleStorageError(error, 'load');
      }
    }
    return 'light'; // Default theme
  }

  /**
   * Check if LocalStorage is available and accessible
   */
  private isLocalStorageAvailable(): boolean {
    try {
      const testKey = '__angular_dev_shop_test__';
      localStorage.setItem(testKey, 'test');
      localStorage.removeItem(testKey);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Handle storage errors with specific error types
   */
  private handleStorageError(error: unknown, operation: 'save' | 'load'): void {
    if (error instanceof Error) {
      if (error.name === 'QuotaExceededError') {
        console.error(
          `LocalStorage quota exceeded while trying to ${operation} theme. ` +
          'This is unusual for theme data. Consider clearing browser storage.'
        );
      } else if (error.name === 'SecurityError') {
        console.error(
          `LocalStorage access denied (SecurityError) while trying to ${operation} theme. ` +
          'This may occur in private browsing mode or due to browser security settings.'
        );
      } else {
        console.error(`Failed to ${operation} theme to/from LocalStorage:`, error.message);
      }
    } else {
      console.error(`Unknown error occurred while trying to ${operation} theme:`, error);
    }
  }
}

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
   */
  private applyTheme(theme: Theme): void {
    if (isPlatformBrowser(this.platformId)) {
      document.documentElement.setAttribute('data-theme', theme);
    }
  }

  /**
   * Save theme preference to LocalStorage
   */
  private saveTheme(theme: Theme): void {
    if (isPlatformBrowser(this.platformId)) {
      try {
        localStorage.setItem(this.STORAGE_KEY, theme);
      } catch (error) {
        console.error('Failed to save theme to localStorage:', error);
      }
    }
  }

  /**
   * Load theme preference from LocalStorage
   */
  private loadTheme(): Theme {
    if (isPlatformBrowser(this.platformId)) {
      try {
        const savedTheme = localStorage.getItem(this.STORAGE_KEY);
        if (savedTheme === 'light' || savedTheme === 'dark') {
          return savedTheme;
        }
      } catch (error) {
        console.error('Failed to load theme from localStorage:', error);
      }
    }
    return 'light'; // Default theme
  }
}

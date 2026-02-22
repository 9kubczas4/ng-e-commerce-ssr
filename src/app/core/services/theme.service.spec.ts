import { TestBed } from '@angular/core/testing';
import { PLATFORM_ID } from '@angular/core';
import { ThemeService } from './theme.service';

describe('ThemeService', () => {
  let service: ThemeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ThemeService);
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should start with light theme by default', () => {
    expect(service.currentTheme()).toBe('light');
  });

  describe('toggleTheme', () => {
    it('should toggle from light to dark', () => {
      service.toggleTheme();
      expect(service.currentTheme()).toBe('dark');
    });

    it('should toggle from dark to light', () => {
      service.setTheme('dark');
      service.toggleTheme();
      expect(service.currentTheme()).toBe('light');
    });

    it('should toggle multiple times', () => {
      service.toggleTheme(); // dark
      service.toggleTheme(); // light
      service.toggleTheme(); // dark
      expect(service.currentTheme()).toBe('dark');
    });
  });

  describe('setTheme', () => {
    it('should set theme to light', () => {
      service.setTheme('light');
      expect(service.currentTheme()).toBe('light');
    });

    it('should set theme to dark', () => {
      service.setTheme('dark');
      expect(service.currentTheme()).toBe('dark');
    });
  });

  describe('theme persistence', () => {
    it('should save theme to localStorage', () => {
      service.setTheme('dark');

      // Wait for effect to run
      TestBed.flushEffects();

      const stored = localStorage.getItem('angular-dev-shop-theme');
      expect(stored).toBe('dark');
    });

    it('should load theme from localStorage on initialization', () => {
      localStorage.setItem('angular-dev-shop-theme', 'dark');

      TestBed.resetTestingModule();
      TestBed.configureTestingModule({});
      const newService = TestBed.inject(ThemeService);

      expect(newService.currentTheme()).toBe('dark');
    });

    it('should use default theme when localStorage is empty', () => {
      localStorage.removeItem('angular-dev-shop-theme');

      TestBed.resetTestingModule();
      TestBed.configureTestingModule({});
      const newService = TestBed.inject(ThemeService);

      expect(newService.currentTheme()).toBe('light');
    });

    it('should ignore invalid theme values in localStorage', () => {
      localStorage.setItem('angular-dev-shop-theme', 'invalid-theme');

      TestBed.resetTestingModule();
      TestBed.configureTestingModule({});
      const newService = TestBed.inject(ThemeService);

      expect(newService.currentTheme()).toBe('light');
    });

    it('should handle localStorage save errors gracefully', () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      // Mock localStorage.setItem to throw error
      // Need to handle both the availability check and the actual save
      let callCount = 0;
      const setItemSpy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
        callCount++;
        // First call is the availability check, let it pass
        if (callCount === 1) {
          return;
        }
        // Second call is the actual save, throw error
        throw new Error('Storage error');
      });

      expect(() => service.setTheme('dark')).not.toThrow();

      TestBed.flushEffects();

      // Verify error was logged with new error message format
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('Failed to save theme to/from LocalStorage'),
        expect.any(String)
      );

      setItemSpy.mockRestore();
      consoleErrorSpy.mockRestore();
      consoleWarnSpy.mockRestore();
    });

    it('should handle localStorage load errors gracefully', () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      const getItemSpy = vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
        throw new Error('Storage access denied');
      });

      TestBed.resetTestingModule();
      TestBed.configureTestingModule({});

      expect(() => {
        const newService = TestBed.inject(ThemeService);
        expect(newService.currentTheme()).toBe('light');
      }).not.toThrow();

      // Verify error was logged with new error message format
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('Failed to load theme to/from LocalStorage'),
        expect.any(String)
      );

      getItemSpy.mockRestore();
      consoleErrorSpy.mockRestore();
      consoleWarnSpy.mockRestore();
    });
  });

  describe('SSR Platform Detection', () => {
    it('should not access localStorage on server platform', () => {
      const getItemSpy = vi.spyOn(Storage.prototype, 'getItem');
      const setItemSpy = vi.spyOn(Storage.prototype, 'setItem');
      const removeItemSpy = vi.spyOn(Storage.prototype, 'removeItem');

      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        providers: [
          { provide: PLATFORM_ID, useValue: 'server' }
        ]
      });
      const serverService = TestBed.inject(ThemeService);

      // Clear the spies after initialization (platform check happens during construction)
      getItemSpy.mockClear();
      setItemSpy.mockClear();
      removeItemSpy.mockClear();

      // Change theme on server
      serverService.setTheme('dark');
      TestBed.flushEffects();

      // Verify localStorage was not accessed for save (no setItem calls for actual data)
      expect(setItemSpy).not.toHaveBeenCalled();

      // Theme should still work in memory
      expect(serverService.currentTheme()).toBe('dark');

      getItemSpy.mockRestore();
      setItemSpy.mockRestore();
      removeItemSpy.mockRestore();
    });

    it('should not access document on server platform', () => {
      const setAttributeSpy = vi.spyOn(document.documentElement, 'setAttribute');

      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        providers: [
          { provide: PLATFORM_ID, useValue: 'server' }
        ]
      });
      const serverService = TestBed.inject(ThemeService);

      serverService.setTheme('dark');
      TestBed.flushEffects();

      // Verify document was not accessed
      expect(setAttributeSpy).not.toHaveBeenCalled();

      setAttributeSpy.mockRestore();
    });

    it('should access localStorage on browser platform', () => {
      const getItemSpy = vi.spyOn(Storage.prototype, 'getItem');
      const setItemSpy = vi.spyOn(Storage.prototype, 'setItem');

      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        providers: [
          { provide: PLATFORM_ID, useValue: 'browser' }
        ]
      });
      const browserService = TestBed.inject(ThemeService);

      // Verify localStorage was accessed during initialization (availability check + load)
      expect(getItemSpy).toHaveBeenCalled();

      // Clear spies before setting theme
      getItemSpy.mockClear();
      setItemSpy.mockClear();

      browserService.setTheme('dark');
      TestBed.flushEffects();

      // Verify localStorage was accessed for save (availability check + actual save)
      expect(setItemSpy).toHaveBeenCalled();

      getItemSpy.mockRestore();
      setItemSpy.mockRestore();
    });

    it('should apply theme to document on browser platform', () => {
      const setAttributeSpy = vi.spyOn(document.documentElement, 'setAttribute');

      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        providers: [
          { provide: PLATFORM_ID, useValue: 'browser' }
        ]
      });
      const browserService = TestBed.inject(ThemeService);

      browserService.setTheme('dark');
      TestBed.flushEffects();

      // Verify document was accessed
      expect(setAttributeSpy).toHaveBeenCalledWith('data-theme', 'dark');

      setAttributeSpy.mockRestore();
    });

    it('should maintain theme state in memory on server', () => {
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        providers: [
          { provide: PLATFORM_ID, useValue: 'server' }
        ]
      });
      const serverService = TestBed.inject(ThemeService);

      // Perform theme operations
      serverService.setTheme('dark');
      expect(serverService.currentTheme()).toBe('dark');

      serverService.toggleTheme();
      expect(serverService.currentTheme()).toBe('light');

      serverService.toggleTheme();
      expect(serverService.currentTheme()).toBe('dark');
    });

    it('should default to light theme on server when no storage available', () => {
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        providers: [
          { provide: PLATFORM_ID, useValue: 'server' }
        ]
      });
      const serverService = TestBed.inject(ThemeService);

      expect(serverService.currentTheme()).toBe('light');
    });
  });
});

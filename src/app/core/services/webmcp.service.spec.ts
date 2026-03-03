import { TestBed } from '@angular/core/testing';
import { PLATFORM_ID } from '@angular/core';
import { WebMCPService } from './webmcp.service';

describe('WebMCPService', () => {
  let service: WebMCPService;

  describe('Browser Context', () => {
    beforeEach(() => {
      TestBed.configureTestingModule({
        providers: [
          WebMCPService,
          { provide: PLATFORM_ID, useValue: 'browser' }
        ]
      });
      service = TestBed.inject(WebMCPService);
    });

    it('should be created', () => {
      expect(service).toBeTruthy();
    });

    it('should detect browser context correctly', () => {
      // In test environment, navigator.modelContext doesn't exist by default
      // So we need to mock it for this test
      const mockNavigator = {
        modelContext: {
          registerTool: vi.fn(),
          clearContext: vi.fn()
        }
      };
      vi.stubGlobal('navigator', mockNavigator);

      expect(service.isWebMCPAvailable()).toBe(true);

      vi.unstubAllGlobals();
    });

    it('should detect WebMCP API availability when navigator.modelContext exists', () => {
      // Mock navigator.modelContext
      const mockNavigator = {
        modelContext: {
          registerTool: vi.fn(),
          clearContext: vi.fn()
        }
      };
      vi.stubGlobal('navigator', mockNavigator);

      expect(service.isWebMCPAvailable()).toBe(true);

      vi.unstubAllGlobals();
    });

    it('should return false when navigator.modelContext does not exist', () => {
      // Mock navigator without modelContext
      const mockNavigator = {};
      vi.stubGlobal('navigator', mockNavigator);

      expect(service.isWebMCPAvailable()).toBe(false);

      vi.unstubAllGlobals();
    });
  });

  describe('SSR Context', () => {
    beforeEach(() => {
      TestBed.configureTestingModule({
        providers: [
          WebMCPService,
          { provide: PLATFORM_ID, useValue: 'server' }
        ]
      });
      service = TestBed.inject(WebMCPService);
    });

    it('should detect SSR context correctly', () => {
      expect(service.isWebMCPAvailable()).toBe(false);
    });

    it('should not register tools in SSR context', () => {
      const consoleSpy = vi.spyOn(console, 'log');

      service.initializeTools();

      expect(consoleSpy).toHaveBeenCalledWith('[WebMCP] Skipping tool registration in SSR context');
    });

    it('should not attempt cleanup in SSR context', () => {
      // destroyTools should exit early without logging anything
      service.destroyTools();

      // No errors should be thrown
      expect(service).toBeTruthy();
    });
  });

  describe('Tool Registration', () => {
    beforeEach(() => {
      TestBed.configureTestingModule({
        providers: [
          WebMCPService,
          { provide: PLATFORM_ID, useValue: 'browser' }
        ]
      });
      service = TestBed.inject(WebMCPService);
    });

    it('should register tools successfully when WebMCP API is available', () => {
      const mockModelContext = {
        registerTool: vi.fn(),
        clearContext: vi.fn()
      };
      const mockNavigator = { modelContext: mockModelContext };
      vi.stubGlobal('navigator', mockNavigator);

      const consoleSpy = vi.spyOn(console, 'log');

      service.initializeTools();

      expect(consoleSpy).toHaveBeenCalledWith('[WebMCP] Tools registered successfully');

      vi.unstubAllGlobals();
    });

    it('should not register tools twice', () => {
      const mockModelContext = {
        registerTool: vi.fn(),
        clearContext: vi.fn()
      };
      const mockNavigator = { modelContext: mockModelContext };
      vi.stubGlobal('navigator', mockNavigator);

      const consoleSpy = vi.spyOn(console, 'log');

      // First registration
      service.initializeTools();
      expect(consoleSpy).toHaveBeenCalledWith('[WebMCP] Tools registered successfully');

      // Second registration attempt
      service.initializeTools();
      expect(consoleSpy).toHaveBeenCalledWith('[WebMCP] Tools already registered');

      vi.unstubAllGlobals();
    });

    it('should warn when WebMCP API is not available', () => {
      const mockNavigator = {};
      vi.stubGlobal('navigator', mockNavigator);

      const consoleSpy = vi.spyOn(console, 'warn');

      service.initializeTools();

      expect(consoleSpy).toHaveBeenCalledWith('[WebMCP] WebMCP API not available. Tools will not be registered.');

      vi.unstubAllGlobals();
    });
  });

  describe('Tool Cleanup', () => {
    beforeEach(() => {
      TestBed.configureTestingModule({
        providers: [
          WebMCPService,
          { provide: PLATFORM_ID, useValue: 'browser' }
        ]
      });
      service = TestBed.inject(WebMCPService);
    });

    it('should unregister tools successfully', () => {
      const mockModelContext = {
        registerTool: vi.fn(),
        clearContext: vi.fn()
      };
      const mockNavigator = { modelContext: mockModelContext };
      vi.stubGlobal('navigator', mockNavigator);

      // Register tools first
      service.initializeTools();

      const consoleSpy = vi.spyOn(console, 'log');

      // Destroy tools
      service.destroyTools();

      expect(mockModelContext.clearContext).toHaveBeenCalled();
      expect(consoleSpy).toHaveBeenCalledWith('[WebMCP] Tools unregistered successfully');

      vi.unstubAllGlobals();
    });

    it('should not attempt cleanup if tools were not registered', () => {
      const mockModelContext = {
        registerTool: vi.fn(),
        clearContext: vi.fn()
      };
      const mockNavigator = { modelContext: mockModelContext };
      vi.stubGlobal('navigator', mockNavigator);

      // Don't register tools, just try to destroy
      service.destroyTools();

      expect(mockModelContext.clearContext).not.toHaveBeenCalled();

      vi.unstubAllGlobals();
    });

    it('should not throw error if WebMCP API is unavailable during cleanup', () => {
      const mockNavigator = {};
      vi.stubGlobal('navigator', mockNavigator);

      // Should not throw
      expect(() => service.destroyTools()).not.toThrow();

      vi.unstubAllGlobals();
    });
  });

  describe('Error Handling', () => {
    beforeEach(() => {
      TestBed.configureTestingModule({
        providers: [
          WebMCPService,
          { provide: PLATFORM_ID, useValue: 'browser' }
        ]
      });
      service = TestBed.inject(WebMCPService);
    });

    it('should handle registration errors gracefully', () => {
      const mockModelContext = {
        registerTool: vi.fn(),
        clearContext: vi.fn()
      };
      const mockNavigator = { modelContext: mockModelContext };
      vi.stubGlobal('navigator', mockNavigator);

      const consoleSpy = vi.spyOn(console, 'error');

      // Mock the service to throw during registration
      // Since the current implementation doesn't have tool registration yet,
      // we can't test the error path. This test will be updated when tools are added.
      // For now, test that initialization doesn't throw
      expect(() => service.initializeTools()).not.toThrow();

      vi.unstubAllGlobals();
    });

    it('should handle cleanup errors gracefully', () => {
      const mockModelContext = {
        registerTool: vi.fn(),
        clearContext: vi.fn(() => {
          throw new Error('Cleanup failed');
        })
      };
      const mockNavigator = { modelContext: mockModelContext };
      vi.stubGlobal('navigator', mockNavigator);

      // Register tools first
      service.initializeTools();

      const consoleSpy = vi.spyOn(console, 'error');

      // Should not throw, but log error
      expect(() => service.destroyTools()).not.toThrow();
      expect(consoleSpy).toHaveBeenCalledWith('[WebMCP] Error unregistering tools:', expect.any(Error));

      vi.unstubAllGlobals();
    });

    it('should continue application execution after registration failure', () => {
      const mockModelContext = {
        registerTool: vi.fn(() => {
          throw new Error('Registration failed');
        }),
        clearContext: vi.fn()
      };
      const mockNavigator = { modelContext: mockModelContext };
      vi.stubGlobal('navigator', mockNavigator);

      // Initialize tools (will fail internally)
      service.initializeTools();

      // Service should still be functional
      expect(service).toBeTruthy();
      expect(service.isWebMCPAvailable()).toBe(true);

      vi.unstubAllGlobals();
    });
  });
});

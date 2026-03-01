import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createToggleThemeTool } from './toggle-theme.tool';
import { ThemeService, Theme } from '../theme.service';
import { signal } from '@angular/core';

describe('ToggleThemeTool', () => {
  let mockThemeService: ThemeService;
  let currentThemeSignal: ReturnType<typeof signal<Theme>>;

  beforeEach(() => {
    // Create a signal to track theme state
    currentThemeSignal = signal<Theme>('light');

    // Create mock theme service
    mockThemeService = {
      currentTheme: currentThemeSignal.asReadonly(),
      toggleTheme: vi.fn(() => {
        const newTheme: Theme = currentThemeSignal() === 'light' ? 'dark' : 'light';
        currentThemeSignal.set(newTheme);
      }),
      setTheme: vi.fn((theme: Theme) => {
        currentThemeSignal.set(theme);
      })
    } as unknown as ThemeService;
  });

  describe('Tool Registration', () => {
    it('should create tool with correct name and description', () => {
      const tool = createToggleThemeTool(mockThemeService);

      expect(tool.name).toBe('toggle_theme');
      expect(tool.description).toContain('Change the application theme');
      expect(tool.description).toContain('light and dark modes');
    });

    it('should have correct input schema', () => {
      const tool = createToggleThemeTool(mockThemeService);

      expect(tool.inputSchema.type).toBe('object');
      expect(tool.inputSchema.properties.theme).toBeDefined();
      expect(tool.inputSchema.properties.theme.type).toBe('string');
      expect(tool.inputSchema.properties.theme.enum).toEqual(['light', 'dark', 'toggle']);
    });
  });

  describe('Theme Toggle', () => {
    it('should toggle theme from light to dark when theme is "toggle"', async () => {
      const tool = createToggleThemeTool(mockThemeService);
      currentThemeSignal.set('light');

      const response = await tool.execute({ theme: 'toggle' });
      const result = JSON.parse(response.content[0].text);

      expect(mockThemeService.toggleTheme).toHaveBeenCalled();
      expect(result.success).toBe(true);
      expect(result.currentTheme).toBe('dark');
      expect(result.message).toContain('toggled from light to dark');
    });

    it('should toggle theme from dark to light when theme is "toggle"', async () => {
      const tool = createToggleThemeTool(mockThemeService);
      currentThemeSignal.set('dark');

      const response = await tool.execute({ theme: 'toggle' });
      const result = JSON.parse(response.content[0].text);

      expect(mockThemeService.toggleTheme).toHaveBeenCalled();
      expect(result.success).toBe(true);
      expect(result.currentTheme).toBe('light');
      expect(result.message).toContain('toggled from dark to light');
    });

    it('should default to toggle when no theme parameter is provided', async () => {
      const tool = createToggleThemeTool(mockThemeService);
      currentThemeSignal.set('light');

      const response = await tool.execute({});
      const result = JSON.parse(response.content[0].text);

      expect(mockThemeService.toggleTheme).toHaveBeenCalled();
      expect(result.success).toBe(true);
      expect(result.currentTheme).toBe('dark');
    });

    it('should default to toggle when params is null', async () => {
      const tool = createToggleThemeTool(mockThemeService);
      currentThemeSignal.set('light');

      const response = await tool.execute(null);
      const result = JSON.parse(response.content[0].text);

      expect(mockThemeService.toggleTheme).toHaveBeenCalled();
      expect(result.success).toBe(true);
      expect(result.currentTheme).toBe('dark');
    });
  });

  describe('Set Specific Theme', () => {
    it('should set theme to light', async () => {
      const tool = createToggleThemeTool(mockThemeService);
      currentThemeSignal.set('dark');

      const response = await tool.execute({ theme: 'light' });
      const result = JSON.parse(response.content[0].text);

      expect(mockThemeService.setTheme).toHaveBeenCalledWith('light');
      expect(result.success).toBe(true);
      expect(result.currentTheme).toBe('light');
      expect(result.message).toBe('Theme set to light');
    });

    it('should set theme to dark', async () => {
      const tool = createToggleThemeTool(mockThemeService);
      currentThemeSignal.set('light');

      const response = await tool.execute({ theme: 'dark' });
      const result = JSON.parse(response.content[0].text);

      expect(mockThemeService.setTheme).toHaveBeenCalledWith('dark');
      expect(result.success).toBe(true);
      expect(result.currentTheme).toBe('dark');
      expect(result.message).toBe('Theme set to dark');
    });

    it('should not change theme if already set to requested theme', async () => {
      const tool = createToggleThemeTool(mockThemeService);
      currentThemeSignal.set('light');

      const response = await tool.execute({ theme: 'light' });
      const result = JSON.parse(response.content[0].text);

      expect(mockThemeService.setTheme).toHaveBeenCalledWith('light');
      expect(result.success).toBe(true);
      expect(result.currentTheme).toBe('light');
    });
  });

  describe('Input Validation', () => {
    it('should return error for non-object parameters', async () => {
      const tool = createToggleThemeTool(mockThemeService);

      const response = await tool.execute('invalid');
      const error = JSON.parse(response.content[0].text);

      expect(error.error).toBe('Invalid parameters');
      expect(error.code).toBe('INVALID_PARAMS');
      expect(mockThemeService.toggleTheme).not.toHaveBeenCalled();
      expect(mockThemeService.setTheme).not.toHaveBeenCalled();
    });

    it('should return error for non-string theme parameter', async () => {
      const tool = createToggleThemeTool(mockThemeService);

      const response = await tool.execute({ theme: 123 });
      const error = JSON.parse(response.content[0].text);

      expect(error.error).toBe('Invalid theme parameter');
      expect(error.code).toBe('INVALID_THEME_TYPE');
      expect(mockThemeService.toggleTheme).not.toHaveBeenCalled();
      expect(mockThemeService.setTheme).not.toHaveBeenCalled();
    });

    it('should return error for invalid theme value', async () => {
      const tool = createToggleThemeTool(mockThemeService);

      const response = await tool.execute({ theme: 'invalid' });
      const error = JSON.parse(response.content[0].text);

      expect(error.error).toBe('Invalid theme value');
      expect(error.details).toContain('light, dark, toggle');
      expect(error.details).toContain('invalid');
      expect(error.code).toBe('INVALID_THEME_VALUE');
      expect(mockThemeService.toggleTheme).not.toHaveBeenCalled();
      expect(mockThemeService.setTheme).not.toHaveBeenCalled();
    });
  });

  describe('Error Handling', () => {
    it('should handle theme service errors gracefully', async () => {
      const tool = createToggleThemeTool(mockThemeService);
      vi.spyOn(mockThemeService, 'toggleTheme').mockImplementation(() => {
        throw new Error('Theme service error');
      });

      const response = await tool.execute({ theme: 'toggle' });
      const error = JSON.parse(response.content[0].text);

      expect(error.error).toBe('Failed to change theme');
      expect(error.details).toBe('Theme service error');
      expect(error.code).toBe('THEME_CHANGE_ERROR');
    });

    it('should handle unknown errors gracefully', async () => {
      const tool = createToggleThemeTool(mockThemeService);
      vi.spyOn(mockThemeService, 'setTheme').mockImplementation(() => {
        throw 'String error';
      });

      const response = await tool.execute({ theme: 'dark' });
      const error = JSON.parse(response.content[0].text);

      expect(error.error).toBe('Failed to change theme');
      expect(error.details).toBe('Unknown error');
      expect(error.code).toBe('THEME_CHANGE_ERROR');
    });
  });

  describe('Response Structure', () => {
    it('should return correct response structure for successful toggle', async () => {
      const tool = createToggleThemeTool(mockThemeService);
      currentThemeSignal.set('light');

      const response = await tool.execute({ theme: 'toggle' });

      expect(response.content).toHaveLength(1);
      expect(response.content[0].type).toBe('text');

      const result = JSON.parse(response.content[0].text);
      expect(result).toHaveProperty('success');
      expect(result).toHaveProperty('message');
      expect(result).toHaveProperty('currentTheme');
      expect(typeof result.success).toBe('boolean');
      expect(typeof result.message).toBe('string');
      expect(['light', 'dark']).toContain(result.currentTheme);
    });

    it('should return correct response structure for successful set', async () => {
      const tool = createToggleThemeTool(mockThemeService);

      const response = await tool.execute({ theme: 'dark' });

      expect(response.content).toHaveLength(1);
      expect(response.content[0].type).toBe('text');

      const result = JSON.parse(response.content[0].text);
      expect(result.success).toBe(true);
      expect(result.currentTheme).toBe('dark');
      expect(result.message).toBe('Theme set to dark');
    });
  });
});

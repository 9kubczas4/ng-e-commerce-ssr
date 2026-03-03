import {
  ToolRegistration,
  ToolResponse,
  ErrorObject
} from '@core/models/webmcp.model';
import { ThemeService, Theme } from '../theme.service';

/**
 * Parameters for toggle_theme tool
 */
export interface ToggleThemeParams {
  theme?: 'light' | 'dark' | 'toggle';
}

/**
 * Response from toggle_theme tool
 */
export interface ToggleThemeResponse {
  success: boolean;
  message: string;
  currentTheme: Theme;
}

/**
 * Creates the toggle_theme WebMCP tool
 * Allows AI agents to change the application theme between light and dark modes
 */
export function createToggleThemeTool(
  themeService: ThemeService
): ToolRegistration {

  return {
    name: 'toggle_theme',
    description: 'Change the application theme between light and dark modes. Use this tool when the user wants to switch themes, enable dark mode, enable light mode, or toggle the current theme. You can specify a theme ("light" or "dark") or use "toggle" to switch to the opposite of the current theme.',
    inputSchema: {
      type: 'object',
      properties: {
        theme: {
          type: 'string',
          description: 'The theme to set. Use "light" for light mode, "dark" for dark mode, or "toggle" to switch to the opposite of the current theme. If not provided, defaults to "toggle".',
          enum: ['light', 'dark', 'toggle']
        }
      }
    },
    execute: async (params: unknown): Promise<ToolResponse> => {
      try {
        // Validate parameters object
        if (params !== null && params !== undefined && typeof params !== 'object') {
          const errorObj: ErrorObject = {
            error: 'Invalid parameters',
            details: 'Parameters must be an object',
            code: 'INVALID_PARAMS'
          };
          return {
            content: [{
              type: 'text',
              text: JSON.stringify(errorObj)
            }]
          };
        }

        // Cast parameters
        const themeParams = (params || {}) as ToggleThemeParams;

        // Validate theme parameter if provided
        if (themeParams.theme !== undefined) {
          if (typeof themeParams.theme !== 'string') {
            const errorObj: ErrorObject = {
              error: 'Invalid theme parameter',
              details: 'Theme must be a string',
              code: 'INVALID_THEME_TYPE'
            };
            return {
              content: [{
                type: 'text',
                text: JSON.stringify(errorObj)
              }]
            };
          }

          const validThemes = ['light', 'dark', 'toggle'];
          if (!validThemes.includes(themeParams.theme)) {
            const errorObj: ErrorObject = {
              error: 'Invalid theme value',
              details: `Theme must be one of: ${validThemes.join(', ')}. Received: ${themeParams.theme}`,
              code: 'INVALID_THEME_VALUE'
            };
            return {
              content: [{
                type: 'text',
                text: JSON.stringify(errorObj)
              }]
            };
          }
        }

        // Get current theme before change
        const previousTheme = themeService.currentTheme();

        // Apply theme change
        const requestedTheme = themeParams.theme || 'toggle';

        if (requestedTheme === 'toggle') {
          themeService.toggleTheme();
        } else {
          themeService.setTheme(requestedTheme as Theme);
        }

        // Get new theme after change
        const newTheme = themeService.currentTheme();

        // Build success response
        const response: ToggleThemeResponse = {
          success: true,
          message: requestedTheme === 'toggle'
            ? `Theme toggled from ${previousTheme} to ${newTheme}`
            : `Theme set to ${newTheme}`,
          currentTheme: newTheme
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
          error: 'Failed to change theme',
          details: error instanceof Error ? error.message : 'Unknown error',
          code: 'THEME_CHANGE_ERROR'
        };

        console.error('Toggle theme tool error:', error);

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

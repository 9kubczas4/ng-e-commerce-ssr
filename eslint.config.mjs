import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import angular from '@angular-eslint/eslint-plugin';
import angularTemplate from '@angular-eslint/eslint-plugin-template';
import angularTemplateParser from '@angular-eslint/template-parser';
import boundaries from 'eslint-plugin-boundaries';

export default tseslint.config(
  {
    ignores: ['dist/**', '.angular/**', 'node_modules/**', 'coverage/**'],
  },
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['**/*.ts'],
    ignores: ['**/*.config.ts', 'e2e/**/*.ts'],
    plugins: {
      '@angular-eslint': angular,
      boundaries,
    },
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    settings: {
      'boundaries/elements': [
        {
          type: 'core',
          pattern: 'src/app/core/**',
        },
        {
          type: 'shared',
          pattern: 'src/app/shared/**',
        },
        {
          type: 'feature',
          pattern: 'src/app/features/**',
          capture: ['featureName'],
        },
      ],
      'boundaries/ignore': ['**/*.spec.ts', '**/*.pbt.spec.ts'],
    },
    rules: {
      ...angular.configs.recommended.rules,
      '@angular-eslint/directive-selector': [
        'error',
        {
          type: 'attribute',
          prefix: 'app',
          style: 'camelCase',
        },
      ],
      '@angular-eslint/component-selector': [
        'error',
        {
          type: 'element',
          prefix: 'app',
          style: 'kebab-case',
        },
      ],
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
        },
      ],
      // Boundaries rules
      'boundaries/element-types': [
        'error',
        {
          default: 'disallow',
          rules: [
            // Core can import from core and shared
            {
              from: 'core',
              allow: ['core', 'shared'],
            },
            // Shared can only import from shared
            {
              from: 'shared',
              allow: ['shared'],
            },
            // Features can import from core and shared, but not from other features
            {
              from: 'feature',
              allow: ['core', 'shared', ['feature', { featureName: '${from.featureName}' }]],
            },
          ],
        },
      ],
    },
  },
  {
    files: ['**/*.component.html', '**/components/**/*.html', '**/containers/**/*.html'],
    plugins: {
      '@angular-eslint/template': angularTemplate,
    },
    languageOptions: {
      parser: angularTemplateParser,
    },
    rules: {
      ...angularTemplate.configs.recommended.rules,
      ...angularTemplate.configs.accessibility.rules,
      '@angular-eslint/template/no-negated-async': 'error',
    },
  }
);

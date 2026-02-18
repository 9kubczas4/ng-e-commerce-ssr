import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['src/test-setup.ts'],
    include: ['src/**/*.{spec,pbt.spec}.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        '**/*.spec.ts',
        '**/*.pbt.spec.ts',
        '**/node_modules/**',
        '**/dist/**',
        '**/.angular/**'
      ]
    }
  },
  resolve: {
    alias: {
      '@app': resolve(__dirname, './src/app'),
      '@core': resolve(__dirname, './src/app/core'),
      '@features': resolve(__dirname, './src/app/features'),
      '@shared': resolve(__dirname, './src/app/shared')
    }
  }
});

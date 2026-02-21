import { beforeAll, vi } from 'vitest';
import { getTestBed } from '@angular/core/testing';
import {
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting,
} from '@angular/platform-browser-dynamic/testing';

// Mock SCSS imports for Angular components
vi.mock('*.scss', () => ({
  default: '',
}));

beforeAll(() => {
  // Initialize Angular testing environment
  getTestBed().initTestEnvironment(BrowserDynamicTestingModule, platformBrowserDynamicTesting());
});

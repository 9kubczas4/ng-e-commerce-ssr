import { afterEach, beforeEach } from 'vitest';
import { getTestBed, ɵgetCleanupHook as getCleanupHook } from '@angular/core/testing';
import { BrowserTestingModule, platformBrowserTesting } from '@angular/platform-browser/testing';
import { NgModule } from '@angular/core';

beforeEach(getCleanupHook(false));
afterEach(getCleanupHook(true));

@NgModule({ providers: [] })
class TestModule {}

getTestBed().initTestEnvironment(
  [BrowserTestingModule, TestModule],
  platformBrowserTesting(),
  {
    errorOnUnknownElements: true,
    errorOnUnknownProperties: true,
  }
);

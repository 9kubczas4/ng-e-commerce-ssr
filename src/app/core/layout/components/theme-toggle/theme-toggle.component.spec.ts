import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ThemeToggleComponent } from './theme-toggle.component';
import { ThemeService } from '@core/services/theme.service';
import { signal } from '@angular/core';
import { PLATFORM_ID } from '@angular/core';

describe('ThemeToggleComponent', () => {
  let component: ThemeToggleComponent;
  let fixture: ComponentFixture<ThemeToggleComponent>;
  let themeService: ThemeService;
  let mockThemeSignal: ReturnType<typeof signal<'light' | 'dark'>>;

  beforeEach(async () => {
    // Create a mock theme signal
    mockThemeSignal = signal<'light' | 'dark'>('light');

    // Create a mock ThemeService
    const mockThemeService = {
      currentTheme: mockThemeSignal.asReadonly(),
      toggleTheme: vi.fn()
    };

    await TestBed.configureTestingModule({
      providers: [
        { provide: ThemeService, useValue: mockThemeService },
        { provide: PLATFORM_ID, useValue: 'browser' }
      ]
    })
    .overrideComponent(ThemeToggleComponent, {
      set: {
        styleUrls: []
      }
    })
    .compileComponents();

    fixture = TestBed.createComponent(ThemeToggleComponent);
    component = fixture.componentInstance;
    themeService = TestBed.inject(ThemeService);
    fixture.detectChanges();
  });

  describe('Component Initialization', () => {
    it('should create the component', () => {
      expect(component).toBeTruthy();
    });

    it('should have currentTheme signal from ThemeService', () => {
      expect(component.currentTheme()).toBe('light');
    });
  });

  describe('Toggle Interaction', () => {
    it('should call toggleTheme on ThemeService when clicked', () => {
      const button = fixture.nativeElement as HTMLButtonElement;

      button.click();

      expect(themeService.toggleTheme).toHaveBeenCalledTimes(1);
    });

    it('should call toggleTheme when toggleTheme method is invoked', () => {
      component.toggleTheme();

      expect(themeService.toggleTheme).toHaveBeenCalledTimes(1);
    });
  });

  describe('Icon Display Based on Theme', () => {
    it('should display sun icon when theme is light', () => {
      mockThemeSignal.set('light');
      fixture.detectChanges();

      const svg = fixture.nativeElement.querySelector('svg');
      expect(svg?.classList.contains('theme-icon--sun')).toBe(true);
      expect(svg?.classList.contains('theme-icon--moon')).toBe(false);

      // Check for sun icon elements (circle and lines)
      const circle = fixture.nativeElement.querySelector('circle');
      expect(circle).toBeTruthy();
    });

    it('should display moon icon when theme is dark', () => {
      mockThemeSignal.set('dark');
      fixture.detectChanges();

      const svg = fixture.nativeElement.querySelector('svg');
      expect(svg?.classList.contains('theme-icon--moon')).toBe(true);
      expect(svg?.classList.contains('theme-icon--sun')).toBe(false);

      // Check for moon icon element (path)
      const path = fixture.nativeElement.querySelector('path');
      expect(path).toBeTruthy();
    });

    it('should update icon when theme changes from light to dark', () => {
      mockThemeSignal.set('light');
      fixture.detectChanges();

      let circle = fixture.nativeElement.querySelector('circle');
      expect(circle).toBeTruthy();

      mockThemeSignal.set('dark');
      fixture.detectChanges();

      circle = fixture.nativeElement.querySelector('circle');
      const path = fixture.nativeElement.querySelector('path');
      expect(circle).toBeFalsy();
      expect(path).toBeTruthy();
    });

    it('should update icon when theme changes from dark to light', () => {
      mockThemeSignal.set('dark');
      fixture.detectChanges();

      let path = fixture.nativeElement.querySelector('path');
      expect(path).toBeTruthy();

      mockThemeSignal.set('light');
      fixture.detectChanges();

      path = fixture.nativeElement.querySelector('path');
      const circle = fixture.nativeElement.querySelector('circle');
      expect(path).toBeFalsy();
      expect(circle).toBeTruthy();
    });
  });

  describe('Accessibility Features', () => {
    it('should have button type attribute', () => {
      const button = fixture.nativeElement as HTMLButtonElement;
      expect(button.getAttribute('type')).toBe('button');
    });

    it('should have appropriate aria-label for light theme', () => {
      mockThemeSignal.set('light');
      fixture.detectChanges();

      const button = fixture.nativeElement as HTMLButtonElement;
      expect(button.getAttribute('aria-label')).toBe('Switch to dark theme');
    });

    it('should have appropriate aria-label for dark theme', () => {
      mockThemeSignal.set('dark');
      fixture.detectChanges();

      const button = fixture.nativeElement as HTMLButtonElement;
      expect(button.getAttribute('aria-label')).toBe('Switch to light theme');
    });

    it('should update aria-label when theme changes', () => {
      mockThemeSignal.set('light');
      fixture.detectChanges();

      const button = fixture.nativeElement as HTMLButtonElement;
      expect(button.getAttribute('aria-label')).toBe('Switch to dark theme');

      mockThemeSignal.set('dark');
      fixture.detectChanges();

      expect(button.getAttribute('aria-label')).toBe('Switch to light theme');
    });

    it('should have aria-pressed="false" when theme is light', () => {
      mockThemeSignal.set('light');
      fixture.detectChanges();

      const button = fixture.nativeElement as HTMLButtonElement;
      expect(button.getAttribute('aria-pressed')).toBe('false');
    });

    it('should have aria-pressed="true" when theme is dark', () => {
      mockThemeSignal.set('dark');
      fixture.detectChanges();

      const button = fixture.nativeElement as HTMLButtonElement;
      expect(button.getAttribute('aria-pressed')).toBe('true');
    });

    it('should update aria-pressed when theme changes', () => {
      mockThemeSignal.set('light');
      fixture.detectChanges();

      const button = fixture.nativeElement as HTMLButtonElement;
      expect(button.getAttribute('aria-pressed')).toBe('false');

      mockThemeSignal.set('dark');
      fixture.detectChanges();

      expect(button.getAttribute('aria-pressed')).toBe('true');
    });

    it('should have aria-hidden="true" on SVG icon', () => {
      const svg = fixture.nativeElement.querySelector('svg');
      expect(svg?.getAttribute('aria-hidden')).toBe('true');
    });

    it('should have theme-toggle CSS class', () => {
      const button = fixture.nativeElement as HTMLButtonElement;
      expect(button.classList.contains('theme-toggle')).toBe(true);
    });
  });
});

import { describe, it, expect, beforeEach } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SearchBarComponent } from './search-bar.component';

describe('SearchBarComponent', () => {
  let component: SearchBarComponent;
  let fixture: ComponentFixture<SearchBarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SearchBarComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(SearchBarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  describe('Component Logic', () => {
    it('should create component instance', () => {
      expect(component).toBeTruthy();
    });

    it('should initialize with empty search query', () => {
      expect(component.searchQuery()).toBe('');
    });
  });

  describe('Search Input', () => {
    it('should update searchQuery signal when input changes', () => {
      const mockEvent = {
        target: { value: 'Angular' }
      } as unknown as Event;

      component.onSearchInput(mockEvent);

      expect(component.searchQuery()).toBe('Angular');
    });

    it('should handle empty input', () => {
      const mockEvent = {
        target: { value: '' }
      } as unknown as Event;

      component.onSearchInput(mockEvent);

      expect(component.searchQuery()).toBe('');
    });

    it('should handle special characters in input', () => {
      const mockEvent = {
        target: { value: 'test@#$%' }
      } as unknown as Event;

      component.onSearchInput(mockEvent);

      expect(component.searchQuery()).toBe('test@#$%');
    });

    it('should sanitize HTML tags from input', () => {
      const mockEvent = {
        target: { value: '<script>alert("xss")</script>test' }
      } as unknown as Event;

      component.onSearchInput(mockEvent);

      expect(component.searchQuery()).not.toContain('<script>');
      expect(component.searchQuery()).not.toContain('</script>');
    });

    it('should trim whitespace from input', () => {
      const mockEvent = {
        target: { value: '  Angular  ' }
      } as unknown as Event;

      component.onSearchInput(mockEvent);

      expect(component.searchQuery()).toBe('Angular');
    });

    it('should limit search query length to 100 characters', () => {
      const longString = 'a'.repeat(150);
      const mockEvent = {
        target: { value: longString }
      } as unknown as Event;

      component.onSearchInput(mockEvent);

      expect(component.searchQuery().length).toBe(100);
    });

    it('should allow common punctuation in search', () => {
      const mockEvent = {
        target: { value: "Angular's best-practices!" }
      } as unknown as Event;

      component.onSearchInput(mockEvent);

      expect(component.searchQuery()).toContain("'");
      expect(component.searchQuery()).toContain('-');
      expect(component.searchQuery()).toContain('!');
    });
  });

  describe('Debouncing', () => {
    it('should emit searchChange event after debounce delay', async () => {
      const emittedPromise = new Promise<string>((resolve) => {
        component.searchChange.subscribe((value: string) => {
          if (value === 'test') {
            resolve(value);
          }
        });
      });

      const mockEvent = {
        target: { value: 'test' }
      } as unknown as Event;

      component.onSearchInput(mockEvent);

      const emittedValue = await emittedPromise;
      expect(emittedValue).toBe('test');
    });

    it('should debounce rapid input changes', async () => {
      const emittedValues: string[] = [];
      component.searchChange.subscribe((value: string) => {
        emittedValues.push(value);
      });

      // Type multiple characters rapidly
      component.onSearchInput({ target: { value: 'a' } } as unknown as Event);
      component.onSearchInput({ target: { value: 'an' } } as unknown as Event);
      component.onSearchInput({ target: { value: 'ang' } } as unknown as Event);

      // Wait for debounce to complete
      await new Promise(resolve => setTimeout(resolve, 400));

      // Last value should be the final input
      expect(emittedValues[emittedValues.length - 1]).toBe('ang');
    });
  });

  describe('Clear Functionality', () => {
    it('should clear search query when clearSearch is called', () => {
      // Set initial value
      component.searchQuery.set('test query');
      expect(component.searchQuery()).toBe('test query');

      // Clear search
      component.clearSearch();

      expect(component.searchQuery()).toBe('');
    });

    it('should emit empty string after clearing search', async () => {
      const emittedValues: string[] = [];
      component.searchChange.subscribe((value: string) => {
        emittedValues.push(value);
      });

      // Set initial value
      component.searchQuery.set('test');

      // Wait for first emission
      await new Promise(resolve => setTimeout(resolve, 400));

      // Clear search
      component.clearSearch();

      // Wait for clear emission
      await new Promise(resolve => setTimeout(resolve, 400));

      // Last emitted value should be empty string
      expect(emittedValues[emittedValues.length - 1]).toBe('');
    });
  });

  describe('Event Emission', () => {
    it('should emit searchChange event with current query value', async () => {
      const emittedPromise = new Promise<string>((resolve) => {
        component.searchChange.subscribe((value: string) => {
          if (value === 'Angular') {
            resolve(value);
          }
        });
      });

      component.onSearchInput({ target: { value: 'Angular' } } as unknown as Event);

      const emittedValue = await emittedPromise;
      expect(emittedValue).toBe('Angular');
    });
  });
});

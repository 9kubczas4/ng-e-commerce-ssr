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
  });

  describe('Debouncing', () => {
    it('should emit searchChange event after debounce delay', (done) => {
      let emittedValue: string | undefined;
      component.searchChange.subscribe((value: string) => {
        if (value === 'test') {
          emittedValue = value;
          expect(emittedValue).toBe('test');
          done();
        }
      });

      const mockEvent = {
        target: { value: 'test' }
      } as unknown as Event;

      component.onSearchInput(mockEvent);
    });

    it('should debounce rapid input changes', (done) => {
      const emittedValues: string[] = [];
      component.searchChange.subscribe((value: string) => {
        emittedValues.push(value);
      });

      // Type multiple characters rapidly
      component.onSearchInput({ target: { value: 'a' } } as unknown as Event);
      component.onSearchInput({ target: { value: 'an' } } as unknown as Event);
      component.onSearchInput({ target: { value: 'ang' } } as unknown as Event);

      // Wait for debounce to complete
      setTimeout(() => {
        // Last value should be the final input
        expect(emittedValues[emittedValues.length - 1]).toBe('ang');
        done();
      }, 400);
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

    it('should emit empty string after clearing search', (done) => {
      const emittedValues: string[] = [];
      component.searchChange.subscribe((value: string) => {
        emittedValues.push(value);
      });

      // Set initial value
      component.searchQuery.set('test');

      // Wait for first emission
      setTimeout(() => {
        // Clear search
        component.clearSearch();

        // Wait for clear emission
        setTimeout(() => {
          // Last emitted value should be empty string
          expect(emittedValues[emittedValues.length - 1]).toBe('');
          done();
        }, 400);
      }, 400);
    });
  });

  describe('Event Emission', () => {
    it('should emit searchChange event with current query value', (done) => {
      let emittedValue: string | undefined;
      component.searchChange.subscribe((value: string) => {
        if (value === 'Angular') {
          emittedValue = value;
          expect(emittedValue).toBe('Angular');
          done();
        }
      });

      component.onSearchInput({ target: { value: 'Angular' } } as unknown as Event);
    });
  });
});

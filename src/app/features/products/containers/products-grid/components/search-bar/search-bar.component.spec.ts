import { describe, it, expect, beforeEach } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SearchBarComponent } from './search-bar.component';
import { SearchState } from '@core/services/search-state.service';

describe('SearchBarComponent', () => {
  let component: SearchBarComponent;
  let fixture: ComponentFixture<SearchBarComponent>;
  let searchStateService: SearchState;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SearchBarComponent],
      providers: [SearchState]
    }).compileComponents();

    fixture = TestBed.createComponent(SearchBarComponent);
    component = fixture.componentInstance;
    searchStateService = TestBed.inject(SearchState);
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
    it('should update searchQuery signal when input changes', async () => {
      const mockEvent = {
        target: { value: 'Angular' }
      } as unknown as Event;

      component.onSearchInput(mockEvent);

      // Wait for debounce
      await new Promise(resolve => setTimeout(resolve, 350));

      expect(component.searchQuery()).toBe('Angular');
    });

    it('should handle empty input', async () => {
      const mockEvent = {
        target: { value: '' }
      } as unknown as Event;

      component.onSearchInput(mockEvent);

      // Wait for debounce
      await new Promise(resolve => setTimeout(resolve, 350));

      expect(component.searchQuery()).toBe('');
    });

    it('should handle special characters in input', async () => {
      const mockEvent = {
        target: { value: 'test@#$%' }
      } as unknown as Event;

      component.onSearchInput(mockEvent);

      // Wait for debounce
      await new Promise(resolve => setTimeout(resolve, 350));

      expect(component.searchQuery()).toBe('test@#$%');
    });

    it('should sanitize HTML tags from input', async () => {
      const mockEvent = {
        target: { value: '<script>alert("xss")</script>test' }
      } as unknown as Event;

      component.onSearchInput(mockEvent);

      // Wait for debounce
      await new Promise(resolve => setTimeout(resolve, 350));

      expect(component.searchQuery()).not.toContain('<script>');
      expect(component.searchQuery()).not.toContain('</script>');
    });

    it('should trim whitespace from input', async () => {
      const mockEvent = {
        target: { value: '  Angular  ' }
      } as unknown as Event;

      component.onSearchInput(mockEvent);

      // Wait for debounce
      await new Promise(resolve => setTimeout(resolve, 350));

      expect(component.searchQuery()).toBe('Angular');
    });

    it('should limit search query length to 100 characters', async () => {
      const longString = 'a'.repeat(150);
      const mockEvent = {
        target: { value: longString }
      } as unknown as Event;

      component.onSearchInput(mockEvent);

      // Wait for debounce
      await new Promise(resolve => setTimeout(resolve, 350));

      expect(component.searchQuery().length).toBe(100);
    });

    it('should allow common punctuation in search', async () => {
      const mockEvent = {
        target: { value: "Angular's best-practices!" }
      } as unknown as Event;

      component.onSearchInput(mockEvent);

      // Wait for debounce
      await new Promise(resolve => setTimeout(resolve, 350));

      expect(component.searchQuery()).toContain("'");
      expect(component.searchQuery()).toContain('-');
      expect(component.searchQuery()).toContain('!');
    });
  });

  describe('Debouncing', () => {
    it('should emit searchChange event after debounce delay', async () => {
      const mockEvent = {
        target: { value: 'test' }
      } as unknown as Event;

      component.onSearchInput(mockEvent);

      // Wait for debounce
      await new Promise(resolve => setTimeout(resolve, 350));

      expect(component.searchQuery()).toBe('test');
    });

    it('should debounce rapid input changes', async () => {
      // Type multiple characters rapidly
      component.onSearchInput({ target: { value: 'a' } } as unknown as Event);
      component.onSearchInput({ target: { value: 'an' } } as unknown as Event);
      component.onSearchInput({ target: { value: 'ang' } } as unknown as Event);

      // Wait for debounce to complete (300ms debounce + buffer)
      await new Promise(resolve => setTimeout(resolve, 350));

      // Last value should be the final input
      expect(component.searchQuery()).toBe('ang');
    });
  });

  describe('Clear Functionality', () => {
    it('should clear search query when clearSearch is called', () => {
      // Set initial value via service
      searchStateService.setSearchQuery('test query');
      expect(component.searchQuery()).toBe('test query');

      // Clear search
      component.clearSearch();

      expect(component.searchQuery()).toBe('');
    });

    it('should emit empty string after clearing search', async () => {
      // Set initial value
      searchStateService.setSearchQuery('test');
      expect(component.searchQuery()).toBe('test');

      // Clear search
      component.clearSearch();

      expect(component.searchQuery()).toBe('');
    });
  });

  describe('Event Emission', () => {
    it('should emit searchChange event with current query value', async () => {
      component.onSearchInput({ target: { value: 'Angular' } } as unknown as Event);

      // Wait for debounce
      await new Promise(resolve => setTimeout(resolve, 350));

      expect(component.searchQuery()).toBe('Angular');
    });
  });
});

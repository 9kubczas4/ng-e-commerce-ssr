import { describe, it, expect, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { SearchState } from './search-state.service';

describe('SearchStateService', () => {
  let service: SearchState;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SearchState);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('setSearchQuery', () => {
    it('should update search query signal', () => {
      service.setSearchQuery('Angular');
      expect(service.searchQuery()).toBe('Angular');
    });

    it('should update to empty string', () => {
      service.setSearchQuery('test');
      service.setSearchQuery('');
      expect(service.searchQuery()).toBe('');
    });
  });

  describe('setCategory', () => {
    it('should update category signal', () => {
      service.setCategory('Apparel');
      expect(service.selectedCategory()).toBe('Apparel');
    });

    it('should update to null', () => {
      service.setCategory('Apparel');
      service.setCategory(null);
      expect(service.selectedCategory()).toBeNull();
    });
  });

  describe('setSearchState', () => {
    it('should update both query and category', () => {
      service.setSearchState('Angular', 'Apparel');
      expect(service.searchQuery()).toBe('Angular');
      expect(service.selectedCategory()).toBe('Apparel');
    });

    it('should update query with null category', () => {
      service.setSearchState('test', null);
      expect(service.searchQuery()).toBe('test');
      expect(service.selectedCategory()).toBeNull();
    });

    it('should update category with empty query', () => {
      service.setSearchState('', 'Books');
      expect(service.searchQuery()).toBe('');
      expect(service.selectedCategory()).toBe('Books');
    });
  });

  describe('clearSearch', () => {
    it('should reset both query and category to initial state', () => {
      service.setSearchState('Angular', 'Apparel');
      service.clearSearch();
      expect(service.searchQuery()).toBe('');
      expect(service.selectedCategory()).toBeNull();
    });
  });

  describe('signal reactivity', () => {
    it('should emit new values when search query changes', () => {
      const values: string[] = [];

      // Subscribe to changes using effect-like pattern
      const query = service.searchQuery;
      values.push(query());

      service.setSearchQuery('test1');
      values.push(query());

      service.setSearchQuery('test2');
      values.push(query());

      expect(values).toEqual(['', 'test1', 'test2']);
    });

    it('should emit new values when category changes', () => {
      const values: (string | null)[] = [];

      const category = service.selectedCategory;
      values.push(category());

      service.setCategory('Apparel');
      values.push(category());

      service.setCategory('Books');
      values.push(category());

      expect(values).toEqual([null, 'Apparel', 'Books']);
    });
  });
});

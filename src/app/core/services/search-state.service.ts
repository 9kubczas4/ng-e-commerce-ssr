import { Injectable, signal } from '@angular/core';
import { Category } from '@core/models/product.model';

/**
 * Service to manage search state across the application
 * Allows WebMCP tools and UI components to sync search state
 */
@Injectable({
  providedIn: 'root'
})
export class SearchState {
  // Signals for reactive state management
  private searchQuerySignal = signal<string>('');
  private selectedCategorySignal = signal<Category | null>(null);

  // Read-only accessors
  searchQuery = this.searchQuerySignal.asReadonly();
  selectedCategory = this.selectedCategorySignal.asReadonly();

  setSearchQuery(query: string): void {
    this.searchQuerySignal.set(query);
  }

  setCategory(category: Category | null): void {
    this.selectedCategorySignal.set(category);
  }

  setSearchState(query: string, category: Category | null): void {
    this.searchQuerySignal.set(query);
    this.selectedCategorySignal.set(category);
  }

  clearSearch(): void {
    this.searchQuerySignal.set('');
    this.selectedCategorySignal.set(null);
  }
}

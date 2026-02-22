import { Component, output, signal, effect, ChangeDetectionStrategy, OnDestroy } from '@angular/core';

@Component({
  selector: 'app-search-bar',
  templateUrl: './search-bar.component.html',
  styleUrls: ['./search-bar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SearchBarComponent implements OnDestroy {
  searchChange = output<string>();
  searchQuery = signal('');

  private debounceTimer: ReturnType<typeof setTimeout> | null = null;

  constructor() {
    effect(() => {
      const query = this.searchQuery();

      if (this.debounceTimer) {
        clearTimeout(this.debounceTimer);
      }

      this.debounceTimer = setTimeout(() => {
        this.searchChange.emit(query);
      }, 300);
    });
  }

  ngOnDestroy(): void {
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }
  }

  onSearchInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    const sanitized = this.sanitizeSearchQuery(value);
    this.searchQuery.set(sanitized);
  }

  clearSearch(): void {
    this.searchQuery.set('');
  }

  /**
   * Sanitize search query to prevent XSS and handle special characters safely
   */
  private sanitizeSearchQuery(query: string): string {
    if (!query) {
      return '';
    }

    // Trim whitespace
    let sanitized = query.trim();

    // Remove any HTML tags
    sanitized = sanitized.replace(/<[^>]*>/g, '');

    // Remove potentially dangerous characters while keeping useful search characters
    // Allow: letters, numbers, spaces, hyphens, apostrophes, and common punctuation
    sanitized = sanitized.replace(/[^\w\s\-'.,!?@#$%&*()]/g, '');

    // Limit length to prevent excessive queries
    const MAX_SEARCH_LENGTH = 100;
    if (sanitized.length > MAX_SEARCH_LENGTH) {
      sanitized = sanitized.substring(0, MAX_SEARCH_LENGTH);
    }

    return sanitized;
  }
}

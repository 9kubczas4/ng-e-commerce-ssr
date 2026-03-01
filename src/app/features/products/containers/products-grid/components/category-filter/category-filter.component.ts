import { Component, ChangeDetectionStrategy, computed, input, inject } from '@angular/core';
import { Product, Category } from '@core/models/product.model';
import { SearchState } from '@core/services/search-state.service';

interface CategoryWithCount {
  name: string;
  count: number;
}

@Component({
  selector: 'app-category-filter',
  templateUrl: './category-filter.component.html',
  styleUrls: ['./category-filter.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CategoryFilterComponent {
  private searchStateService = inject(SearchState);

  // Signal-based inputs
  products = input.required<Product[]>();

  // Get selected category directly from state service
  selectedCategory = this.searchStateService.selectedCategory;

  // Computed categories with counts
  categories = computed(() => this.getCategories());

  private getCategories(): CategoryWithCount[] {
    const productList = this.products();
    const categoryMap = new Map<string, number>();

    // Count products per category
    productList.forEach(product => {
      const count = categoryMap.get(product.category) || 0;
      categoryMap.set(product.category, count + 1);
    });

    // Convert to array and sort alphabetically
    return Array.from(categoryMap.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }

  selectCategory(category: Category | null): void {
    this.searchStateService.setCategory(category);
  }

  isSelected(category: string | null): boolean {
    return this.selectedCategory() === category;
  }
}

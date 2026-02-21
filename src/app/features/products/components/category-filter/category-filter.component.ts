import { Component, ChangeDetectionStrategy, computed, input, output, signal } from '@angular/core';
import { Product } from '../../models/product.model';

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
  // Signal-based inputs
  products = input.required<Product[]>();

  // Outputs
  categoryChange = output<string | null>();

  // Local state
  selectedCategory = signal<string | null>(null);

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

  selectCategory(category: string | null): void {
    this.selectedCategory.set(category);
    this.categoryChange.emit(category);
  }

  isSelected(category: string | null): boolean {
    return this.selectedCategory() === category;
  }
}

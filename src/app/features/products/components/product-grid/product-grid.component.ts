import { Component, ChangeDetectionStrategy, computed, input, output } from '@angular/core';
import { Product } from '../../models/product.model';
import { ProductCardComponent } from '../product-card/product-card.component';
import { ProductCardSkeletonComponent } from '../product-card-skeleton/product-card-skeleton.component';

@Component({
  selector: 'app-product-grid',
  imports: [ProductCardComponent, ProductCardSkeletonComponent],
  templateUrl: './product-grid.component.html',
  styleUrl: './product-grid.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProductGridComponent {
  // Signal-based inputs
  products = input.required<Product[]>();
  searchQuery = input<string>('');
  selectedCategory = input<string | null>(null);
  isLoading = input<boolean>(false);

  // Computed filtered products
  filteredProducts = computed(() => this.filterProducts());

  // Outputs
  productClick = output<string>();
  addToBasket = output<Product>();

  // Helper for skeleton loaders
  get skeletonArray(): number[] {
    return Array(6).fill(0);
  }

  private filterProducts(): Product[] {
    let filtered = this.products();
    const query = this.searchQuery().toLowerCase().trim();
    const category = this.selectedCategory();

    // Apply search filter
    if (query) {
      filtered = filtered.filter(product =>
        product.title.toLowerCase().includes(query) ||
        product.description.toLowerCase().includes(query)
      );
    }

    // Apply category filter
    if (category) {
      filtered = filtered.filter(product => product.category === category);
    }

    return filtered;
  }

  onProductClick(productId: string): void {
    this.productClick.emit(productId);
  }

  onAddToBasket(product: Product): void {
    this.addToBasket.emit(product);
  }
}

import { Component, ChangeDetectionStrategy, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ProductService } from '@core/services/product.service';
import { BasketService } from '@core/services/basket.service';
import { SearchState } from '@core/services/search-state.service';
import { Product } from '@core/models/product.model';
import { ProductGridComponent } from './components/product-grid/product-grid.component';
import { SearchBarComponent } from './components/search-bar/search-bar.component';
import { CategoryFilterComponent } from './components/category-filter/category-filter.component';
import { ProductCardSkeletonComponent } from './components/product-card-skeleton/product-card-skeleton.component';

@Component({
  selector: 'app-product-list',
  imports: [ProductGridComponent, SearchBarComponent, CategoryFilterComponent, ProductCardSkeletonComponent],
  templateUrl: './product-list.component.html',
  styleUrl: './product-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProductListComponent implements OnInit {
  private productService = inject(ProductService);
  private basketService = inject(BasketService);
  private searchStateService = inject(SearchState);
  private router = inject(Router);

  // State
  products = this.productService.products;
  loading = this.productService.loading;
  searchQuery = this.searchStateService.searchQuery;
  selectedCategory = this.searchStateService.selectedCategory;

  ngOnInit(): void {
    // Load products on initialization
    this.productService.loadProducts();
  }

  onAddToBasket(product: Product): void {
    this.basketService.addItem(product);
  }

  onProductClick(productId: string): void {
    this.router.navigate(['/product', productId]);
  }
}

import { Component, inject, computed, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Product } from '../../../products/models/product.model';
import { ProductService } from '../../../../core/services/product.service';
import { BasketService } from '../../../../core/services/basket.service';

@Component({
  selector: 'app-product-details-page',
  templateUrl: './product-details-page.component.html',
  styleUrls: ['./product-details-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProductDetailsPageComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private productService = inject(ProductService);
  private basketService = inject(BasketService);

  product = computed<Product | undefined>(() => {
    const productId = this.route.snapshot.paramMap.get('id');
    if (!productId) return undefined;
    return this.productService.getProductById(productId);
  });

  discountedPrice = computed(() => {
    const p = this.product();
    if (!p) return 0;
    return p.discount ? p.price * (1 - p.discount / 100) : p.price;
  });

  hasDiscount = computed(() => !!this.product()?.discount);

  ngOnInit(): void {
    // Load products if not already loaded (e.g., direct navigation to this page)
    if (this.productService.products().length === 0) {
      this.productService.loadProducts();
    }

    const productId = this.route.snapshot.paramMap.get('id');

    if (!productId) {
      this.router.navigate(['/']);
      return;
    }

    const foundProduct = this.productService.getProductById(productId);

    if (!foundProduct) {
      // Invalid product ID, redirect to home
      this.router.navigate(['/']);
    }
  }

  addToBasket(): void {
    const p = this.product();
    if (p) {
      this.basketService.addItem(p);
    }
  }

  goBack(): void {
    this.router.navigate(['/']);
  }
}

import { Component, ChangeDetectionStrategy, computed, input, output } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { Product } from '../../models/product.model';

@Component({
  selector: 'app-product-card',
  imports: [NgOptimizedImage],
  template: `
<div class="product-card glass-effect" (click)="onCardClick()">
  <div class="product-image">
    <img
      [ngSrc]="product().imageUrl"
      [alt]="product().title"
      width="400"
      height="300"
      priority />
    @if (hasDiscount()) {
      <div class="discount-badge" aria-label="{{ product().discount }}% discount">-{{ product().discount }}%</div>
    }
  </div>

  <div class="product-content">
    <h3 class="product-title">{{ product().title }}</h3>
    <p class="product-description">{{ product().description }}</p>

    <div class="product-footer">
      <div class="product-pricing">
        @if (hasDiscount()) {
          <span class="original-price" aria-label="Original price">\${{ product().price.toFixed(2) }}</span>
          <span class="discounted-price" aria-label="Discounted price">\${{ discountedPrice().toFixed(2) }}</span>
        } @else {
          <span class="price" aria-label="Price">\${{ product().price.toFixed(2) }}</span>
        }
      </div>

      <button
        class="add-to-basket-btn"
        (click)="onAddToBasket($event)"
        type="button"
        aria-label="Add {{ product().title }} to basket">
        Add to Basket
      </button>
    </div>
  </div>
</div>
  `,
  styles: [`
    .product-card {
      cursor: pointer;
      transition: transform 0.2s ease;
      display: flex;
      flex-direction: column;
      height: 100%;
    }

    .product-card:hover {
      transform: translateY(-4px);
    }

    .product-image {
      position: relative;
      width: 100%;
      aspect-ratio: 4 / 3;
      overflow: hidden;
      border-radius: 12px 12px 0 0;
    }

    .product-image img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .discount-badge {
      position: absolute;
      top: 12px;
      right: 12px;
      background: var(--accent-color);
      color: white;
      padding: 6px 12px;
      border-radius: 20px;
      font-weight: 600;
      font-size: 0.875rem;
    }

    .product-content {
      padding: 1.5rem;
      display: flex;
      flex-direction: column;
      flex: 1;
    }

    .product-title {
      font-size: 1.25rem;
      font-weight: 600;
      margin: 0 0 0.5rem 0;
      color: var(--text-primary);
    }

    .product-description {
      color: var(--text-secondary);
      margin: 0 0 1rem 0;
      flex: 1;
      display: -webkit-box;
      -webkit-line-clamp: 3;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .product-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 1rem;
      margin-top: auto;
    }

    .product-pricing {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .price {
      font-size: 1.5rem;
      font-weight: 700;
      color: var(--text-primary);
    }

    .original-price {
      font-size: 1rem;
      color: var(--text-secondary);
      text-decoration: line-through;
    }

    .discounted-price {
      font-size: 1.5rem;
      font-weight: 700;
      color: var(--accent-color);
    }

    .add-to-basket-btn {
      padding: 0.75rem 1.5rem;
      background: var(--accent-color);
      color: white;
      border: none;
      border-radius: 8px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s ease;
      white-space: nowrap;
    }

    .add-to-basket-btn:hover {
      background: var(--accent-hover);
      transform: scale(1.05);
    }

    .add-to-basket-btn:active {
      transform: scale(0.98);
    }

    @media (max-width: 768px) {
      .product-footer {
        flex-direction: column;
        align-items: stretch;
      }

      .add-to-basket-btn {
        width: 100%;
      }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '(keydown.enter)': 'onCardClick()',
    '(keydown.space)': 'onCardClick()',
    'tabindex': '0',
    'role': 'article'
  }
})
export class ProductCardComponent {
  // Signal-based input
  product = input.required<Product>();

  // Outputs
  addToBasket = output<Product>();
  cardClick = output<string>();

  // Computed values
  discountedPrice = computed(() => {
    const p = this.product();
    return p.discount ? p.price * (1 - p.discount / 100) : p.price;
  });

  hasDiscount = computed(() => !!this.product().discount);

  onAddToBasket(event: Event): void {
    event.stopPropagation();
    this.addToBasket.emit(this.product());
  }

  onCardClick(): void {
    this.cardClick.emit(this.product().id);
  }
}

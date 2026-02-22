import { Component, ChangeDetectionStrategy, computed, input, output, signal } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { Product } from '../../../../models/product.model';

@Component({
  selector: 'app-product-card',
  imports: [NgOptimizedImage],
  templateUrl: './product-card.component.html',
  styleUrl: './product-card.component.scss',
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

  // Local state for add-to-basket feedback
  private addedToBasket = signal(false);
  showAddedFeedback = this.addedToBasket.asReadonly();

  // Computed values
  discountedPrice = computed(() => {
    const p = this.product();
    return p.discount ? p.price * (1 - p.discount / 100) : p.price;
  });

  hasDiscount = computed(() => !!this.product().discount);

  onAddToBasket(event: Event): void {
    event.stopPropagation();
    this.addToBasket.emit(this.product());

    // Show feedback animation
    this.addedToBasket.set(true);
    setTimeout(() => {
      this.addedToBasket.set(false);
    }, 2000);
  }

  onCardClick(): void {
    this.cardClick.emit(this.product().id);
  }
}

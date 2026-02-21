import { Component, ChangeDetectionStrategy, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BasketService } from '../../../../core/services/basket.service';

@Component({
  selector: 'app-basket-sidebar',
  imports: [CommonModule],
  templateUrl: './basket-sidebar.component.html',
  styleUrls: ['./basket-sidebar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BasketSidebarComponent {
  private basketService = inject(BasketService);

  isOpen = signal(false);
  basket = this.basketService.basket;

  open(): void {
    this.isOpen.set(true);
  }

  close(): void {
    this.isOpen.set(false);
  }

  removeItem(productId: string): void {
    this.basketService.removeItem(productId);
  }

  incrementQuantity(productId: string, currentQuantity: number): void {
    this.basketService.updateQuantity(productId, currentQuantity + 1);
  }

  decrementQuantity(productId: string, currentQuantity: number): void {
    if (currentQuantity > 1) {
      this.basketService.updateQuantity(productId, currentQuantity - 1);
    }
  }

  getItemPrice(price: number, discount: number | undefined, quantity: number): number {
    const itemPrice = discount ? price * (1 - discount / 100) : price;
    return Math.round(itemPrice * quantity * 100) / 100;
  }
}

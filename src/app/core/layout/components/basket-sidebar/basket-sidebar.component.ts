import { Component, ChangeDetectionStrategy, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { BasketService } from '@core/services/basket.service';

@Component({
  selector: 'app-basket-sidebar',
  imports: [CommonModule],
  templateUrl: './basket-sidebar.component.html',
  styleUrls: ['./basket-sidebar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BasketSidebarComponent {
  private basketService = inject(BasketService);
  private router = inject(Router);

  isOpen = signal(false);
  basket = this.basketService.basket;

  open(): void {
    this.isOpen.set(true);
  }

  close(): void {
    this.isOpen.set(false);
  }

  navigateToCheckout(): void {
    this.close();
    this.router.navigate(['/checkout']);
  }

  removeItem(productId: string): void {
    this.basketService.removeItem(productId);
  }

  incrementQuantity(productId: string, currentQuantity: number): void {
    const newQuantity = currentQuantity + 1;
    // Validate before updating - max is 99
    if (newQuantity <= 99) {
      this.basketService.updateQuantity(productId, newQuantity);
    }
  }

  decrementQuantity(productId: string, currentQuantity: number): void {
    const newQuantity = currentQuantity - 1;
    // Validate before updating - min is 1
    if (newQuantity >= 1) {
      this.basketService.updateQuantity(productId, newQuantity);
    }
  }

  getItemPrice(price: number, discount: number | undefined, quantity: number): number {
    const itemPrice = discount ? price * (1 - discount / 100) : price;
    return Math.round(itemPrice * quantity * 100) / 100;
  }
}

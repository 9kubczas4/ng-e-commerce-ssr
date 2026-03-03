import { Component, ChangeDetectionStrategy, inject, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { DecimalPipe } from '@angular/common';

@Component({
  selector: 'app-order-confirmation',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './order-confirmation.component.html',
  styleUrls: ['./order-confirmation.component.scss'],
  imports: [DecimalPipe],
})
export class OrderConfirmationComponent implements OnInit, OnDestroy {
  protected readonly router = inject(Router);

  protected orderTotal = 0;
  protected orderItemCount = 0;
  protected orderId = '';

  private redirectTimer: ReturnType<typeof setTimeout> | null = null;

  ngOnInit(): void {
    // Get order data from navigation state
    const navigation = this.router.getCurrentNavigation();
    const state = navigation?.extras.state || history.state;

    if (state && state['orderTotal'] !== undefined) {
      this.orderTotal = state['orderTotal'];
      this.orderItemCount = state['orderItemCount'];
      this.orderId = state['orderId'] || '';
    } else {
      // No order data, redirect to home
      this.router.navigate(['/']);
      return;
    }
  }

  ngOnDestroy(): void {
    if (this.redirectTimer !== null) {
      clearTimeout(this.redirectTimer);
      this.redirectTimer = null;
    }
  }
}

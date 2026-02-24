import {
  Component,
  ChangeDetectionStrategy,
  signal,
  computed,
  inject,
  PLATFORM_ID,
  OnDestroy,
} from '@angular/core';
import { Router } from '@angular/router';
import { isPlatformBrowser, DecimalPipe } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { BasketService } from '@core/services/basket.service';
import { createCheckoutForm } from './form/checkout.form';
import { CheckoutFormValue, OrderResult } from './models/checkout.model';
import { FieldErrorPipe } from './pipes/field-error.pipe';
import { FieldInvalidPipe } from './pipes/field-invalid.pipe';

@Component({
  selector: 'app-checkout',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.scss'],
  imports: [DecimalPipe, ReactiveFormsModule, FieldErrorPipe, FieldInvalidPipe],
})
export class CheckoutComponent implements OnDestroy {
  private readonly basketService = inject(BasketService);
  protected readonly router = inject(Router);
  private readonly platformId = inject(PLATFORM_ID);

  // State signals
  protected isSubmitting = signal(false);
  protected isSubmitted = signal(false);
  protected submitError = signal<string | null>(null);

  // Redirect timer reference
  private redirectTimer: ReturnType<typeof setTimeout> | null = null;

  // Form
  protected checkoutForm = createCheckoutForm();

  // Form groups for template access
  protected get shippingForm() {
    return this.checkoutForm.get('shipping')!;
  }

  protected get paymentForm() {
    return this.checkoutForm.get('payment')!;
  }

  // Computed basket data
  protected basketData = computed(() => {
    const basket = this.basketService.basket();
    return {
      items: basket.items,
      subtotal: basket.totalPrice,
      total: basket.totalPrice,
      itemCount: basket.itemCount,
    };
  });

  /**
   * Handle form submission
   */
  protected handleSubmit(): void {
    // Reset error state
    this.submitError.set(null);

    // Validate form
    if (this.checkoutForm.invalid) {
      this.checkoutForm.markAllAsTouched();
      return;
    }

    // Process order
    this.isSubmitting.set(true);
    this.processOrder(this.checkoutForm.value as CheckoutFormValue)
      .then((result) => {
        if (result.success) {
          this.isSubmitted.set(true);
          this.clearBasketAndRedirect();
        } else {
          this.submitError.set(result.message);
        }
      })
      .catch((error) => {
        this.submitError.set(
          error?.message || 'An error occurred while processing your order'
        );
      })
      .finally(() => {
        this.isSubmitting.set(false);
      });
  }

  /**
   * Simulate order processing with async timeout
   */
  private processOrder(formValue: CheckoutFormValue): Promise<OrderResult> {
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log('Order processed:', formValue);
        resolve({
          success: true,
          orderId: `ORD-${Date.now()}`,
          message: 'Order processed successfully',
          timestamp: Date.now(),
        });
      }, 1500);
    });
  }

  /**
   * Clear basket and redirect to home with timed delay
   */
  private clearBasketAndRedirect(): void {
    // Clear basket immediately
    this.basketService.clearBasket();

    // Redirect after 5 seconds (only in browser)
    if (isPlatformBrowser(this.platformId)) {
      this.redirectTimer = setTimeout(() => {
        this.router.navigate(['/']);
      }, 5000);
    }
  }

  /**
   * Cleanup on component destroy
   */
  ngOnDestroy(): void {
    // Clear redirect timer if it exists
    if (this.redirectTimer !== null) {
      clearTimeout(this.redirectTimer);
      this.redirectTimer = null;
    }
  }
}

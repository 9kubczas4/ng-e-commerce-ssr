import {
  Component,
  ChangeDetectionStrategy,
  signal,
  computed,
  inject,
  PLATFORM_ID,
  OnDestroy,
  afterNextRender,
} from '@angular/core';
import { Router } from '@angular/router';
import { isPlatformBrowser, DecimalPipe, AsyncPipe } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { BasketService } from '@core/services/basket.service';
import { createCheckoutForm } from './form/checkout.form';
import { CheckoutFormValue, OrderResult } from './models/checkout.model';
import { FieldErrorPipe } from './pipes/field-error.pipe';

@Component({
  selector: 'app-checkout',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.scss'],
  imports: [DecimalPipe, AsyncPipe, ReactiveFormsModule, FieldErrorPipe],
})
export class CheckoutComponent implements OnDestroy {
  private readonly basketService = inject(BasketService);
  protected readonly router = inject(Router);
  private readonly platformId = inject(PLATFORM_ID);

  constructor() {
    // Focus the full name input after the component renders (browser only)
    afterNextRender(() => {
      if (isPlatformBrowser(this.platformId)) {
        const fullNameInput = document.getElementById('fullName');
        if (fullNameInput) {
          fullNameInput.focus();
        }
      }
    });
  }

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

    // Mark all fields as touched to show validation errors
    this.checkoutForm.markAllAsTouched();

    // Validate form
    if (this.checkoutForm.invalid) {
      // Focus on first invalid field for accessibility
      this.focusFirstInvalidField();
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

  /**
   * Focus on the first invalid field for better accessibility
   */
  private focusFirstInvalidField(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    // Find the first invalid control
    const invalidControl = this.findFirstInvalidControl(this.checkoutForm);
    if (!invalidControl) {
      return;
    }

    // Get the control name path
    const controlPath = this.getControlPath(this.checkoutForm, invalidControl);
    if (!controlPath) {
      return;
    }

    // Convert path to element ID (e.g., 'shipping.fullName' -> 'fullName')
    const fieldId = controlPath.split('.').pop();
    if (!fieldId) {
      return;
    }

    // Focus the element
    setTimeout(() => {
      const element = document.getElementById(fieldId);
      if (element) {
        element.focus();
      }
    }, 0);
  }

  /**
   * Recursively find the first invalid control in a form group
   */
  private findFirstInvalidControl(formGroup: import('@angular/forms').AbstractControl): import('@angular/forms').AbstractControl | null {
    if (!('controls' in formGroup)) {
      return null;
    }

    const controls = (formGroup as import('@angular/forms').FormGroup).controls;
    for (const name in controls) {
      const control = controls[name];
      if (control.invalid) {
        if ('controls' in control) {
          // It's a FormGroup, recurse
          const nestedInvalid = this.findFirstInvalidControl(control);
          if (nestedInvalid) {
            return nestedInvalid;
          }
        } else {
          // It's a FormControl
          return control;
        }
      }
    }
    return null;
  }

  /**
   * Get the path to a control within a form group
   */
  private getControlPath(
    formGroup: import('@angular/forms').AbstractControl,
    targetControl: import('@angular/forms').AbstractControl,
    path = ''
  ): string | null {
    if (!('controls' in formGroup)) {
      return null;
    }

    const controls = (formGroup as import('@angular/forms').FormGroup).controls;
    for (const name in controls) {
      const control = controls[name];
      const currentPath = path ? `${path}.${name}` : name;

      if (control === targetControl) {
        return currentPath;
      }

      if ('controls' in control) {
        const nestedPath = this.getControlPath(control, targetControl, currentPath);
        if (nestedPath) {
          return nestedPath;
        }
      }
    }
    return null;
  }
}

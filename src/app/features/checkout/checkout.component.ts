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
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { BasketService } from '@core/services/basket.service';
import {
  createCheckoutForm,
  CheckoutFormControls,
  ShippingFormControls,
  PaymentFormControls,
} from './form/checkout.form';
import { CheckoutFormValue, OrderResult } from './models/checkout.model';
import { FieldErrorPipe } from './pipes/field-error.pipe';
import { AgentSubmitEvent } from '@core/models/webmcp.model';
import { collectFormErrors } from './utils/form-errors.helper';
import { WebmcpFormSyncDirective } from '@shared/directives/webmcp-form-sync.directive';

@Component({
  selector: 'app-checkout',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.scss'],
  imports: [DecimalPipe, AsyncPipe, ReactiveFormsModule, FieldErrorPipe, WebmcpFormSyncDirective],
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

  /**
   * Format expiry date input as MM/YY
   * Automatically inserts "/" after 2 digits
   */
  protected formatExpiryDate(event: Event): void {
    const input = event.target as HTMLInputElement;
    let value = input.value.replace(/\D/g, ''); // Remove non-digits

    // Auto-insert "/" after 2 digits
    if (value.length >= 2) {
      value = value.slice(0, 2) + '/' + value.slice(2, 4);
    }

    // Update the form control with formatted value
    this.paymentForm.controls.expiryDate.setValue(value, { emitEvent: false });
  }

  // State signals
  protected isSubmitting = signal(false);
  protected isSubmitted = signal(false);
  protected submitError = signal<string | null>(null);
  protected agentInvoked = signal(false);

  // Redirect timer reference
  private redirectTimer: ReturnType<typeof setTimeout> | null = null;

  // Form
  protected checkoutForm: FormGroup<CheckoutFormControls> = createCheckoutForm();

  // Form groups for template access
  protected get shippingForm(): FormGroup<ShippingFormControls> {
    return this.checkoutForm.controls.shipping;
  }

  protected get paymentForm(): FormGroup<PaymentFormControls> {
    return this.checkoutForm.controls.payment;
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
  protected handleSubmit(event: SubmitEvent): void {
    // Cast to AgentSubmitEvent to access WebMCP properties
    const agentEvent = event as AgentSubmitEvent;

    // Update agentInvoked signal
    this.agentInvoked.set(agentEvent.agentInvoked ?? false);

    // Reset error state
    this.submitError.set(null);

    // Mark all fields as touched to show validation errors
    this.checkoutForm.markAllAsTouched();

    // Validate form
    if (this.checkoutForm.invalid) {
      // Handle agent-invoked validation errors
      if (agentEvent.agentInvoked) {
        event.preventDefault();
        const validationErrors = collectFormErrors(this.checkoutForm);
        agentEvent.respondWith?.(
          Promise.reject({
            error: 'Validation failed',
            details: validationErrors,
          })
        );
        return;
      }

      // Focus on first invalid field for accessibility (user submission)
      this.focusFirstInvalidField();
      return;
    }

    // Handle agent-invoked submission
    if (agentEvent.agentInvoked) {
      event.preventDefault();
      this.isSubmitting.set(true);

      const submissionPromise = this.processOrder(this.checkoutForm.value as CheckoutFormValue)
        .then((result) => {
          if (result.success) {
            this.isSubmitted.set(true);
            this.clearBasketAndRedirect();
            return {
              success: true,
              message: result.message,
              orderId: result.orderId,
            };
          } else {
            this.submitError.set(result.message);
            throw new Error(result.message);
          }
        })
        .catch((error) => {
          const errorMessage = error?.message || 'An error occurred while processing your order';
          this.submitError.set(errorMessage);
          throw { error: errorMessage };
        })
        .finally(() => {
          this.isSubmitting.set(false);
        });

      agentEvent.respondWith?.(submissionPromise);
      return;
    }

    // Process order for regular user submission
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
        this.submitError.set(error?.message || 'An error occurred while processing your order');
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
  private findFirstInvalidControl(
    formGroup: FormGroup<CheckoutFormControls>
  ): FormGroup<ShippingFormControls | PaymentFormControls> | null {
    const controls = formGroup.controls;

    for (const name in controls) {
      const control = controls[name as keyof CheckoutFormControls];
      if (control.invalid) {
        return control as FormGroup<ShippingFormControls | PaymentFormControls>;
      }
    }
    return null;
  }

  /**
   * Get the path to a control within a form group
   */
  private getControlPath(
    formGroup: FormGroup<CheckoutFormControls>,
    targetControl: FormGroup<ShippingFormControls | PaymentFormControls>,
    path = ''
  ): string | null {
    const controls = formGroup.controls;

    for (const name in controls) {
      const control = controls[name as keyof CheckoutFormControls];
      const currentPath = path ? `${path}.${name}` : name;

      if (control === targetControl) {
        return currentPath;
      }
    }
    return null;
  }
}

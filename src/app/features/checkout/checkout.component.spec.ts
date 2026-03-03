import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { CheckoutComponent } from './checkout.component';
import { BasketService } from '@core/services/basket.service';
import { signal } from '@angular/core';
import { Basket } from '@core/models/basket.model';
import { Product } from '@core/models/product.model';

describe('CheckoutComponent', () => {
  let component: CheckoutComponent;
  let fixture: ComponentFixture<CheckoutComponent>;
  let mockBasketService: {
    basket: ReturnType<typeof signal<Basket<Product>>>;
    clearBasket: ReturnType<typeof vi.fn>;
  };
  let mockRouter: { navigate: ReturnType<typeof vi.fn> };

  const mockProduct: Product = {
    id: '1',
    title: 'Test Product',
    description: 'Test Description',
    price: 99.99,
    category: 'test',
    image: 'test.jpg',
    rating: { rate: 4.5, count: 100 },
  };

  const mockBasket: Basket<Product> = {
    items: [{ product: mockProduct, quantity: 2 }],
    totalPrice: 199.98,
    itemCount: 2,
  };

  beforeEach(async () => {
    mockBasketService = {
      basket: signal(mockBasket),
      clearBasket: vi.fn(),
    };

    mockRouter = {
      navigate: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [CheckoutComponent],
      providers: [
        { provide: BasketService, useValue: mockBasketService },
        { provide: Router, useValue: mockRouter },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CheckoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Form Initialization', () => {
    it('should initialize checkout form with empty values', () => {
      expect(component['checkoutForm'].get('shipping.fullName')?.value).toBe('');
      expect(component['checkoutForm'].get('shipping.streetAddress')?.value).toBe('');
      expect(component['checkoutForm'].get('payment.cardNumber')?.value).toBe('');
      expect(component['checkoutForm'].get('payment.cvv')?.value).toBe('');
    });

    it('should initialize form as invalid when empty', () => {
      expect(component['checkoutForm'].valid).toBe(false);
    });

    it('should initialize state signals with correct default values', () => {
      expect(component['isSubmitting']()).toBe(false);
      expect(component['submitError']()).toBeNull();
    });
  });

  describe('Basket Data', () => {
    it('should compute basket data from basket service', () => {
      const basketData = component['basketData']();

      expect(basketData.items).toEqual(mockBasket.items);
      expect(basketData.subtotal).toBe(199.98);
      expect(basketData.total).toBe(199.98);
      expect(basketData.itemCount).toBe(2);
    });

    it('should react to basket changes', () => {
      const newBasket: Basket<Product> = {
        items: [{ product: mockProduct, quantity: 3 }],
        totalPrice: 299.97,
        itemCount: 3,
      };

      mockBasketService.basket.set(newBasket);
      fixture.detectChanges();

      const basketData = component['basketData']();
      expect(basketData.itemCount).toBe(3);
      expect(basketData.total).toBe(299.97);
    });
  });

  describe('Form Submission with Invalid Data', () => {
    it('should not submit when form is invalid', () => {
      const mockEvent = new Event('submit') as SubmitEvent;
      component['handleSubmit'](mockEvent);

      expect(component['isSubmitting']()).toBe(false);
    });

    it('should mark all fields as touched when submitting invalid form', () => {
      const markAllAsTouchedSpy = vi.spyOn(component['checkoutForm'], 'markAllAsTouched');
      const mockEvent = new Event('submit') as SubmitEvent;

      component['handleSubmit'](mockEvent);

      expect(markAllAsTouchedSpy).toHaveBeenCalled();
    });
  });

  describe('Form Submission with Valid Data', () => {
    beforeEach(() => {
      // Fill in valid form data
      component['checkoutForm'].patchValue({
        shipping: {
          fullName: 'John Doe',
          streetAddress: '123 Main Street',
          city: 'New York',
          postalCode: '10001',
          country: 'USA',
        },
        payment: {
          cardNumber: '1234567890123456',
          expiryDate: '12/26',
          cvv: '123',
          cardholderName: 'John Doe',
        },
      });
      // Ensure form is valid
      component['checkoutForm'].updateValueAndValidity();
    });

    it('should submit form with valid data', async () => {
      const mockEvent = new Event('submit') as SubmitEvent;
      component['handleSubmit'](mockEvent);

      expect(component['isSubmitting']()).toBe(true);

      // Wait for async processing
      await new Promise((resolve) => setTimeout(resolve, 1600));

      expect(component['isSubmitting']()).toBe(false);
      expect(mockRouter.navigate).toHaveBeenCalledWith(
        ['/checkout/confirmation'],
        expect.objectContaining({
          state: expect.objectContaining({
            orderTotal: expect.any(Number),
            orderItemCount: expect.any(Number),
            orderId: expect.any(String),
          }),
        })
      );
    });

    it('should clear basket after successful submission', async () => {
      const mockEvent = new Event('submit') as SubmitEvent;
      component['handleSubmit'](mockEvent);

      // Wait for async processing
      await new Promise((resolve) => setTimeout(resolve, 1600));

      expect(mockBasketService.clearBasket).toHaveBeenCalled();
    });

    it('should navigate to confirmation page after successful submission', async () => {
      const mockEvent = new Event('submit') as SubmitEvent;
      component['handleSubmit'](mockEvent);

      // Wait for async processing
      await new Promise((resolve) => setTimeout(resolve, 1600));

      expect(mockRouter.navigate).toHaveBeenCalledWith(
        ['/checkout/confirmation'],
        expect.objectContaining({
          state: expect.objectContaining({
            orderTotal: expect.any(Number),
            orderItemCount: expect.any(Number),
            orderId: expect.any(String),
          }),
        })
      );
    });

    it('should reset error state on new submission', () => {
      component['submitError'].set('Previous error');
      const mockEvent = new Event('submit') as SubmitEvent;

      component['handleSubmit'](mockEvent);

      expect(component['submitError']()).toBeNull();
    });
  });

  describe('Loading State', () => {
    beforeEach(() => {
      // Fill in valid form data
      component['checkoutForm'].patchValue({
        shipping: {
          fullName: 'John Doe',
          streetAddress: '123 Main Street',
          city: 'New York',
          postalCode: '10001',
          country: 'USA',
        },
        payment: {
          cardNumber: '1234567890123456',
          expiryDate: '12/26',
          cvv: '123',
          cardholderName: 'John Doe',
        },
      });
      // Ensure form is valid
      component['checkoutForm'].updateValueAndValidity();
    });

    it('should set loading state during processing', () => {
      const mockEvent = new Event('submit') as SubmitEvent;
      component['handleSubmit'](mockEvent);

      expect(component['isSubmitting']()).toBe(true);
    });

    it('should clear loading state after processing completes', async () => {
      const mockEvent = new Event('submit') as SubmitEvent;
      component['handleSubmit'](mockEvent);

      expect(component['isSubmitting']()).toBe(true);

      // Wait for async processing
      await new Promise((resolve) => setTimeout(resolve, 1600));

      expect(component['isSubmitting']()).toBe(false);
    });
  });

  describe('Error Handling', () => {
    it('should handle order processing errors', async () => {
      // Mock processOrder to reject
      vi.spyOn(component as any, 'processOrder').mockRejectedValue(
        new Error('Processing failed')
      );

      // Fill in valid form data
      component['checkoutForm'].patchValue({
        shipping: {
          fullName: 'John Doe',
          streetAddress: '123 Main Street',
          city: 'New York',
          postalCode: '10001',
          country: 'USA',
        },
        payment: {
          cardNumber: '1234567890123456',
          expiryDate: '12/26',
          cvv: '123',
          cardholderName: 'John Doe',
        },
      });
      // Ensure form is valid
      component['checkoutForm'].updateValueAndValidity();

      const mockEvent = new Event('submit') as SubmitEvent;
      component['handleSubmit'](mockEvent);

      // Wait for async processing
      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(component['submitError']()).toBe('Processing failed');
      expect(component['isSubmitting']()).toBe(false);
    });

    it('should display generic error message when error has no message', async () => {
      // Mock processOrder to reject with no message
      vi.spyOn(component as any, 'processOrder').mockRejectedValue({});

      // Fill in valid form data
      component['checkoutForm'].patchValue({
        shipping: {
          fullName: 'John Doe',
          streetAddress: '123 Main Street',
          city: 'New York',
          postalCode: '10001',
          country: 'USA',
        },
        payment: {
          cardNumber: '1234567890123456',
          expiryDate: '12/26',
          cvv: '123',
          cardholderName: 'John Doe',
        },
      });
      // Ensure form is valid
      component['checkoutForm'].updateValueAndValidity();

      const mockEvent = new Event('submit') as SubmitEvent;
      component['handleSubmit'](mockEvent);

      // Wait for async processing
      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(component['submitError']()).toBe(
        'An error occurred while processing your order'
      );
    });
  });

  describe('Form Validation', () => {
    it('should validate required shipping fields', () => {
      const shippingGroup = component['checkoutForm'].get('shipping');

      expect(shippingGroup?.get('fullName')?.hasError('required')).toBe(true);
      expect(shippingGroup?.get('streetAddress')?.hasError('required')).toBe(true);
      expect(shippingGroup?.get('city')?.hasError('required')).toBe(true);
      expect(shippingGroup?.get('postalCode')?.hasError('required')).toBe(true);
      expect(shippingGroup?.get('country')?.hasError('required')).toBe(true);
    });

    it('should validate required payment fields', () => {
      const paymentGroup = component['checkoutForm'].get('payment');

      expect(paymentGroup?.get('cardNumber')?.hasError('required')).toBe(true);
      expect(paymentGroup?.get('expiryDate')?.hasError('required')).toBe(true);
      expect(paymentGroup?.get('cvv')?.hasError('required')).toBe(true);
      expect(paymentGroup?.get('cardholderName')?.hasError('required')).toBe(true);
    });

    it('should validate minimum length for name fields', () => {
      const shippingGroup = component['checkoutForm'].get('shipping');

      shippingGroup?.get('fullName')?.setValue('A');
      expect(shippingGroup?.get('fullName')?.hasError('minlength')).toBe(true);

      shippingGroup?.get('fullName')?.setValue('John Doe');
      expect(shippingGroup?.get('fullName')?.hasError('minlength')).toBe(false);
    });
  });

  describe('Agent-Invoked Form Handling', () => {
    describe('Agent vs User Submission Detection', () => {
      it('should detect agent-invoked submission', () => {
        const mockEvent = new Event('submit') as SubmitEvent;
        Object.defineProperty(mockEvent, 'agentInvoked', {
          value: true,
          writable: false,
        });

        component['handleSubmit'](mockEvent);

        expect(component['agentInvoked']()).toBe(true);
      });

      it('should detect user-invoked submission', () => {
        const mockEvent = new Event('submit') as SubmitEvent;
        // No agentInvoked property means user submission

        component['handleSubmit'](mockEvent);

        expect(component['agentInvoked']()).toBe(false);
      });

      it('should handle agentInvoked as false explicitly', () => {
        const mockEvent = new Event('submit') as SubmitEvent;
        Object.defineProperty(mockEvent, 'agentInvoked', {
          value: false,
          writable: false,
        });

        component['handleSubmit'](mockEvent);

        expect(component['agentInvoked']()).toBe(false);
      });
    });

    describe('Agent Validation Error Responses', () => {
      it('should return validation errors for agent when form is invalid', async () => {
        const mockEvent = new Event('submit') as SubmitEvent;
        const preventDefaultSpy = vi.spyOn(mockEvent, 'preventDefault');
        let rejectedError: unknown;

        Object.defineProperty(mockEvent, 'agentInvoked', {
          value: true,
          writable: false,
        });
        Object.defineProperty(mockEvent, 'respondWith', {
          value: (promise: Promise<unknown>) => {
            promise.catch((error) => {
              rejectedError = error;
            });
          },
          writable: false,
        });

        component['handleSubmit'](mockEvent);

        // Wait for promise to reject
        await new Promise((resolve) => setTimeout(resolve, 50));

        expect(preventDefaultSpy).toHaveBeenCalled();
        expect(rejectedError).toBeDefined();
        expect((rejectedError as { error: string }).error).toBe('Validation failed');
        expect((rejectedError as { details: unknown }).details).toBeDefined();
      });

      it('should include field-level errors in validation response', async () => {
        const mockEvent = new Event('submit') as SubmitEvent;
        let rejectedError: unknown;

        Object.defineProperty(mockEvent, 'agentInvoked', {
          value: true,
          writable: false,
        });
        Object.defineProperty(mockEvent, 'respondWith', {
          value: (promise: Promise<unknown>) => {
            promise.catch((error) => {
              rejectedError = error;
            });
          },
          writable: false,
        });

        component['handleSubmit'](mockEvent);

        await new Promise((resolve) => setTimeout(resolve, 50));

        const errorDetails = (rejectedError as { details: Record<string, string[]> }).details;
        expect(errorDetails).toBeDefined();
        expect(errorDetails['shipping.fullName']).toContain('Full name is required');
        expect(errorDetails['shipping.streetAddress']).toContain('Street address is required');
        expect(errorDetails['payment.cardNumber']).toContain('Card number is required');
      });

      it('should not submit form when agent validation fails', async () => {
        const mockEvent = new Event('submit') as SubmitEvent;
        const respondWithMock = vi.fn((promise: Promise<unknown>) => {
          // Catch the rejection to prevent unhandled rejection warning
          promise.catch(() => {});
        });

        Object.defineProperty(mockEvent, 'agentInvoked', {
          value: true,
          writable: false,
        });
        Object.defineProperty(mockEvent, 'respondWith', {
          value: respondWithMock,
          writable: false,
        });

        component['handleSubmit'](mockEvent);

        await new Promise((resolve) => setTimeout(resolve, 50));

        expect(component['isSubmitting']()).toBe(false);
        expect(respondWithMock).toHaveBeenCalled();
      });
    });

    describe('Agent Success Response Structure', () => {
      beforeEach(() => {
        // Fill in valid form data
        component['checkoutForm'].patchValue({
          shipping: {
            fullName: 'Jane Smith',
            streetAddress: '456 Oak Avenue',
            city: 'Los Angeles',
            postalCode: '90001',
            country: 'US',
          },
          payment: {
            cardNumber: '4532015112830366',
            expiryDate: '12/28',
            cvv: '456',
            cardholderName: 'Jane Smith',
          },
        });
        component['checkoutForm'].updateValueAndValidity();
      });

      it('should return success response for agent when form is valid', async () => {
        const mockEvent = new Event('submit') as SubmitEvent;
        const preventDefaultSpy = vi.spyOn(mockEvent, 'preventDefault');
        let resolvedValue: unknown;

        Object.defineProperty(mockEvent, 'agentInvoked', {
          value: true,
          writable: false,
        });
        Object.defineProperty(mockEvent, 'respondWith', {
          value: (promise: Promise<unknown>) => {
            promise.then((value) => {
              resolvedValue = value;
            });
          },
          writable: false,
        });

        component['handleSubmit'](mockEvent);

        expect(preventDefaultSpy).toHaveBeenCalled();
        expect(component['isSubmitting']()).toBe(true);

        // Wait for async processing
        await new Promise((resolve) => setTimeout(resolve, 1600));

        expect(resolvedValue).toBeDefined();
        expect((resolvedValue as { success: boolean }).success).toBe(true);
        expect((resolvedValue as { message: string }).message).toBe('Order processed successfully');
        expect((resolvedValue as { orderId: string }).orderId).toMatch(/^ORD-\d+$/);
      });

      it('should navigate to confirmation page after agent submission succeeds', async () => {
        const mockEvent = new Event('submit') as SubmitEvent;
        Object.defineProperty(mockEvent, 'agentInvoked', {
          value: true,
          writable: false,
        });
        Object.defineProperty(mockEvent, 'respondWith', {
          value: vi.fn(),
          writable: false,
        });

        component['handleSubmit'](mockEvent);

        await new Promise((resolve) => setTimeout(resolve, 1600));

        expect(component['isSubmitting']()).toBe(false);
        expect(mockRouter.navigate).toHaveBeenCalledWith(
          ['/checkout/confirmation'],
          expect.objectContaining({
            state: expect.objectContaining({
              orderTotal: expect.any(Number),
              orderItemCount: expect.any(Number),
              orderId: expect.any(String),
            }),
          })
        );
      });

      it('should clear basket after agent submission succeeds', async () => {
        const mockEvent = new Event('submit') as SubmitEvent;
        Object.defineProperty(mockEvent, 'agentInvoked', {
          value: true,
          writable: false,
        });
        Object.defineProperty(mockEvent, 'respondWith', {
          value: vi.fn(),
          writable: false,
        });

        component['handleSubmit'](mockEvent);

        await new Promise((resolve) => setTimeout(resolve, 1600));

        expect(mockBasketService.clearBasket).toHaveBeenCalled();
      });

      it('should handle agent submission errors gracefully', async () => {
        // Mock processOrder to reject
        vi.spyOn(component as any, 'processOrder').mockRejectedValue(
          new Error('Payment processing failed')
        );

        const mockEvent = new Event('submit') as SubmitEvent;
        let rejectedError: unknown;

        Object.defineProperty(mockEvent, 'agentInvoked', {
          value: true,
          writable: false,
        });
        Object.defineProperty(mockEvent, 'respondWith', {
          value: (promise: Promise<unknown>) => {
            promise.catch((error) => {
              rejectedError = error;
            });
          },
          writable: false,
        });

        component['handleSubmit'](mockEvent);

        await new Promise((resolve) => setTimeout(resolve, 100));

        expect(rejectedError).toBeDefined();
        expect((rejectedError as { error: string }).error).toBe('Payment processing failed');
        expect(component['isSubmitting']()).toBe(false);
      });
    });

    describe('Card Field Security - Agent Population', () => {
      it('should allow agent to populate shipping fields', () => {
        // Simulate agent populating shipping fields
        component['checkoutForm'].patchValue({
          shipping: {
            fullName: 'Agent Populated Name',
            streetAddress: '789 Agent Street',
            city: 'Agent City',
            postalCode: '12345',
            country: 'US',
          },
        });

        const shippingGroup = component['checkoutForm'].get('shipping');
        expect(shippingGroup?.get('fullName')?.value).toBe('Agent Populated Name');
        expect(shippingGroup?.get('streetAddress')?.value).toBe('789 Agent Street');
        expect(shippingGroup?.get('city')?.value).toBe('Agent City');
        expect(shippingGroup?.get('postalCode')?.value).toBe('12345');
        expect(shippingGroup?.get('country')?.value).toBe('US');
      });

      it('should allow agent to populate cardholder name', () => {
        // Simulate agent populating cardholder name
        component['checkoutForm'].patchValue({
          payment: {
            cardholderName: 'Agent Populated Cardholder',
          },
        });

        const paymentGroup = component['checkoutForm'].get('payment');
        expect(paymentGroup?.get('cardholderName')?.value).toBe('Agent Populated Cardholder');
      });

      it('should keep card number empty when agent populates other fields', () => {
        // Simulate agent populating allowed fields only
        component['checkoutForm'].patchValue({
          shipping: {
            fullName: 'Agent User',
            streetAddress: '123 Agent Ave',
            city: 'Agent Town',
            postalCode: '54321',
            country: 'CA',
          },
          payment: {
            cardholderName: 'Agent User',
          },
        });

        const paymentGroup = component['checkoutForm'].get('payment');
        expect(paymentGroup?.get('cardNumber')?.value).toBe('');
        expect(paymentGroup?.get('expiryDate')?.value).toBe('');
        expect(paymentGroup?.get('cvv')?.value).toBe('');
      });

      it('should require manual entry of card details after agent population', () => {
        // Agent populates allowed fields
        component['checkoutForm'].patchValue({
          shipping: {
            fullName: 'Test User',
            streetAddress: '999 Test Lane',
            city: 'Test City',
            postalCode: '99999',
            country: 'GB',
          },
          payment: {
            cardholderName: 'Test User',
          },
        });

        // Form should still be invalid because card details are missing
        expect(component['checkoutForm'].valid).toBe(false);

        const paymentGroup = component['checkoutForm'].get('payment');
        expect(paymentGroup?.get('cardNumber')?.hasError('required')).toBe(true);
        expect(paymentGroup?.get('expiryDate')?.hasError('required')).toBe(true);
        expect(paymentGroup?.get('cvv')?.hasError('required')).toBe(true);
      });

      it('should validate form only after user manually enters card details', () => {
        // Agent populates allowed fields
        component['checkoutForm'].patchValue({
          shipping: {
            fullName: 'Complete User',
            streetAddress: '111 Complete St',
            city: 'Complete City',
            postalCode: '11111',
            country: 'US',
          },
          payment: {
            cardholderName: 'Complete User',
          },
        });

        expect(component['checkoutForm'].valid).toBe(false);

        // User manually enters card details
        component['checkoutForm'].patchValue({
          payment: {
            cardNumber: '4532015112830366',
            expiryDate: '06/29',
            cvv: '789',
          },
        });
        component['checkoutForm'].updateValueAndValidity();

        expect(component['checkoutForm'].valid).toBe(true);
      });
    });

    describe('Agent vs User Submission Behavior', () => {
      beforeEach(() => {
        // Fill in valid form data
        component['checkoutForm'].patchValue({
          shipping: {
            fullName: 'Test User',
            streetAddress: '123 Test Street',
            city: 'Test City',
            postalCode: '12345',
            country: 'US',
          },
          payment: {
            cardNumber: '4532015112830366',
            expiryDate: '12/27',
            cvv: '123',
            cardholderName: 'Test User',
          },
        });
        component['checkoutForm'].updateValueAndValidity();
      });

      it('should call preventDefault for agent submissions', () => {
        const mockEvent = new Event('submit') as SubmitEvent;
        const preventDefaultSpy = vi.spyOn(mockEvent, 'preventDefault');

        Object.defineProperty(mockEvent, 'agentInvoked', {
          value: true,
          writable: false,
        });
        Object.defineProperty(mockEvent, 'respondWith', {
          value: vi.fn(),
          writable: false,
        });

        component['handleSubmit'](mockEvent);

        expect(preventDefaultSpy).toHaveBeenCalled();
      });

      it('should not call preventDefault for user submissions', () => {
        const mockEvent = new Event('submit') as SubmitEvent;
        const preventDefaultSpy = vi.spyOn(mockEvent, 'preventDefault');

        component['handleSubmit'](mockEvent);

        expect(preventDefaultSpy).not.toHaveBeenCalled();
      });

      it('should call respondWith for agent submissions', () => {
        const mockEvent = new Event('submit') as SubmitEvent;
        const respondWithMock = vi.fn();

        Object.defineProperty(mockEvent, 'agentInvoked', {
          value: true,
          writable: false,
        });
        Object.defineProperty(mockEvent, 'respondWith', {
          value: respondWithMock,
          writable: false,
        });

        component['handleSubmit'](mockEvent);

        expect(respondWithMock).toHaveBeenCalled();
        expect(respondWithMock).toHaveBeenCalledWith(expect.any(Promise));
      });

      it('should not call respondWith for user submissions', () => {
        const mockEvent = new Event('submit') as SubmitEvent;
        const respondWithMock = vi.fn();

        Object.defineProperty(mockEvent, 'respondWith', {
          value: respondWithMock,
          writable: false,
        });

        component['handleSubmit'](mockEvent);

        expect(respondWithMock).not.toHaveBeenCalled();
      });
    });
  });
});

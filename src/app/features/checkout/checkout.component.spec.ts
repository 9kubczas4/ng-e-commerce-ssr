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
      expect(component['isSubmitted']()).toBe(false);
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
      expect(component['isSubmitted']()).toBe(false);
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

      expect(component['isSubmitted']()).toBe(true);
      expect(component['isSubmitting']()).toBe(false);
    });

    it('should clear basket after successful submission', async () => {
      const mockEvent = new Event('submit') as SubmitEvent;
      component['handleSubmit'](mockEvent);

      // Wait for async processing
      await new Promise((resolve) => setTimeout(resolve, 1600));

      expect(mockBasketService.clearBasket).toHaveBeenCalled();
    });

    it('should navigate to home after successful submission', async () => {
      const mockEvent = new Event('submit') as SubmitEvent;
      component['handleSubmit'](mockEvent);

      // Wait for async processing and redirect delay
      await new Promise((resolve) => setTimeout(resolve, 6600));

      expect(mockRouter.navigate).toHaveBeenCalledWith(['/']);
    }, 7000); // Increase timeout to 7 seconds

    it('should reset error state on new submission', () => {
      component['submitError'].set('Previous error');
      const mockEvent = new Event('submit') as SubmitEvent;

      component['handleSubmit'](mockEvent);

      expect(component['submitError']()).toBeNull();
    });
  });

  describe('Manual Redirect', () => {
    it('should navigate immediately when Return to Home button is clicked', () => {
      // Set component to submitted state
      component['isSubmitted'].set(true);
      fixture.detectChanges();

      // Find and click the Return to Home button
      const compiled = fixture.nativeElement as HTMLElement;
      const returnButton = compiled.querySelector('.btn-return-home') as HTMLButtonElement;

      expect(returnButton).toBeTruthy();

      returnButton.click();

      expect(mockRouter.navigate).toHaveBeenCalledWith(['/']);
    });

    it('should clear redirect timer when component is destroyed', async () => {
      // Spy on clearTimeout
      const clearTimeoutSpy = vi.spyOn(global, 'clearTimeout');

      // Fill in valid form and submit to trigger redirect timer
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
      component['checkoutForm'].updateValueAndValidity();
      const mockEvent = new Event('submit') as SubmitEvent;
      component['handleSubmit'](mockEvent);

      // Wait for async processing to complete and timer to be set
      await new Promise((resolve) => setTimeout(resolve, 1600));

      // Destroy component
      fixture.destroy();

      expect(clearTimeoutSpy).toHaveBeenCalled();
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
      expect(component['isSubmitted']()).toBe(false);
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
});

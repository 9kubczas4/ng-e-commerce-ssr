import {
  AbstractControl,
  FormControl,
  FormGroup,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';

// Postal code validator (supports various formats)
export function postalCodeValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value?.trim();
    if (!value) return null;

    // Support common formats: 12345, 12345-6789, A1A 1A1, etc.
    const postalCodePattern = /^[A-Z0-9]{3,10}([-\s][A-Z0-9]{3,4})?$/i;
    return postalCodePattern.test(value) ? null : { invalidPostalCode: true };
  };
}

// Card number validator (16 digits)
export function cardNumberValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value?.replace(/\s/g, '');
    if (!value) return null;

    const isValid = /^\d{16}$/.test(value);
    return isValid ? null : { invalidCardNumber: true };
  };
}

// Expiry date validator (MM/YY format, not in past)
export function expiryDateValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value?.trim();
    if (!value) return null;

    const expiryPattern = /^(0[1-9]|1[0-2])\/\d{2}$/;
    if (!expiryPattern.test(value)) {
      return { invalidExpiryFormat: true };
    }

    const [month, year] = value.split('/').map(Number);
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear() % 100;
    const currentMonth = currentDate.getMonth() + 1;

    if (year < currentYear || (year === currentYear && month < currentMonth)) {
      return { expiredCard: true };
    }

    return null;
  };
}

// CVV validator (3 or 4 digits)
export function cvvValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value?.trim();
    if (!value) return null;

    const isValid = /^\d{3,4}$/.test(value);
    return isValid ? null : { invalidCvv: true };
  };
}

// TypeScript types for form controls
export interface ShippingFormControls {
  fullName: FormControl<string>;
  streetAddress: FormControl<string>;
  city: FormControl<string>;
  postalCode: FormControl<string>;
  country: FormControl<string>;
}

export interface PaymentFormControls {
  cardNumber: FormControl<string>;
  expiryDate: FormControl<string>;
  cvv: FormControl<string>;
  cardholderName: FormControl<string>;
}

export interface CheckoutFormControls {
  shipping: FormGroup<ShippingFormControls>;
  payment: FormGroup<PaymentFormControls>;
}

// Form creation functions
export function createShippingGroup(): FormGroup<ShippingFormControls> {
  return new FormGroup({
    fullName: new FormControl('', {
      validators: [Validators.required, Validators.minLength(2)],
      nonNullable: true,
    }),
    streetAddress: new FormControl('', {
      validators: [Validators.required, Validators.minLength(5)],
      nonNullable: true,
    }),
    city: new FormControl('', {
      validators: [Validators.required, Validators.minLength(2)],
      nonNullable: true,
    }),
    postalCode: new FormControl('', {
      validators: [Validators.required, postalCodeValidator()],
      nonNullable: true,
    }),
    country: new FormControl('', {
      validators: [Validators.required],
      nonNullable: true,
    }),
  });
}

export function createPaymentGroup(): FormGroup<PaymentFormControls> {
  return new FormGroup({
    cardNumber: new FormControl('', {
      validators: [Validators.required, cardNumberValidator()],
      nonNullable: true,
    }),
    expiryDate: new FormControl('', {
      validators: [Validators.required, expiryDateValidator()],
      nonNullable: true,
    }),
    cvv: new FormControl('', {
      validators: [Validators.required, cvvValidator()],
      nonNullable: true,
    }),
    cardholderName: new FormControl('', {
      validators: [Validators.required, Validators.minLength(2)],
      nonNullable: true,
    }),
  });
}

export function createCheckoutForm(): FormGroup<CheckoutFormControls> {
  return new FormGroup({
    shipping: createShippingGroup(),
    payment: createPaymentGroup(),
  });
}

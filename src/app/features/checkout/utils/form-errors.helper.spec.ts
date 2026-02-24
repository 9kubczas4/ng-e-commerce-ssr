import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import {
  getFieldError,
  collectFormErrors,
  CHECKOUT_ERROR_MESSAGES,
} from './form-errors.helper';

describe('getFieldError', () => {
  it('should return empty string when errors is null', () => {
    const result = getFieldError('fullName', null);
    expect(result).toBe('');
  });

  it('should return empty string when field name is not in error messages', () => {
    const result = getFieldError('unknownField', { required: true });
    expect(result).toBe('');
  });

  it('should return correct error message for required fullName', () => {
    const result = getFieldError('fullName', { required: true });
    expect(result).toBe('Full name is required');
  });

  it('should return correct error message for minlength fullName', () => {
    const result = getFieldError('fullName', {
      minlength: { requiredLength: 2, actualLength: 1 },
    });
    expect(result).toBe('Full name must be at least 2 characters');
  });

  it('should return correct error message for required streetAddress', () => {
    const result = getFieldError('streetAddress', { required: true });
    expect(result).toBe('Street address is required');
  });

  it('should return correct error message for minlength streetAddress', () => {
    const result = getFieldError('streetAddress', {
      minlength: { requiredLength: 5, actualLength: 3 },
    });
    expect(result).toBe('Street address must be at least 5 characters');
  });

  it('should return correct error message for required city', () => {
    const result = getFieldError('city', { required: true });
    expect(result).toBe('City is required');
  });

  it('should return correct error message for invalidPostalCode', () => {
    const result = getFieldError('postalCode', { invalidPostalCode: true });
    expect(result).toBe('Invalid postal code format');
  });

  it('should return correct error message for required country', () => {
    const result = getFieldError('country', { required: true });
    expect(result).toBe('Country is required');
  });

  it('should return correct error message for invalidCardNumber', () => {
    const result = getFieldError('cardNumber', { invalidCardNumber: true });
    expect(result).toBe('Card number must be 16 digits');
  });

  it('should return correct error message for invalidExpiryFormat', () => {
    const result = getFieldError('expiryDate', { invalidExpiryFormat: true });
    expect(result).toBe('Expiry date must be in MM/YY format');
  });

  it('should return correct error message for expiredCard', () => {
    const result = getFieldError('expiryDate', { expiredCard: true });
    expect(result).toBe('Card has expired');
  });

  it('should return correct error message for invalidCvv', () => {
    const result = getFieldError('cvv', { invalidCvv: true });
    expect(result).toBe('CVV must be 3 or 4 digits');
  });

  it('should return correct error message for required cardholderName', () => {
    const result = getFieldError('cardholderName', { required: true });
    expect(result).toBe('Cardholder name is required');
  });

  it('should return "Invalid input" for unknown error key', () => {
    const result = getFieldError('fullName', { unknownError: true });
    expect(result).toBe('Invalid input');
  });

  it('should return first error when multiple errors exist', () => {
    const result = getFieldError('fullName', {
      required: true,
      minlength: { requiredLength: 2, actualLength: 0 },
    });
    expect(result).toBe('Full name is required');
  });
});

describe('collectFormErrors', () => {
  let fb: FormBuilder;

  beforeEach(() => {
    fb = new FormBuilder();
  });

  it('should return empty object when form is valid', () => {
    const form = fb.group({
      fullName: ['John Doe', Validators.required],
      city: ['New York', Validators.required],
    });

    const errors = collectFormErrors(form);

    expect(errors).toEqual({});
  });

  it('should collect errors from top-level controls', () => {
    const form = fb.group({
      fullName: ['', Validators.required],
      city: ['', Validators.required],
    });

    form.markAllAsTouched();

    const errors = collectFormErrors(form);

    expect(errors).toEqual({
      fullName: ['Full name is required'],
      city: ['City is required'],
    });
  });

  it('should collect errors from nested form groups', () => {
    const form = fb.group({
      shipping: fb.group({
        fullName: ['', Validators.required],
        city: ['', Validators.required],
      }),
      payment: fb.group({
        cardNumber: ['', Validators.required],
        cvv: ['', Validators.required],
      }),
    });

    form.markAllAsTouched();

    const errors = collectFormErrors(form);

    expect(errors).toEqual({
      'shipping.fullName': ['Full name is required'],
      'shipping.city': ['City is required'],
      'payment.cardNumber': ['Card number is required'],
      'payment.cvv': ['CVV is required'],
    });
  });

  it('should handle mixed valid and invalid controls', () => {
    const form = fb.group({
      fullName: ['John Doe', Validators.required],
      streetAddress: ['', Validators.required],
      city: ['New York', Validators.required],
    });

    form.markAllAsTouched();

    const errors = collectFormErrors(form);

    expect(errors).toEqual({
      streetAddress: ['Street address is required'],
    });
  });

  it('should collect multiple validation errors from single control', () => {
    const form = fb.group({
      fullName: ['A', [Validators.required, Validators.minLength(2)]],
    });

    form.markAllAsTouched();

    const errors = collectFormErrors(form);

    expect(errors['fullName']).toContain('Full name must be at least 2 characters');
    expect(errors['fullName'].length).toBe(1);
  });

  it('should handle deeply nested form groups', () => {
    const form = fb.group({
      checkout: fb.group({
        shipping: fb.group({
          fullName: ['', Validators.required],
          address: fb.group({
            streetAddress: ['', Validators.required],
            city: ['', Validators.required],
          }),
        }),
      }),
    });

    form.markAllAsTouched();

    const errors = collectFormErrors(form);

    expect(errors).toEqual({
      'checkout.shipping.fullName': ['Full name is required'],
      'checkout.shipping.address.streetAddress': [
        'Street address is required',
      ],
      'checkout.shipping.address.city': ['City is required'],
    });
  });

  it('should only collect errors from invalid controls', () => {
    const form = fb.group({
      fullName: ['John Doe', Validators.required],
      streetAddress: ['123 Main St', Validators.required],
      city: ['', Validators.required],
      postalCode: ['12345', Validators.required],
    });

    form.markAllAsTouched();

    const errors = collectFormErrors(form);

    expect(errors).toEqual({
      city: ['City is required'],
    });
  });

  it('should handle form with no controls', () => {
    const form = fb.group({});

    const errors = collectFormErrors(form);

    expect(errors).toEqual({});
  });
});

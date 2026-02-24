import { describe, it, expect } from 'vitest';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { FieldErrorPipe } from './field-error.pipe';
import {
  postalCodeValidator,
  cardNumberValidator,
  expiryDateValidator,
  cvvValidator,
} from '../form/checkout.form';

describe('FieldErrorPipe', () => {
  let pipe: FieldErrorPipe;

  beforeEach(() => {
    pipe = new FieldErrorPipe();
  });

  describe('required validation', () => {
    it('should return required error message for fullName', () => {
      const form = new FormGroup({
        fullName: new FormControl('', [Validators.required]),
      });
      const control = form.get('fullName')!;
      control.markAsTouched();
      control.updateValueAndValidity();

      const result = pipe.transform(form, 'fullName');

      expect(result).toBe('Full name is required');
    });

    it('should return required error message for cardNumber', () => {
      const form = new FormGroup({
        cardNumber: new FormControl('', [Validators.required]),
      });
      const control = form.get('cardNumber')!;
      control.markAsTouched();
      control.updateValueAndValidity();

      const result = pipe.transform(form, 'cardNumber');

      expect(result).toBe('Card number is required');
    });
  });

  describe('minlength validation', () => {
    it('should return minlength error message for fullName', () => {
      const form = new FormGroup({
        fullName: new FormControl('A', [Validators.minLength(2)]),
      });
      const control = form.get('fullName')!;
      control.markAsTouched();
      control.updateValueAndValidity();

      const result = pipe.transform(form, 'fullName');

      expect(result).toBe('Full name must be at least 2 characters');
    });

    it('should return minlength error message for streetAddress', () => {
      const form = new FormGroup({
        streetAddress: new FormControl('123', [Validators.minLength(5)]),
      });
      const control = form.get('streetAddress')!;
      control.markAsTouched();
      control.updateValueAndValidity();

      const result = pipe.transform(form, 'streetAddress');

      expect(result).toBe('Street address must be at least 5 characters');
    });
  });

  describe('custom validators', () => {
    it('should return postal code error message', () => {
      const form = new FormGroup({
        postalCode: new FormControl('invalid!', [postalCodeValidator()]),
      });
      const control = form.get('postalCode')!;
      control.markAsTouched();
      control.updateValueAndValidity();

      const result = pipe.transform(form, 'postalCode');

      expect(result).toBe('Invalid postal code format');
    });

    it('should return card number error message', () => {
      const form = new FormGroup({
        cardNumber: new FormControl('123', [cardNumberValidator()]),
      });
      const control = form.get('cardNumber')!;
      control.markAsTouched();
      control.updateValueAndValidity();

      const result = pipe.transform(form, 'cardNumber');

      expect(result).toBe('Card number must be 16 digits');
    });

    it('should return expiry date format error message', () => {
      const form = new FormGroup({
        expiryDate: new FormControl('13/25', [expiryDateValidator()]),
      });
      const control = form.get('expiryDate')!;
      control.markAsTouched();
      control.updateValueAndValidity();

      const result = pipe.transform(form, 'expiryDate');

      expect(result).toBe('Expiry date must be in MM/YY format');
    });

    it('should return expired card error message', () => {
      const form = new FormGroup({
        expiryDate: new FormControl('01/20', [expiryDateValidator()]),
      });
      const control = form.get('expiryDate')!;
      control.markAsTouched();
      control.updateValueAndValidity();

      const result = pipe.transform(form, 'expiryDate');

      expect(result).toBe('Card has expired');
    });

    it('should return CVV error message', () => {
      const form = new FormGroup({
        cvv: new FormControl('12', [cvvValidator()]),
      });
      const control = form.get('cvv')!;
      control.markAsTouched();
      control.updateValueAndValidity();

      const result = pipe.transform(form, 'cvv');

      expect(result).toBe('CVV must be 3 or 4 digits');
    });
  });

  describe('untouched fields', () => {
    it('should return null for untouched field with errors', () => {
      const form = new FormGroup({
        fullName: new FormControl('', [Validators.required]),
      });

      const result = pipe.transform(form, 'fullName');

      expect(result).toBeNull();
    });
  });

  describe('valid fields', () => {
    it('should return null for valid touched field', () => {
      const form = new FormGroup({
        fullName: new FormControl('John Doe', [Validators.required]),
      });
      const control = form.get('fullName')!;
      control.markAsTouched();

      const result = pipe.transform(form, 'fullName');

      expect(result).toBeNull();
    });
  });

  describe('unknown fields', () => {
    it('should return "Invalid input" for unknown field with errors', () => {
      const form = new FormGroup({
        unknownField: new FormControl('', [Validators.required]),
      });
      const control = form.get('unknownField')!;
      control.markAsTouched();
      control.updateValueAndValidity();

      const result = pipe.transform(form, 'unknownField');

      expect(result).toBe('Invalid input');
    });
  });

  describe('nested form groups', () => {
    it('should handle nested form groups', () => {
      const form = new FormGroup({
        shipping: new FormGroup({
          city: new FormControl('', [Validators.required]),
        }),
      });
      const shippingGroup = form.get('shipping')!;
      const cityControl = shippingGroup.get('city')!;
      cityControl.markAsTouched();
      cityControl.updateValueAndValidity();

      const result = pipe.transform(shippingGroup, 'city');

      expect(result).toBe('City is required');
    });
  });
});

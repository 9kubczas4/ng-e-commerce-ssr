import { describe, it, expect } from 'vitest';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { FieldInvalidPipe } from './field-invalid.pipe';

describe('FieldInvalidPipe', () => {
  let pipe: FieldInvalidPipe;

  beforeEach(() => {
    pipe = new FieldInvalidPipe();
  });

  describe('invalid and touched fields', () => {
    it('should return true for invalid touched field', () => {
      const form = new FormGroup({
        fullName: new FormControl('', [Validators.required]),
      });
      const control = form.get('fullName')!;
      control.markAsTouched();
      control.updateValueAndValidity();

      const result = pipe.transform(form, 'fullName');

      expect(result).toBe(true);
    });

    it('should return true for invalid touched field with minlength error', () => {
      const form = new FormGroup({
        fullName: new FormControl('A', [Validators.minLength(2)]),
      });
      const control = form.get('fullName')!;
      control.markAsTouched();
      control.updateValueAndValidity();

      const result = pipe.transform(form, 'fullName');

      expect(result).toBe(true);
    });
  });

  describe('untouched fields', () => {
    it('should return false for invalid untouched field', () => {
      const form = new FormGroup({
        fullName: new FormControl('', [Validators.required]),
      });

      const result = pipe.transform(form, 'fullName');

      expect(result).toBe(false);
    });
  });

  describe('valid fields', () => {
    it('should return false for valid touched field', () => {
      const form = new FormGroup({
        fullName: new FormControl('John Doe', [Validators.required]),
      });
      const control = form.get('fullName')!;
      control.markAsTouched();

      const result = pipe.transform(form, 'fullName');

      expect(result).toBe(false);
    });

    it('should return false for valid untouched field', () => {
      const form = new FormGroup({
        fullName: new FormControl('John Doe', [Validators.required]),
      });

      const result = pipe.transform(form, 'fullName');

      expect(result).toBe(false);
    });
  });

  describe('pristine fields', () => {
    it('should return false for pristine field with no value', () => {
      const form = new FormGroup({
        fullName: new FormControl('', [Validators.required]),
      });

      const result = pipe.transform(form, 'fullName');

      expect(result).toBe(false);
    });
  });

  describe('nested form groups', () => {
    it('should return true for invalid touched field in nested group', () => {
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

      expect(result).toBe(true);
    });

    it('should return false for valid touched field in nested group', () => {
      const form = new FormGroup({
        shipping: new FormGroup({
          city: new FormControl('New York', [Validators.required]),
        }),
      });
      const shippingGroup = form.get('shipping')!;
      const cityControl = shippingGroup.get('city')!;
      cityControl.markAsTouched();

      const result = pipe.transform(shippingGroup, 'city');

      expect(result).toBe(false);
    });
  });

  describe('non-existent fields', () => {
    it('should return false for non-existent field', () => {
      const form = new FormGroup({
        fullName: new FormControl('John Doe'),
      });

      const result = pipe.transform(form, 'nonExistent');

      expect(result).toBe(false);
    });
  });

  describe('multiple validation errors', () => {
    it('should return true when field has multiple errors and is touched', () => {
      const form = new FormGroup({
        fullName: new FormControl('', [
          Validators.required,
          Validators.minLength(2),
        ]),
      });
      const control = form.get('fullName')!;
      control.markAsTouched();
      control.updateValueAndValidity();

      const result = pipe.transform(form, 'fullName');

      expect(result).toBe(true);
    });
  });
});

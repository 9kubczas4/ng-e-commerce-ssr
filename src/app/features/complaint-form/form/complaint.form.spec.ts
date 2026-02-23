import { TestBed } from '@angular/core/testing';
import { FormBuilder } from '@angular/forms';
import { createComplaintForm, createProductGroup } from './complaint.form';

describe('Complaint Form Factory', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [FormBuilder]
    });
  });

  describe('createComplaintForm', () => {
    it('should create a form with all required fields', () => {
      const form = TestBed.runInInjectionContext(() => createComplaintForm());

      expect(form.controls.firstName).toBeDefined();
      expect(form.controls.lastName).toBeDefined();
      expect(form.controls.email).toBeDefined();
      expect(form.controls.phone).toBeDefined();
      expect(form.controls.orderNumber).toBeDefined();
      expect(form.controls.products).toBeDefined();
      expect(form.controls.preferredResolution).toBeDefined();
    });

    it('should initialize all fields with empty strings', () => {
      const form = TestBed.runInInjectionContext(() => createComplaintForm());

      expect(form.controls.firstName.value).toBe('');
      expect(form.controls.lastName.value).toBe('');
      expect(form.controls.email.value).toBe('');
      expect(form.controls.phone.value).toBe('');
      expect(form.controls.orderNumber.value).toBe('');
      expect(form.controls.preferredResolution.value).toBe('');
    });

    it('should initialize products array with one product group', () => {
      const form = TestBed.runInInjectionContext(() => createComplaintForm());

      expect(form.controls.products.length).toBe(1);
    });

    it('should be invalid when empty', () => {
      const form = TestBed.runInInjectionContext(() => createComplaintForm());

      expect(form.valid).toBe(false);
    });

    describe('firstName validation', () => {
      it('should be required', () => {
        const form = TestBed.runInInjectionContext(() => createComplaintForm());
        const control = form.controls.firstName;

        control.setValue('');
        expect(control.hasError('required')).toBe(true);
      });

      it('should require minimum 2 characters', () => {
        const form = TestBed.runInInjectionContext(() => createComplaintForm());
        const control = form.controls.firstName;

        control.setValue('A');
        expect(control.hasError('minlength')).toBe(true);

        control.setValue('AB');
        expect(control.hasError('minlength')).toBe(false);
      });
    });

    describe('lastName validation', () => {
      it('should be required', () => {
        const form = TestBed.runInInjectionContext(() => createComplaintForm());
        const control = form.controls.lastName;

        control.setValue('');
        expect(control.hasError('required')).toBe(true);
      });

      it('should require minimum 2 characters', () => {
        const form = TestBed.runInInjectionContext(() => createComplaintForm());
        const control = form.controls.lastName;

        control.setValue('A');
        expect(control.hasError('minlength')).toBe(true);

        control.setValue('AB');
        expect(control.hasError('minlength')).toBe(false);
      });
    });

    describe('email validation', () => {
      it('should be required', () => {
        const form = TestBed.runInInjectionContext(() => createComplaintForm());
        const control = form.controls.email;

        control.setValue('');
        expect(control.hasError('required')).toBe(true);
      });

      it('should validate email format', () => {
        const form = TestBed.runInInjectionContext(() => createComplaintForm());
        const control = form.controls.email;

        control.setValue('invalid-email');
        expect(control.hasError('email')).toBe(true);

        control.setValue('valid@email.com');
        expect(control.hasError('email')).toBe(false);
      });
    });

    describe('phone validation', () => {
      it('should be required', () => {
        const form = TestBed.runInInjectionContext(() => createComplaintForm());
        const control = form.controls.phone;

        control.setValue('');
        expect(control.hasError('required')).toBe(true);
      });

      it('should validate phone pattern (9-15 digits)', () => {
        const form = TestBed.runInInjectionContext(() => createComplaintForm());
        const control = form.controls.phone;

        control.setValue('12345678');
        expect(control.hasError('pattern')).toBe(true);

        control.setValue('123456789');
        expect(control.hasError('pattern')).toBe(false);

        control.setValue('123456789012345');
        expect(control.hasError('pattern')).toBe(false);

        control.setValue('1234567890123456');
        expect(control.hasError('pattern')).toBe(true);
      });

      it('should reject non-numeric characters', () => {
        const form = TestBed.runInInjectionContext(() => createComplaintForm());
        const control = form.controls.phone;

        control.setValue('123-456-7890');
        expect(control.hasError('pattern')).toBe(true);

        control.setValue('(123) 456-7890');
        expect(control.hasError('pattern')).toBe(true);
      });
    });

    describe('orderNumber validation', () => {
      it('should be required', () => {
        const form = TestBed.runInInjectionContext(() => createComplaintForm());
        const control = form.controls.orderNumber;

        control.setValue('');
        expect(control.hasError('required')).toBe(true);
      });

      it('should validate order number pattern (uppercase letters, numbers, hyphens)', () => {
        const form = TestBed.runInInjectionContext(() => createComplaintForm());
        const control = form.controls.orderNumber;

        control.setValue('ORDER-123');
        expect(control.hasError('pattern')).toBe(false);

        control.setValue('ABC123');
        expect(control.hasError('pattern')).toBe(false);

        control.setValue('order-123');
        expect(control.hasError('pattern')).toBe(true);

        control.setValue('ORDER_123');
        expect(control.hasError('pattern')).toBe(true);
      });
    });

    describe('preferredResolution validation', () => {
      it('should be required', () => {
        const form = TestBed.runInInjectionContext(() => createComplaintForm());
        const control = form.controls.preferredResolution;

        control.setValue('');
        expect(control.hasError('required')).toBe(true);
      });

      it('should accept valid resolution values', () => {
        const form = TestBed.runInInjectionContext(() => createComplaintForm());
        const control = form.controls.preferredResolution;

        control.setValue('refund');
        expect(control.valid).toBe(true);

        control.setValue('replacement');
        expect(control.valid).toBe(true);

        control.setValue('repair');
        expect(control.valid).toBe(true);
      });
    });

    it('should be valid with all required fields filled correctly', () => {
      const form = TestBed.runInInjectionContext(() => createComplaintForm());

      form.controls.firstName.setValue('John');
      form.controls.lastName.setValue('Doe');
      form.controls.email.setValue('john.doe@example.com');
      form.controls.phone.setValue('1234567890');
      form.controls.orderNumber.setValue('ORDER-123');
      form.controls.preferredResolution.setValue('refund');
      
      const productGroup = form.controls.products.at(0);
      productGroup.controls.productName.setValue('Test Product');
      productGroup.controls.complaintReason.setValue('defective-product');
      productGroup.controls.description.setValue('This is a test description with more than 20 characters');

      expect(form.valid).toBe(true);
    });
  });

  describe('createProductGroup', () => {
    it('should create a product group with all required fields', () => {
      const productGroup = TestBed.runInInjectionContext(() => createProductGroup());

      expect(productGroup.controls.productName).toBeDefined();
      expect(productGroup.controls.complaintReason).toBeDefined();
      expect(productGroup.controls.description).toBeDefined();
    });

    it('should initialize all fields with empty strings', () => {
      const productGroup = TestBed.runInInjectionContext(() => createProductGroup());

      expect(productGroup.controls.productName.value).toBe('');
      expect(productGroup.controls.complaintReason.value).toBe('');
      expect(productGroup.controls.description.value).toBe('');
    });

    it('should be invalid when empty', () => {
      const productGroup = TestBed.runInInjectionContext(() => createProductGroup());

      expect(productGroup.valid).toBe(false);
    });

    describe('productName validation', () => {
      it('should be required', () => {
        const productGroup = TestBed.runInInjectionContext(() => createProductGroup());
        const control = productGroup.controls.productName;

        control.setValue('');
        expect(control.hasError('required')).toBe(true);
      });

      it('should require minimum 3 characters', () => {
        const productGroup = TestBed.runInInjectionContext(() => createProductGroup());
        const control = productGroup.controls.productName;

        control.setValue('AB');
        expect(control.hasError('minlength')).toBe(true);

        control.setValue('ABC');
        expect(control.hasError('minlength')).toBe(false);
      });
    });

    describe('complaintReason validation', () => {
      it('should be required', () => {
        const productGroup = TestBed.runInInjectionContext(() => createProductGroup());
        const control = productGroup.controls.complaintReason;

        control.setValue('');
        expect(control.hasError('required')).toBe(true);
      });

      it('should accept valid complaint reason values', () => {
        const productGroup = TestBed.runInInjectionContext(() => createProductGroup());
        const control = productGroup.controls.complaintReason;

        const validReasons: Array<'defective-product' | 'wrong-item' | 'damaged-shipping' | 'missing-parts' | 'not-as-described' | 'other'> = [
          'defective-product',
          'wrong-item',
          'damaged-shipping',
          'missing-parts',
          'not-as-described',
          'other'
        ];

        validReasons.forEach(reason => {
          control.setValue(reason);
          expect(control.valid).toBe(true);
        });
      });
    });

    describe('description validation', () => {
      it('should be required', () => {
        const productGroup = TestBed.runInInjectionContext(() => createProductGroup());
        const control = productGroup.controls.description;

        control.setValue('');
        expect(control.hasError('required')).toBe(true);
      });

      it('should require minimum 20 characters', () => {
        const productGroup = TestBed.runInInjectionContext(() => createProductGroup());
        const control = productGroup.controls.description;

        control.setValue('Short text');
        expect(control.hasError('minlength')).toBe(true);

        control.setValue('This is a valid description with at least 20 characters');
        expect(control.hasError('minlength')).toBe(false);
      });

      it('should enforce maximum 1000 characters', () => {
        const productGroup = TestBed.runInInjectionContext(() => createProductGroup());
        const control = productGroup.controls.description;

        const longText = 'a'.repeat(1001);
        control.setValue(longText);
        expect(control.hasError('maxlength')).toBe(true);

        const validText = 'a'.repeat(1000);
        control.setValue(validText);
        expect(control.hasError('maxlength')).toBe(false);
      });
    });

    it('should be valid with all required fields filled correctly', () => {
      const productGroup = TestBed.runInInjectionContext(() => createProductGroup());

      productGroup.controls.productName.setValue('Test Product');
      productGroup.controls.complaintReason.setValue('defective-product');
      productGroup.controls.description.setValue('This is a test description with more than 20 characters');

      expect(productGroup.valid).toBe(true);
    });
  });
});

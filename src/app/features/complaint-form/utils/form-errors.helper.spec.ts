import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { collectFormErrors } from './form-errors.helper';

describe('collectFormErrors', () => {
  let fb: FormBuilder;

  beforeEach(() => {
    fb = new FormBuilder();
  });

  it('should return empty object when form is valid', () => {
    const form = fb.group({
      name: ['John', Validators.required],
      email: ['john@example.com', [Validators.required, Validators.email]]
    });

    const errors = collectFormErrors(form);

    expect(errors).toEqual({});
  });

  it('should collect errors from top-level controls', () => {
    const form = fb.group({
      name: ['', Validators.required],
      email: ['invalid', [Validators.required, Validators.email]]
    });

    form.markAllAsTouched();

    const errors = collectFormErrors(form);

    expect(errors).toEqual({
      name: ['required'],
      email: ['email']
    });
  });

  it('should collect errors from FormArray controls', () => {
    const form = fb.group({
      items: fb.array([
        fb.group({
          name: ['', Validators.required],
          quantity: ['', [Validators.required, Validators.min(1)]]
        }),
        fb.group({
          name: ['Item 2', Validators.required],
          quantity: ['', Validators.required]
        })
      ])
    });

    form.markAllAsTouched();

    const errors = collectFormErrors(form);

    expect(errors).toEqual({
      'items[0].name': ['required'],
      'items[0].quantity': ['required'],
      'items[1].quantity': ['required']
    });
  });

  it('should handle mixed valid and invalid controls', () => {
    const form = fb.group({
      firstName: ['John', Validators.required],
      lastName: ['', Validators.required],
      products: fb.array([
        fb.group({
          productName: ['Product 1', Validators.required],
          description: ['', [Validators.required, Validators.minLength(10)]]
        })
      ])
    });

    form.markAllAsTouched();

    const errors = collectFormErrors(form);

    expect(errors).toEqual({
      lastName: ['required'],
      'products[0].description': ['required']
    });
  });

  it('should handle empty FormArray', () => {
    const form = fb.group({
      name: ['John', Validators.required],
      items: fb.array([])
    });

    const errors = collectFormErrors(form);

    expect(errors).toEqual({});
  });

  it('should collect multiple validation errors from single control', () => {
    const form = fb.group({
      password: ['ab', [Validators.required, Validators.minLength(8), Validators.pattern(/[A-Z]/)]]
    });

    form.markAllAsTouched();

    const errors = collectFormErrors(form);

    expect(errors.password).toContain('minlength');
    expect(errors.password).toContain('pattern');
    expect(errors.password.length).toBe(2);
  });
});

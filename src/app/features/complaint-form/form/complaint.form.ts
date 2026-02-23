import { inject } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, FormControl, Validators } from '@angular/forms';
import { ComplaintReason, PreferredResolution } from '../models/complaint.model';

const MIN_NAME_LENGTH = 2;
const MIN_PRODUCT_NAME_LENGTH = 3;
const MIN_DESCRIPTION_LENGTH = 20;
const MAX_DESCRIPTION_LENGTH = 1000;

const PHONE_PATTERN = /^\d{9,15}$/;
const ORDER_NUMBER_PATTERN = /^[A-Z0-9-]+$/;

export type ComplaintFormGroup = FormGroup<{
  firstName: FormControl<string>;
  lastName: FormControl<string>;
  email: FormControl<string>;
  phone: FormControl<string>;
  orderNumber: FormControl<string>;
  products: FormArray<ComplaintProductFormGroup>;
  preferredResolution: FormControl<PreferredResolution | ''>;
}>;

export type ComplaintProductFormGroup = FormGroup<{
  productName: FormControl<string>;
  complaintReason: FormControl<ComplaintReason | ''>;
  description: FormControl<string>;
}>;

export function createComplaintForm(): ComplaintFormGroup {
  const fb = inject(FormBuilder);
  
  return fb.group({
    firstName: fb.control('', { validators: [Validators.required, Validators.minLength(MIN_NAME_LENGTH)], nonNullable: true }),
    lastName: fb.control('', { validators: [Validators.required, Validators.minLength(MIN_NAME_LENGTH)], nonNullable: true }),
    email: fb.control('', { validators: [Validators.required, Validators.email], nonNullable: true }),
    phone: fb.control('', { validators: [Validators.required, Validators.pattern(PHONE_PATTERN)], nonNullable: true }),
    orderNumber: fb.control('', { validators: [Validators.required, Validators.pattern(ORDER_NUMBER_PATTERN)], nonNullable: true }),
    products: fb.array([createProductGroup()]),
    preferredResolution: fb.control<PreferredResolution | ''>('', { validators: Validators.required, nonNullable: true })
  });
}

export function createProductGroup(): ComplaintProductFormGroup {
  const fb = inject(FormBuilder);
  
  return fb.group({
    productName: fb.control('', { validators: [Validators.required, Validators.minLength(MIN_PRODUCT_NAME_LENGTH)], nonNullable: true }),
    complaintReason: fb.control<ComplaintReason | ''>('', { validators: Validators.required, nonNullable: true }),
    description: fb.control('', { validators: [Validators.required, Validators.minLength(MIN_DESCRIPTION_LENGTH), Validators.maxLength(MAX_DESCRIPTION_LENGTH)], nonNullable: true })
  });
}

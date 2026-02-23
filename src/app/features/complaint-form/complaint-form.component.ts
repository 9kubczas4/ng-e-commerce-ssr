import { Component, ChangeDetectionStrategy, signal, inject } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ComplaintReason, PreferredResolution } from './models/complaint.model';
import { createComplaintForm, createProductGroup } from './form/complaint.form';

@Component({
  selector: 'app-complaint-form',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule],
  templateUrl: './complaint-form.component.html',
  styleUrls: ['./complaint-form.component.scss']
})
export class ComplaintFormComponent {
  private readonly router = inject(Router);

  protected isSubmitting = signal(false);
  protected isSubmitted = signal(false);

  complaintForm = createComplaintForm();
  products = this.complaintForm.controls.products;

  protected readonly complaintReasons: Array<{ value: ComplaintReason; label: string }> = [
    { value: 'defective-product', label: 'Defective Product' },
    { value: 'wrong-item', label: 'Wrong Item Received' },
    { value: 'damaged-shipping', label: 'Damaged During Shipping' },
    { value: 'missing-parts', label: 'Missing Parts' },
    { value: 'not-as-described', label: 'Not As Described' },
    { value: 'other', label: 'Other Reason' }
  ];

  protected readonly resolutionOptions: Array<{ value: PreferredResolution; label: string }> = [
    { value: 'refund', label: 'Refund' },
    { value: 'replacement', label: 'Replacement' },
    { value: 'repair', label: 'Repair' }
  ];

  addProduct(): void {
    this.products.push(createProductGroup());
  }

  removeProduct(index: number): void {
    if (this.products.length > 1) {
      this.products.removeAt(index);
    }
  }

  protected onSubmit(): void {
    if (this.complaintForm.invalid) {
      this.complaintForm.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);

    setTimeout(() => {
      console.log('Complaint submitted:', this.complaintForm.value);
      this.isSubmitting.set(false);
      this.isSubmitted.set(true);

      setTimeout(() => {
        this.complaintForm.reset();
        this.products.clear();
        this.products.push(createProductGroup());
        this.isSubmitted.set(false);
        this.router.navigate(['/']);
      }, 3000);
    }, 1500);
  }

  getFieldError(fieldName: string, productIndex: number | undefined = undefined): string | null {
    const field = productIndex !== undefined
      ? this.products.at(productIndex).get(fieldName)
      : this.complaintForm.get(fieldName);

    if (!field?.touched || !field.errors) {
      return null;
    }

    if (field.errors['required']) return 'This field is required';
    if (field.errors['email']) return 'Invalid email address';
    if (field.errors['minlength']) {
      return `Minimum length: ${field.errors['minlength'].requiredLength} characters`;
    }
    if (field.errors['maxlength']) {
      return `Maximum length: ${field.errors['maxlength'].requiredLength} characters`;
    }
    if (field.errors['pattern']) {
      if (fieldName === 'phone') return 'Invalid phone number (9-15 digits)';
      if (fieldName === 'orderNumber') return 'Invalid order number';
    }

    return 'Invalid value';
  }

  isFieldInvalid(fieldName: string, productIndex: number | undefined = undefined): boolean {
    const field = productIndex !== undefined
      ? this.products.at(productIndex).get(fieldName)
      : this.complaintForm.get(fieldName);

    return !!(field?.invalid && field.touched);
  }
}

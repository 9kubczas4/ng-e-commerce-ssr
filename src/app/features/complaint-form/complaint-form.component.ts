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
  protected agentInvoked = signal(false);

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
        this.agentInvoked.set(false);
        this.router.navigate(['/']);
      }, 3000);
    }, 1500);
  }

  protected handleSubmit(event: SubmitEvent): void {
    // Check if the form was invoked by an AI agent
    if ((event as any).agentInvoked) {
      this.agentInvoked.set(true);
      
      // Prevent default form submission
      event.preventDefault();
      
      // Validate the form
      if (this.complaintForm.invalid) {
        this.complaintForm.markAllAsTouched();
        
        // Return validation errors to the agent
        const errors = this.collectFormErrors();
        (event as any).respondWith?.(
          Promise.reject({
            error: 'Validation failed',
            details: errors
          })
        );
        return;
      }
      
      // Process the submission
      this.isSubmitting.set(true);
      
      // Simulate async submission
      const submissionPromise = new Promise((resolve) => {
        setTimeout(() => {
          console.log('Agent-invoked complaint submitted:', this.complaintForm.value);
          this.isSubmitting.set(false);
          this.isSubmitted.set(true);
          
          resolve({
            success: true,
            message: 'Complaint submitted successfully',
            data: this.complaintForm.value
          });
          
          // Reset after showing success
          setTimeout(() => {
            this.complaintForm.reset();
            this.products.clear();
            this.products.push(createProductGroup());
            this.isSubmitted.set(false);
            this.agentInvoked.set(false);
          }, 3000);
        }, 1500);
      });
      
      // Return the promise to the agent
      (event as any).respondWith?.(submissionPromise);
    } else {
      // Regular user submission
      this.onSubmit();
    }
  }

  private collectFormErrors(): Record<string, string[]> {
    const errors: Record<string, string[]> = {};
    
    Object.keys(this.complaintForm.controls).forEach(key => {
      const control = this.complaintForm.get(key);
      if (control?.invalid && control.errors) {
        errors[key] = Object.keys(control.errors);
      }
    });
    
    // Collect product errors
    this.products.controls.forEach((product, index) => {
      Object.keys(product.controls).forEach(key => {
        const control = product.get(key);
        if (control?.invalid && control.errors) {
          errors[`products[${index}].${key}`] = Object.keys(control.errors);
        }
      });
    });
    
    return errors;
  }

  getFieldError(fieldName: string, productIndex?: number): string | null {
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

  isFieldInvalid(fieldName: string, productIndex?: number): boolean {
    const field = productIndex !== undefined
      ? this.products.at(productIndex).get(fieldName)
      : this.complaintForm.get(fieldName);

    return !!(field?.invalid && field.touched);
  }
}

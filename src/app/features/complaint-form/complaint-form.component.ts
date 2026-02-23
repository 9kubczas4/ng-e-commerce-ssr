import { Component, ChangeDetectionStrategy, signal, inject } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ComplaintReason, PreferredResolution } from './models/complaint.model';
import { createComplaintForm, createProductGroup } from './form/complaint.form';
import { FieldErrorPipe } from './pipes/field-error.pipe';
import { FieldInvalidPipe } from './pipes/field-invalid.pipe';
import { collectFormErrors } from './utils/form-errors.helper';

interface AgentSubmitEvent extends SubmitEvent {
  agentInvoked?: boolean;
  respondWith?: (promise: Promise<unknown>) => void;
}

@Component({
  selector: 'app-complaint-form',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, FieldErrorPipe, FieldInvalidPipe],
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

  protected handleSubmit(event: SubmitEvent): void {
    const agentEvent = event as AgentSubmitEvent;

    // Check if the form was invoked by an AI agent
    if (agentEvent.agentInvoked) {
      this.agentInvoked.set(true);
      event.preventDefault();

      // Validate the form
      if (this.complaintForm.invalid) {
        this.complaintForm.markAllAsTouched();

        // Return validation errors to the agent
        const errors = collectFormErrors(this.complaintForm);
        agentEvent.respondWith?.(
          Promise.reject({
            error: 'Validation failed',
            details: errors
          })
        );
        return;
      }

      // Process the submission and return promise to agent
      const submissionPromise = this.submitForm();
      agentEvent.respondWith?.(submissionPromise);
    } else {
      // Regular user submission
      this.submitForm();
    }
  }

  private submitForm(): Promise<unknown> {
    if (this.complaintForm.invalid) {
      this.complaintForm.markAllAsTouched();
      return Promise.reject({ error: 'Form is invalid' });
    }

    this.isSubmitting.set(true);

    return new Promise((resolve) => {
      setTimeout(() => {
        console.log('Complaint submitted:', this.complaintForm.value);
        this.isSubmitting.set(false);
        this.isSubmitted.set(true);

        resolve({
          success: true,
          message: 'Complaint submitted successfully',
          data: this.complaintForm.value
        });

        // Reset form and redirect after showing success
        setTimeout(() => {
          this.complaintForm.reset();
          this.products.clear();
          this.products.push(createProductGroup());
          this.isSubmitted.set(false);
          this.agentInvoked.set(false);
          this.router.navigate(['/']);
        }, 3000);
      }, 1500);
    });
  }
}

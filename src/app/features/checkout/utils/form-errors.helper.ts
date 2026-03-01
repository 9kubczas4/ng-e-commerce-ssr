import { AbstractControl, FormGroup } from '@angular/forms';

/**
 * Collect all form validation errors for agent response
 * Returns a structured object with field paths as keys and error messages as values
 */
export function collectFormErrors(
  formGroup: AbstractControl
): Record<string, string[]> {
  const errors: Record<string, string[]> = {};

  const collectErrors = (
    control: AbstractControl,
    prefix = ''
  ): void => {
    if (!('controls' in control)) {
      return;
    }

    const controls = (control as FormGroup).controls;
    for (const name in controls) {
      const childControl = controls[name];
      const fieldPath = prefix ? `${prefix}.${name}` : name;

      if (childControl.invalid && childControl.errors) {
        const fieldErrors: string[] = [];

        if (childControl.errors['required']) {
          fieldErrors.push('This field is required');
        }
        if (childControl.errors['email']) {
          fieldErrors.push('Invalid email format');
        }
        if (childControl.errors['minlength']) {
          fieldErrors.push(
            `Minimum length is ${childControl.errors['minlength'].requiredLength}`
          );
        }
        if (childControl.errors['maxlength']) {
          fieldErrors.push(
            `Maximum length is ${childControl.errors['maxlength'].requiredLength}`
          );
        }
        if (childControl.errors['pattern']) {
          fieldErrors.push('Invalid format');
        }
        if (childControl.errors['invalidPostalCode']) {
          fieldErrors.push('Invalid postal code format');
        }
        if (childControl.errors['invalidCardNumber']) {
          fieldErrors.push('Invalid card number (must be 16 digits)');
        }
        if (childControl.errors['invalidExpiryFormat']) {
          fieldErrors.push('Invalid expiry date format (use MM/YY)');
        }
        if (childControl.errors['expiredCard']) {
          fieldErrors.push('Card has expired');
        }
        if (childControl.errors['invalidCvv']) {
          fieldErrors.push('Invalid CVV (must be 3 or 4 digits)');
        }

        if (fieldErrors.length > 0) {
          errors[fieldPath] = fieldErrors;
        }
      }

      if ('controls' in childControl) {
        collectErrors(childControl, fieldPath);
      }
    }
  };

  collectErrors(formGroup);
  return errors;
}

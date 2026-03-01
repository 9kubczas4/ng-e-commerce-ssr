import { AbstractControl, FormGroup, ValidationErrors } from '@angular/forms';

/**
 * Error messages for checkout form fields
 */
export const CHECKOUT_ERROR_MESSAGES: Record<string, Record<string, string>> = {
  fullName: {
    required: 'Full name is required',
    minlength: 'Full name must be at least 2 characters',
  },
  streetAddress: {
    required: 'Street address is required',
    minlength: 'Street address must be at least 5 characters',
  },
  city: {
    required: 'City is required',
  },
  postalCode: {
    required: 'Postal code is required',
    invalidPostalCode: 'Invalid postal code format',
  },
  country: {
    required: 'Country is required',
  },
  cardNumber: {
    required: 'Card number is required',
    invalidCardNumber: 'Card number must be 16 digits',
  },
  expiryDate: {
    required: 'Expiry date is required',
    invalidExpiryFormat: 'Expiry date must be in MM/YY format',
    expiredCard: 'Card has expired',
  },
  cvv: {
    required: 'CVV is required',
    invalidCvv: 'CVV must be 3 or 4 digits',
  },
  cardholderName: {
    required: 'Cardholder name is required',
  },
};

/**
 * Get the error message for a specific field and error type
 * @param fieldName - The name of the form field
 * @param errors - The validation errors object
 * @returns The error message string or empty string if no error
 */
export function getFieldError(
  fieldName: string,
  errors: ValidationErrors | null
): string {
  if (!errors) {
    return '';
  }

  const fieldMessages = CHECKOUT_ERROR_MESSAGES[fieldName];
  if (!fieldMessages) {
    return '';
  }

  // Return the first error message found
  for (const errorKey in errors) {
    if (fieldMessages[errorKey]) {
      return fieldMessages[errorKey];
    }
  }

  // Fallback for unknown error types
  return 'Invalid input';
}

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
        const fieldName = name;

        // Use getFieldError for known fields
        if (CHECKOUT_ERROR_MESSAGES[fieldName]) {
          const errorMessage = getFieldError(fieldName, childControl.errors);
          if (errorMessage) {
            fieldErrors.push(errorMessage);
          }
        } else {
          // Fallback for unknown fields - use generic messages
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

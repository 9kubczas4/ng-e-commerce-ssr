import { FormGroup, ValidationErrors } from '@angular/forms';

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
    minlength: 'City must be at least 2 characters',
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
    minlength: 'Cardholder name must be at least 2 characters',
  },
};

export function getFieldError(
  fieldName: string,
  errors: ValidationErrors | null
): string {
  if (!errors) return '';

  const fieldErrors = CHECKOUT_ERROR_MESSAGES[fieldName];
  if (!fieldErrors) return '';

  const errorKey = Object.keys(errors)[0];
  return fieldErrors[errorKey] || 'Invalid input';
}

export function collectFormErrors(form: FormGroup): Record<string, string[]> {
  const errors: Record<string, string[]> = {};

  Object.keys(form.controls).forEach((key) => {
    const control = form.get(key);
    if (control && control.invalid && control.errors) {
      errors[key] = Object.keys(control.errors).map((errorKey) =>
        getFieldError(key, { [errorKey]: control.errors![errorKey] })
      );
    }

    // Handle nested form groups
    if (control instanceof FormGroup) {
      const nestedErrors = collectFormErrors(control);
      Object.keys(nestedErrors).forEach((nestedKey) => {
        errors[`${key}.${nestedKey}`] = nestedErrors[nestedKey];
      });
    }
  });

  return errors;
}

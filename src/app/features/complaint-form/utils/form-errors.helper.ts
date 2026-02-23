import { FormGroup, FormArray } from '@angular/forms';

/**
 * Collects all validation errors from a FormGroup, including nested FormArrays.
 * Returns a flat object with error keys and their validation error types.
 *
 * @param form - The FormGroup to collect errors from
 * @returns Record of field paths to their validation error keys
 *
 * @example
 * const errors = collectFormErrors(myForm);
 * // Returns: { 'firstName': ['required'], 'products[0].productName': ['required', 'minlength'] }
 */
export function collectFormErrors(form: FormGroup): Record<string, string[]> {
  const errors: Record<string, string[]> = {};

  // Collect errors from top-level controls
  Object.keys(form.controls).forEach(key => {
    const control = form.get(key);

    if (control instanceof FormArray) {
      // Handle FormArray controls
      control.controls.forEach((arrayControl, index) => {
        if (arrayControl instanceof FormGroup) {
          Object.keys(arrayControl.controls).forEach(nestedKey => {
            const nestedControl = arrayControl.get(nestedKey);
            if (nestedControl?.invalid && nestedControl.errors) {
              errors[`${key}[${index}].${nestedKey}`] = Object.keys(nestedControl.errors);
            }
          });
        }
      });
    } else if (control?.invalid && control.errors) {
      // Handle regular controls
      errors[key] = Object.keys(control.errors);
    }
  });

  return errors;
}

import { Pipe, PipeTransform } from '@angular/core';
import { AbstractControl, FormArray, ValidationErrors } from '@angular/forms';
import { CHECKOUT_ERROR_MESSAGES } from '../utils/form-errors.helper';

@Pipe({
  name: 'fieldError',
})
export class FieldErrorPipe implements PipeTransform {
  transform(
    formControl: AbstractControl | FormArray,
    fieldName: string
  ): string | null {
    const field = formControl.get(fieldName);

    if (!field?.touched || !field.errors) {
      return null;
    }

    return this.getErrorMessage(field.errors, fieldName);
  }

  private getErrorMessage(errors: ValidationErrors, fieldName: string): string {
    const fieldErrors = CHECKOUT_ERROR_MESSAGES[fieldName];
    if (!fieldErrors) return 'Invalid input';

    const errorKey = Object.keys(errors)[0];
    return fieldErrors[errorKey] || 'Invalid input';
  }
}

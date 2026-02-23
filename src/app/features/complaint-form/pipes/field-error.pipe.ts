import { Pipe, PipeTransform } from '@angular/core';
import { AbstractControl, FormArray, ValidationErrors } from '@angular/forms';

@Pipe({
  name: 'fieldError'
})
export class FieldErrorPipe implements PipeTransform {
  transform(
    formControl: AbstractControl | FormArray,
    fieldName: string,
    productIndex?: number
  ): string | null {
    const field = productIndex !== undefined && formControl instanceof FormArray
      ? formControl.at(productIndex).get(fieldName)
      : formControl.get(fieldName);

    if (!field?.touched || !field.errors) {
      return null;
    }

    return this.getErrorMessage(field.errors, fieldName);
  }

  private getErrorMessage(errors: ValidationErrors, fieldName: string): string {
    if (errors['required']) return 'This field is required';
    if (errors['email']) return 'Invalid email address';
    if (errors['minlength']) {
      return `Minimum length: ${errors['minlength'].requiredLength} characters`;
    }
    if (errors['maxlength']) {
      return `Maximum length: ${errors['maxlength'].requiredLength} characters`;
    }
    if (errors['pattern']) {
      if (fieldName === 'phone') return 'Invalid phone number (9-15 digits)';
      if (fieldName === 'orderNumber') return 'Invalid order number';
    }

    return 'Invalid value';
  }
}

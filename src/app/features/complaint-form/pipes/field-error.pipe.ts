import { Pipe, PipeTransform } from '@angular/core';
import { AbstractControl, FormArray, ValidationErrors } from '@angular/forms';
import { Observable, merge, of, timer } from 'rxjs';
import { map, startWith, distinctUntilChanged, shareReplay } from 'rxjs/operators';

@Pipe({
  name: 'fieldError'
})
export class FieldErrorPipe implements PipeTransform {
  transform(
    formControl: AbstractControl | FormArray,
    fieldName: string,
    productIndex?: number
  ): Observable<string | null> {
    const field = productIndex !== undefined && formControl instanceof FormArray
      ? formControl.at(productIndex).get(fieldName)
      : formControl.get(fieldName);

    if (!field) {
      return of(null);
    }

    // Combine value changes, status changes, and a polling mechanism
    // The polling ensures we catch touched state changes that don't emit through other observables
    return merge(
      field.valueChanges,
      field.statusChanges,
      timer(0, 100) // Poll every 100ms to catch touched state changes
    ).pipe(
      map(() => {
        // Show error only when field is invalid AND touched
        // The touched state is set on blur event
        if (!field.touched || !field.errors) {
          return null;
        }
        return this.getErrorMessage(field.errors, fieldName);
      }),
      distinctUntilChanged(),
      shareReplay(1)
    );
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

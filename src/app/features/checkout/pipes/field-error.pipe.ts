import { Pipe, PipeTransform, ChangeDetectorRef, inject } from '@angular/core';
import { AbstractControl, FormArray, ValidationErrors } from '@angular/forms';
import { Observable, merge, of, timer } from 'rxjs';
import { map, startWith, distinctUntilChanged, shareReplay, switchMap } from 'rxjs/operators';
import { CHECKOUT_ERROR_MESSAGES } from '../utils/form-errors.helper';

@Pipe({
  name: 'fieldError',
})
export class FieldErrorPipe implements PipeTransform {
  transform(
    formControl: AbstractControl | FormArray,
    fieldName: string
  ): Observable<string | null> {
    const field = formControl.get(fieldName);

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
    const fieldErrors = CHECKOUT_ERROR_MESSAGES[fieldName];
    if (!fieldErrors) return 'Invalid input';

    const errorKey = Object.keys(errors)[0];
    return fieldErrors[errorKey] || 'Invalid input';
  }
}

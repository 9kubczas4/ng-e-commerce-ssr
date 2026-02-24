import { Pipe, PipeTransform } from '@angular/core';
import { AbstractControl, FormArray } from '@angular/forms';

@Pipe({
  name: 'fieldInvalid',
})
export class FieldInvalidPipe implements PipeTransform {
  transform(
    formControl: AbstractControl | FormArray,
    fieldName: string
  ): boolean {
    const field = formControl.get(fieldName);
    return !!(field?.invalid && field.touched);
  }
}

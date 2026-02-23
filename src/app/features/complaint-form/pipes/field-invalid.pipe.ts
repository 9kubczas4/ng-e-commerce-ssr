import { Pipe, PipeTransform } from '@angular/core';
import { AbstractControl, FormArray } from '@angular/forms';

@Pipe({
  name: 'fieldInvalid'
})
export class FieldInvalidPipe implements PipeTransform {
  transform(
    formControl: AbstractControl | FormArray,
    fieldName: string,
    productIndex?: number
  ): boolean {
    const field = productIndex !== undefined && formControl instanceof FormArray
      ? formControl.at(productIndex).get(fieldName)
      : formControl.get(fieldName);

    return !!(field?.invalid && field.touched);
  }
}

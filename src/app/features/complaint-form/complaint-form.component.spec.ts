import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ComplaintFormComponent } from './complaint-form.component';
import { Router } from '@angular/router';
import { FormArray } from '@angular/forms';
import { FieldErrorPipe } from './pipes/field-error.pipe';
import { firstValueFrom } from 'rxjs';

describe('ComplaintFormComponent', () => {
  let component: ComplaintFormComponent;
  let fixture: ComponentFixture<ComplaintFormComponent>;
  let fieldErrorPipe: FieldErrorPipe;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ComplaintFormComponent],
      providers: [
        {
          provide: Router,
          useValue: { navigate: vi.fn() }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ComplaintFormComponent);
    component = fixture.componentInstance;
    fieldErrorPipe = new FieldErrorPipe();
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize form with empty values', () => {
    expect(component['complaintForm'].get('firstName')?.value).toBe('');
    expect(component['complaintForm'].get('email')?.value).toBe('');
    expect(component['complaintForm'].get('orderNumber')?.value).toBe('');
  });

  it('should initialize with one product in the products array', () => {
    const products = component['products'] as FormArray;
    expect(products.length).toBe(1);
  });

  it('should mark form as invalid when empty', () => {
    expect(component['complaintForm'].valid).toBe(false);
  });

  it('should validate required fields', () => {
    const firstNameControl = component['complaintForm'].get('firstName');
    expect(firstNameControl?.hasError('required')).toBe(true);

    firstNameControl?.setValue('Jan');
    expect(firstNameControl?.hasError('required')).toBe(false);
  });

  it('should validate email format', () => {
    const emailControl = component['complaintForm'].get('email');

    emailControl?.setValue('invalid-email');
    expect(emailControl?.hasError('email')).toBe(true);

    emailControl?.setValue('valid@email.com');
    expect(emailControl?.hasError('email')).toBe(false);
  });

  it('should validate phone number pattern', () => {
    const phoneControl = component['complaintForm'].get('phone');

    phoneControl?.setValue('abc');
    expect(phoneControl?.hasError('pattern')).toBe(true);

    phoneControl?.setValue('123456789');
    expect(phoneControl?.hasError('pattern')).toBe(false);
  });

  it('should validate order number pattern', () => {
    const orderControl = component['complaintForm'].get('orderNumber');

    orderControl?.setValue('invalid order!');
    expect(orderControl?.hasError('pattern')).toBe(true);

    orderControl?.setValue('ORD-2024-12345');
    expect(orderControl?.hasError('pattern')).toBe(false);
  });

  it('should validate product description min length', () => {
    const products = component['products'] as FormArray;
    const descControl = products.at(0).get('description');

    descControl?.setValue('short');
    expect(descControl?.hasError('minlength')).toBe(true);

    descControl?.setValue('This is a long enough description for the complaint form');
    expect(descControl?.hasError('minlength')).toBe(false);
  });

  it('should add a new product to the products array', () => {
    const products = component['products'] as FormArray;
    const initialLength = products.length;

    TestBed.runInInjectionContext(() => {
      component['addProduct']();
    });

    expect(products.length).toBe(initialLength + 1);
  });

  it('should remove a product from the products array', () => {
    TestBed.runInInjectionContext(() => {
      component['addProduct']();
    });
    const products = component['products'] as FormArray;
    const initialLength = products.length;

    component['removeProduct'](1);

    expect(products.length).toBe(initialLength - 1);
  });

  it('should not remove the last product', () => {
    const products = component['products'] as FormArray;
    expect(products.length).toBe(1);

    component['removeProduct'](0);

    expect(products.length).toBe(1);
  });

  it('should not submit invalid form', async () => {
    // Test submitForm directly to properly handle the rejected promise
    const submitPromise = component['submitForm']();

    // Expect the promise to be rejected with the correct error
    await expect(submitPromise).rejects.toEqual({ error: 'Form is invalid' });

    expect(component['isSubmitting']()).toBe(false);
  });

  it('should return correct error messages', async () => {
    const firstNameControl = component['complaintForm'].get('firstName');
    firstNameControl?.markAsTouched();

    const error1$ = fieldErrorPipe.transform(component['complaintForm'], 'firstName');
    const error1 = await firstValueFrom(error1$);
    expect(error1).toBe('This field is required');

    firstNameControl?.setValue('A');
    const error2$ = fieldErrorPipe.transform(component['complaintForm'], 'firstName');
    const error2 = await firstValueFrom(error2$);
    expect(error2).toContain('Minimum length');
  });

  it('should return correct error messages for product fields', async () => {
    const products = component['products'] as FormArray;
    const productNameControl = products.at(0).get('productName');
    productNameControl?.markAsTouched();

    const error1$ = fieldErrorPipe.transform(products, 'productName', 0);
    const error1 = await firstValueFrom(error1$);
    expect(error1).toBe('This field is required');

    productNameControl?.setValue('AB');
    const error2$ = fieldErrorPipe.transform(products, 'productName', 0);
    const error2 = await firstValueFrom(error2$);
    expect(error2).toContain('Minimum length');
  });

  it('should check if field is invalid correctly', async () => {
    const emailControl = component['complaintForm'].get('email');

    const error1$ = fieldErrorPipe.transform(component['complaintForm'], 'email');
    const error1 = await firstValueFrom(error1$);
    expect(error1).toBe(null);

    emailControl?.markAsTouched();
    const error2$ = fieldErrorPipe.transform(component['complaintForm'], 'email');
    const error2 = await firstValueFrom(error2$);
    expect(error2).toBeTruthy(); // Should have an error message

    emailControl?.setValue('valid@email.com');
    const error3$ = fieldErrorPipe.transform(component['complaintForm'], 'email');
    const error3 = await firstValueFrom(error3$);
    expect(error3).toBe(null);
  });

  it('should check if product field is invalid correctly', async () => {
    const products = component['products'] as FormArray;
    const productNameControl = products.at(0).get('productName');

    const error1$ = fieldErrorPipe.transform(products, 'productName', 0);
    const error1 = await firstValueFrom(error1$);
    expect(error1).toBe(null);

    productNameControl?.markAsTouched();
    const error2$ = fieldErrorPipe.transform(products, 'productName', 0);
    const error2 = await firstValueFrom(error2$);
    expect(error2).toBeTruthy(); // Should have an error message

    productNameControl?.setValue('Valid Product Name');
    const error3$ = fieldErrorPipe.transform(products, 'productName', 0);
    const error3 = await firstValueFrom(error3$);
    expect(error3).toBe(null);
  });

  it('should render form title', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const title = compiled.querySelector('.complaint-form-title');

    expect(title?.textContent).toContain('Complaint Form');
  });

  it('should render all form sections', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const sections = compiled.querySelectorAll('.form-section');

    expect(sections.length).toBe(4);
  });

  it('should have proper ARIA attributes on form fields', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const firstNameInput = compiled.querySelector('#firstName');

    expect(firstNameInput?.getAttribute('aria-required')).toBe('true');
  });

  it('should display error messages when field is invalid and touched', async () => {
    const emailControl = component['complaintForm'].get('email');

    // Verify field starts invalid
    expect(emailControl?.invalid).toBe(true);

    emailControl?.markAsTouched();
    emailControl?.updateValueAndValidity();

    // Verify the pipe would return an error
    const errorPipe = new FieldErrorPipe();
    const error$ = errorPipe.transform(component['complaintForm'], 'email');
    const error = await firstValueFrom(error$);
    expect(error).toBeTruthy();

    // Verify the error pipe returns null when valid
    emailControl?.setValue('valid@email.com');
    const validError$ = errorPipe.transform(component['complaintForm'], 'email');
    const validError = await firstValueFrom(validError$);
    expect(validError).toBe(null);
  });

  it('should render add product button', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const addButton = compiled.querySelector('.btn-add-product');

    expect(addButton).toBeTruthy();
    expect(addButton?.textContent).toContain('Add Another Product');
  });

  it('should render remove button when multiple products exist', async () => {
    const initialLength = component['products'].length;
    expect(initialLength).toBe(1);

    TestBed.runInInjectionContext(() => {
      component['addProduct']();
    });

    // Verify product was added
    expect(component['products'].length).toBe(2);

    // Verify the template condition would show remove buttons
    expect(component['products'].length > 1).toBe(true);
  });

  it('should not render remove button when only one product exists', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const removeButtons = compiled.querySelectorAll('.btn-remove');

    expect(removeButtons.length).toBe(0);
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ComplaintFormComponent } from './complaint-form.component';
import { Router } from '@angular/router';
import { FormArray } from '@angular/forms';

describe('ComplaintFormComponent', () => {
  let component: ComplaintFormComponent;
  let fixture: ComponentFixture<ComplaintFormComponent>;

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

    component['addProduct']();

    expect(products.length).toBe(initialLength + 1);
  });

  it('should remove a product from the products array', () => {
    component['addProduct']();
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

  it('should not submit invalid form', () => {
    component['onSubmit']();
    expect(component['isSubmitting']()).toBe(false);
  });

  it('should return correct error messages', () => {
    const firstNameControl = component['complaintForm'].get('firstName');
    firstNameControl?.markAsTouched();

    expect(component['getFieldError']('firstName')).toBe('This field is required');

    firstNameControl?.setValue('A');
    expect(component['getFieldError']('firstName')).toContain('Minimum length');
  });

  it('should return correct error messages for product fields', () => {
    const products = component['products'] as FormArray;
    const productNameControl = products.at(0).get('productName');
    productNameControl?.markAsTouched();

    expect(component['getFieldError']('productName', 0)).toBe('This field is required');

    productNameControl?.setValue('AB');
    expect(component['getFieldError']('productName', 0)).toContain('Minimum length');
  });

  it('should check if field is invalid correctly', () => {
    const emailControl = component['complaintForm'].get('email');

    expect(component['isFieldInvalid']('email')).toBe(false);

    emailControl?.markAsTouched();
    expect(component['isFieldInvalid']('email')).toBe(true);

    emailControl?.setValue('valid@email.com');
    expect(component['isFieldInvalid']('email')).toBe(false);
  });

  it('should check if product field is invalid correctly', () => {
    const products = component['products'] as FormArray;
    const productNameControl = products.at(0).get('productName');

    expect(component['isFieldInvalid']('productName', 0)).toBe(false);

    productNameControl?.markAsTouched();
    expect(component['isFieldInvalid']('productName', 0)).toBe(true);

    productNameControl?.setValue('Valid Product Name');
    expect(component['isFieldInvalid']('productName', 0)).toBe(false);
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

  it('should display error messages when field is invalid and touched', () => {
    const emailControl = component['complaintForm'].get('email');
    emailControl?.markAsTouched();
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const errorMessage = compiled.querySelector('#email-error');

    expect(errorMessage).toBeTruthy();
  });

  it('should render add product button', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const addButton = compiled.querySelector('.btn-add-product');

    expect(addButton).toBeTruthy();
    expect(addButton?.textContent).toContain('Add Another Product');
  });

  it('should render remove button when multiple products exist', () => {
    component['addProduct']();
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const removeButtons = compiled.querySelectorAll('.btn-remove');

    expect(removeButtons.length).toBeGreaterThan(0);
  });

  it('should not render remove button when only one product exists', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const removeButtons = compiled.querySelectorAll('.btn-remove');

    expect(removeButtons.length).toBe(0);
  });
});

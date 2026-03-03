import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { WebmcpFormSyncDirective } from './webmcp-form-sync.directive';

@Component({
  template: `
    <form [formGroup]="testForm" appWebmcpFormSync toolname="test_tool">
      <input type="text" id="name" name="name" formControlName="name" />
      <input type="email" id="email" name="email" formControlName="email" />
      <select id="country" name="country" formControlName="country">
        <option value="">Select</option>
        <option value="US">United States</option>
        <option value="CA">Canada</option>
      </select>
    </form>
  `,
  imports: [ReactiveFormsModule, WebmcpFormSyncDirective],
})
class TestComponent {
  testForm = new FormGroup({
    name: new FormControl('', Validators.required),
    email: new FormControl('', [Validators.required, Validators.email]),
    country: new FormControl('', Validators.required),
  });
}

@Component({
  template: `
    <form [formGroup]="testForm" appWebmcpFormSync toolname="nested_tool">
      <div formGroupName="personal">
        <input type="text" id="firstName" name="firstName" formControlName="firstName" />
        <input type="text" id="lastName" name="lastName" formControlName="lastName" />
      </div>
      <div formGroupName="contact">
        <input type="email" id="email" name="email" formControlName="email" />
      </div>
    </form>
  `,
  imports: [ReactiveFormsModule, WebmcpFormSyncDirective],
})
class NestedFormComponent {
  testForm = new FormGroup({
    personal: new FormGroup({
      firstName: new FormControl('', Validators.required),
      lastName: new FormControl('', Validators.required),
    }),
    contact: new FormGroup({
      email: new FormControl('', [Validators.required, Validators.email]),
    }),
  });
}

describe('WebmcpFormSyncDirective', () => {
  let component: TestComponent;
  let fixture: ComponentFixture<TestComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('WebMCP Tool Activation', () => {
    it('should sync form values when toolactivated event is fired', async () => {
      // Set DOM values directly (simulating WebMCP)
      const nameInput = fixture.nativeElement.querySelector('#name') as HTMLInputElement;
      const emailInput = fixture.nativeElement.querySelector('#email') as HTMLInputElement;
      const countrySelect = fixture.nativeElement.querySelector('#country') as HTMLSelectElement;

      nameInput.value = 'John Doe';
      emailInput.value = 'john@example.com';
      countrySelect.value = 'US';

      // Verify form is initially invalid (values not synced yet)
      expect(component.testForm.invalid).toBe(true);
      expect(component.testForm.value.name).toBe('');

      // Dispatch toolactivated event
      const event = new CustomEvent('toolactivated', {
        detail: { toolName: 'test_tool' },
      });
      window.dispatchEvent(event);

      // Wait for async sync
      await new Promise((resolve) => setTimeout(resolve, 10));

      // Verify form values are synced
      expect(component.testForm.value.name).toBe('John Doe');
      expect(component.testForm.value.email).toBe('john@example.com');
      expect(component.testForm.value.country).toBe('US');
      expect(component.testForm.valid).toBe(true);
    });

    it('should mark controls as touched and dirty after sync', async () => {
      const nameInput = fixture.nativeElement.querySelector('#name') as HTMLInputElement;
      nameInput.value = 'Jane Smith';

      // Verify initial state
      expect(component.testForm.controls.name.touched).toBe(false);
      expect(component.testForm.controls.name.dirty).toBe(false);

      // Dispatch event
      const event = new CustomEvent('toolactivated', {
        detail: { toolName: 'test_tool' },
      });
      window.dispatchEvent(event);

      await new Promise((resolve) => setTimeout(resolve, 10));

      // Verify control state
      expect(component.testForm.controls.name.touched).toBe(true);
      expect(component.testForm.controls.name.dirty).toBe(true);
    });

    it('should not sync values for different tool names', async () => {
      const nameInput = fixture.nativeElement.querySelector('#name') as HTMLInputElement;
      nameInput.value = 'John Doe';

      // Dispatch event with different tool name
      const event = new CustomEvent('toolactivated', {
        detail: { toolName: 'different_tool' },
      });
      window.dispatchEvent(event);

      await new Promise((resolve) => setTimeout(resolve, 10));

      // Verify form values are NOT synced
      expect(component.testForm.value.name).toBe('');
    });

    it('should handle empty values gracefully', async () => {
      const nameInput = fixture.nativeElement.querySelector('#name') as HTMLInputElement;
      nameInput.value = ''; // Empty value

      const event = new CustomEvent('toolactivated', {
        detail: { toolName: 'test_tool' },
      });
      window.dispatchEvent(event);

      await new Promise((resolve) => setTimeout(resolve, 10));

      // Should not throw error, form remains invalid
      expect(component.testForm.value.name).toBe('');
      expect(component.testForm.invalid).toBe(true);
    });

    it('should update form validation state after sync', async () => {
      const nameInput = fixture.nativeElement.querySelector('#name') as HTMLInputElement;
      const emailInput = fixture.nativeElement.querySelector('#email') as HTMLInputElement;
      const countrySelect = fixture.nativeElement.querySelector('#country') as HTMLSelectElement;

      nameInput.value = 'John Doe';
      emailInput.value = 'john@example.com';
      countrySelect.value = 'US';

      expect(component.testForm.invalid).toBe(true);

      const event = new CustomEvent('toolactivated', {
        detail: { toolName: 'test_tool' },
      });
      window.dispatchEvent(event);

      await new Promise((resolve) => setTimeout(resolve, 10));

      expect(component.testForm.valid).toBe(true);
    });
  });

  describe('Nested Form Groups', () => {
    let nestedComponent: NestedFormComponent;
    let nestedFixture: ComponentFixture<NestedFormComponent>;

    beforeEach(async () => {
      TestBed.resetTestingModule();

      await TestBed.configureTestingModule({
        imports: [NestedFormComponent],
      }).compileComponents();

      nestedFixture = TestBed.createComponent(NestedFormComponent);
      nestedComponent = nestedFixture.componentInstance;
      nestedFixture.detectChanges();
    });

    it('should sync nested form group values', async () => {
      const firstNameInput = nestedFixture.nativeElement.querySelector('#firstName') as HTMLInputElement;
      const lastNameInput = nestedFixture.nativeElement.querySelector('#lastName') as HTMLInputElement;
      const emailInput = nestedFixture.nativeElement.querySelector('#email') as HTMLInputElement;

      firstNameInput.value = 'John';
      lastNameInput.value = 'Doe';
      emailInput.value = 'john@example.com';

      const event = new CustomEvent('toolactivated', {
        detail: { toolName: 'nested_tool' },
      });
      window.dispatchEvent(event);

      await new Promise((resolve) => setTimeout(resolve, 10));

      expect(nestedComponent.testForm.value.personal?.firstName).toBe('John');
      expect(nestedComponent.testForm.value.personal?.lastName).toBe('Doe');
      expect(nestedComponent.testForm.value.contact?.email).toBe('john@example.com');
      expect(nestedComponent.testForm.valid).toBe(true);
    });
  });

  describe('Cleanup', () => {
    it('should remove event listener on destroy', () => {
      const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');

      fixture.destroy();

      expect(removeEventListenerSpy).toHaveBeenCalledWith(
        'toolactivated',
        expect.any(Function)
      );
    });
  });
});

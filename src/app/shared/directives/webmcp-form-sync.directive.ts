import {
  Directive,
  inject,
  OnDestroy,
  PLATFORM_ID,
  afterNextRender,
  ElementRef,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { FormGroupDirective, AbstractControl, FormGroup } from '@angular/forms';

/**
 * Directive that syncs WebMCP declarative form data to Angular reactive forms.
 *
 * When WebMCP fills a form using the declarative API, it populates native HTML
 * input elements directly. This directive listens for the 'toolactivated' event
 * and syncs those values to Angular's reactive form controls, ensuring validation
 * works correctly.
 *
 * Usage:
 * ```html
 * <form [formGroup]="myForm" appWebmcpFormSync toolname="my_tool">
 *   <!-- form fields -->
 * </form>
 * ```
 */
@Directive({
  selector: 'form[appWebmcpFormSync]',
})
export class WebmcpFormSyncDirective implements OnDestroy {
  private readonly formGroupDirective = inject(FormGroupDirective);
  private readonly elementRef = inject(ElementRef);
  private readonly platformId = inject(PLATFORM_ID);
  private boundHandler: ((event: Event) => void) | null = null;

  private readonly TOOL_ACTIVATED_EVENT = 'toolactivated';
  private readonly TOOL_NAME_ATTR = 'toolname';

  constructor() {
    afterNextRender(() => {
      if (isPlatformBrowser(this.platformId)) {
        this.boundHandler = this.handleToolActivated.bind(this);
        window.addEventListener(this.TOOL_ACTIVATED_EVENT, this.boundHandler);
      }
    });
  }

  /**
   * Handle WebMCP tool activation event
   * Syncs form values from DOM to Angular reactive forms
   */
  private handleToolActivated(event: Event): void {
    // WebMCP events can have toolName in detail or directly on the event
    const customEvent = event as CustomEvent;
    const toolName = customEvent.detail?.toolName || (event as any).toolName;
    const formElement = this.elementRef.nativeElement as HTMLFormElement;

    console.log('[WebMCP Sync] Event received:', {
      eventToolName: toolName,
      formToolName: formElement.getAttribute(this.TOOL_NAME_ATTR),
      formElement,
    });

    // Only handle events for this specific form
    if (!formElement || formElement.getAttribute(this.TOOL_NAME_ATTR) !== toolName) {
      console.log('[WebMCP Sync] Skipping - tool name mismatch');
      return;
    }

    console.log('[WebMCP Sync] Starting sync...');

    // Sync all form field values from DOM to Angular forms
    setTimeout(() => {
      this.syncFormValues(formElement);
    }, 0);
  }

  /**
   * Sync all input values from DOM to Angular form controls
   */
  private syncFormValues(formElement: HTMLFormElement): void {
    const formGroup = this.formGroupDirective.form;

    // Get all form controls (inputs, selects, textareas)
    const formControls = formElement.querySelectorAll<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >('input[name], select[name], textarea[name]');

    console.log('[WebMCP Sync] Found controls:', formControls.length);

    formControls.forEach((element) => {
      const controlName = element.getAttribute('name');
      if (!controlName) return;

      // Find the control in the form (supports nested form groups)
      const control = this.findControl(formGroup, controlName);

      console.log('[WebMCP Sync] Processing:', {
        controlName,
        value: element.value,
        controlFound: !!control,
      });

      if (!control) return;

      // Get the value from the DOM element
      const value = element.value;
      if (!value) return;

      // Update the Angular form control
      control.setValue(value);
      control.markAsTouched();
      control.markAsDirty();

      console.log('[WebMCP Sync] Updated:', controlName, '=', value);
    });

    // Update form validation state
    formGroup.updateValueAndValidity();

    console.log('[WebMCP Sync] Sync complete. Form valid:', formGroup.valid);
  }

  /**
   * Find a control in the form group (supports nested form groups)
   */
  private findControl(formGroup: FormGroup, controlName: string): AbstractControl | null {
    // Try direct access first
    if (formGroup.controls[controlName]) {
      return formGroup.controls[controlName];
    }

    // Search in nested form groups
    for (const key in formGroup.controls) {
      const control = formGroup.controls[key];
      if (control instanceof FormGroup) {
        const nestedControl = this.findControl(control, controlName);
        if (nestedControl) {
          return nestedControl;
        }
      }
    }

    return null;
  }

  ngOnDestroy(): void {
    if (isPlatformBrowser(this.platformId) && this.boundHandler) {
      window.removeEventListener(this.TOOL_ACTIVATED_EVENT, this.boundHandler);
      this.boundHandler = null;
    }
  }
}

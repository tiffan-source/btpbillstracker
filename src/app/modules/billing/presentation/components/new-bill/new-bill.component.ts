import { ChangeDetectionStrategy, Component, effect, ElementRef, inject, viewChild } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { BillingFacade } from '../../services/billing.facade';
import { NewBillForm, NewBillFormModel } from '../../forms/new-bill.form';

@Component({
  selector: 'app-new-bill',
  imports: [ReactiveFormsModule],
  templateUrl: './new-bill.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NewBillComponent {
  readonly facade = inject(BillingFacade);
  readonly invoiceForm = new NewBillForm();
  readonly successModalCloseButton = viewChild<ElementRef<HTMLButtonElement>>('successModalCloseButton');
  isCreatingNewClient = false;
  private hasSubmittedInvalidForm = false;
  private hasHandledSuccess = false;

  constructor() {
    this.invoiceForm.setClientMode(this.isCreatingNewClient);

    effect(() => {
      const isSuccess = this.facade.isSuccess();
      if (isSuccess && !this.hasHandledSuccess) {
        this.resetFormAfterSuccess();
        this.hasHandledSuccess = true;
      }
      if (!isSuccess) {
        this.hasHandledSuccess = false;
      }
    });

    effect(() => {
      if (!this.facade.isSuccess()) {
        return;
      }

      this.successModalCloseButton()?.nativeElement.focus();
    });
  }

  toggleNewClientMode(): void {
    this.isCreatingNewClient = !this.isCreatingNewClient;
    this.invoiceForm.setClientMode(this.isCreatingNewClient);
  }

  onSubmit(): void {
    if (this.facade.isSubmitting()) {
      return;
    }

    if (this.invoiceForm.invalid) {
      this.hasSubmittedInvalidForm = true;
      this.invoiceForm.markAllAsTouched();
      return;
    }
    this.facade.createInvoice(this.invoiceForm.getPayload());
  }

  hasFieldError(controlName: keyof NewBillFormModel): boolean {
    const control = this.invoiceForm.controls[controlName];

    if (!control) {
      return false;
    }

    return this.hasSubmittedInvalidForm && control.invalid;
  }

  fieldErrorMessage(controlName: keyof NewBillFormModel): string | null {
    if (!this.hasFieldError(controlName)) {
      return null;
    }

    return this.invoiceForm.getErrorMessage(controlName);
  }

  onPdfSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (!file) {
      this.invoiceForm.patchValue({ pdfFile: null });
      return;
    }

    this.invoiceForm.patchValue({
      pdfFile: {
        name: file.name,
        size: file.size,
        type: file.type
      }
    });
  }

  closeSuccessModal(): void {
    this.facade.dismissSuccess();
  }

  private resetFormAfterSuccess(): void {
    this.isCreatingNewClient = false;
    this.hasSubmittedInvalidForm = false;
    this.invoiceForm.reset({
      clientId: '',
      newClientName: '',
      chantier: '',
      amountTTC: null,
      dueDate: '',
      invoiceNumber: '',
      type: 'Situation',
      paymentMode: 'Virement',
      pdfFile: null
    });
    this.invoiceForm.setClientMode(false);
  }
}

import { ChangeDetectionStrategy, Component, effect, ElementRef, inject, viewChild } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { BillingFacade } from '../../services/billing.facade';
import { NewBillForm, NewBillFormModel } from '../../forms/new-bill.form';
import { BillPdfMemoryFile } from '../../models/bill-pdf-memory-file.model';
import { BILL_TYPES, PAYMENT_MODES } from '../../../domain/values/bill.constraints';

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
  selectedPdfFile: BillPdfMemoryFile | null = null;
  readonly billTypes = BILL_TYPES;
  readonly paymentModes = PAYMENT_MODES;
  isCreatingNewClient = false;
  private hasSubmittedInvalidForm = false;
  private hasHandledSuccess = false;

  constructor() {
    this.invoiceForm.setClientMode(this.isCreatingNewClient);
    void this.facade.loadClients();
    void this.facade.loadChantiers();
    void this.facade.loadReminderScenarios();

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

    effect(() => {
      if (!this.invoiceForm.controls.remindersAutoEnabled.value) {
        return;
      }
      if (this.invoiceForm.controls.reminderScenarioId.value) {
        return;
      }

      const firstScenario = this.facade.reminderScenarios()[0];
      if (firstScenario) {
        this.invoiceForm.controls.reminderScenarioId.setValue(firstScenario.id);
      }
    });
  }

  toggleNewClientMode(): void {
    this.isCreatingNewClient = !this.isCreatingNewClient;
    this.invoiceForm.setClientMode(this.isCreatingNewClient);
  }


  toggleRemindersAuto(isEnabled: boolean): void {
    this.invoiceForm.setRemindersAutoEnabled(isEnabled);
    if (isEnabled) {
      const firstScenario = this.facade.reminderScenarios()[0];
      this.invoiceForm.controls.reminderScenarioId.setValue(firstScenario?.id ?? '');
    }
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
    void this.facade.requestInvoiceCreation({
      ...this.invoiceForm.getPayload(),
      pdfFile: this.selectedPdfFile
    });
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
      this.selectedPdfFile = null;
      return;
    }

    this.selectedPdfFile = {
      name: file.name,
      size: file.size,
      type: file.type
    };
  }

  closeSuccessModal(): void {
    this.facade.dismissSuccess();
  }

  onUseExistingClient(): void {
    void this.facade.confirmUseExistingClient();
  }

  onCreateNewClientAnyway(): void {
    void this.facade.confirmCreateNewClient();
  }

  closeDuplicateClientModal(): void {
    this.facade.dismissDuplicateClientPrompt();
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
      remindersAutoEnabled: true,
      reminderScenarioId: this.facade.reminderScenarios()[0]?.id ?? ''
    });
    this.selectedPdfFile = null;
    this.invoiceForm.setClientMode(false);
  }
}

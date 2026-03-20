import { Injectable, signal, inject } from '@angular/core';
import { BillPdfMemoryFile, BillStore } from '../stores/bill.store';
import { SubmitNewBillUseCase, SubmitNewBillInput } from '../../domain/usecases/submit-new-bill.usecase';

export type SubmitBillInput = SubmitNewBillInput & { pdfFile?: BillPdfMemoryFile | null };
type InvoiceFormValue = {
  clientId?: string | null;
  newClientName?: string | null;
  chantier?: string | null;
  amountTTC?: number | null;
  dueDate?: string | null;
  invoiceNumber?: string | null;
  type?: string | null;
  paymentMode?: string | null;
  pdfFile?: BillPdfMemoryFile | null;
};

@Injectable({ providedIn: 'root' })
export class BillingFacade {
  private readonly submitNewBillUseCase = inject(SubmitNewBillUseCase);
  private readonly store = inject(BillStore);

  readonly isSubmitting = signal(false);
  readonly error = signal<string | null>(null);
  readonly isSuccess = signal(false);
  readonly draftBill = this.store.draftBill;

  // Mock data to satisfy UI blueprint
  readonly clients = signal<{id: string, name: string}[]>([
    { id: 'client-1', name: 'Client 1' },
    { id: 'client-2', name: 'Client 2' }
  ]);

  async createInvoice(formValue: InvoiceFormValue): Promise<void> {
    this.isSuccess.set(false);
    this.isSubmitting.set(true);
    // Temporary implementation linking to old logic for compatibility if needed.
    // Wait for 500ms to simulate network
    await new Promise(resolve => setTimeout(resolve, 500));

    console.log('Facture en cours de création', formValue);

    const normalizedNewClientName = formValue.newClientName?.trim();
    const input: SubmitBillInput = normalizedNewClientName
      ? {
          clientMode: 'NEW',
          newClientName: normalizedNewClientName,
          amountTTC: formValue.amountTTC ?? 0,
          dueDate: formValue.dueDate ?? '',
          externalInvoiceReference: formValue.invoiceNumber ?? '',
          type: formValue.type ?? '',
          paymentMode: formValue.paymentMode ?? '',
          pdfFile: formValue.pdfFile ?? null
        }
      : {
          clientMode: 'EXISTING',
          clientId: formValue.clientId ?? 'unknown',
          amountTTC: formValue.amountTTC ?? 0,
          dueDate: formValue.dueDate ?? '',
          externalInvoiceReference: formValue.invoiceNumber ?? '',
          type: formValue.type ?? '',
          paymentMode: formValue.paymentMode ?? '',
          pdfFile: formValue.pdfFile ?? null
        };
    await this.submitNewBill(input);

    this.isSubmitting.set(false);
  }

  async submitNewBill(input: SubmitBillInput): Promise<void> {
    this.error.set(null);

    const result = await this.submitNewBillUseCase.execute(input);

    if (result.success) {
      this.store.setDraftBill(result.data, input.pdfFile ?? null);
      this.isSuccess.set(true);
    } else {
      this.error.set(result.error.message);
    }
  }

  dismissSuccess(): void {
    this.isSuccess.set(false);
  }
}

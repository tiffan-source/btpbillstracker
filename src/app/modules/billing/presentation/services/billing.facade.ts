import { Injectable, signal, inject } from '@angular/core';
import { BillStore } from '../stores/bill.store';
import { BillPdfMemoryFile } from '../models/bill-pdf-memory-file.model';
import { CreateEnrichedBillInput, CreateEnrichedBillUseCase } from '../../domain/usecases/create-enriched-bill.usecase';
import { BillingInvoiceFormValue, mapInvoiceFormToCreateEnrichedBillInput } from './bill-submission.mapper';

export type SubmitBillInput = BillingInvoiceFormValue & {
  pdfFile?: BillPdfMemoryFile | null;
};

@Injectable({ providedIn: 'root' })
export class BillingFacade {
  private readonly createEnrichedBillUseCase = inject(CreateEnrichedBillUseCase);
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

  async createInvoice(formValue: SubmitBillInput): Promise<void> {
    this.isSuccess.set(false);
    this.isSubmitting.set(true);
    // Temporary implementation linking to old logic for compatibility if needed.
    // Wait for 500ms to simulate network
    await new Promise(resolve => setTimeout(resolve, 500));

    console.log('Facture en cours de création', formValue);

    const input = mapInvoiceFormToCreateEnrichedBillInput(formValue);
    await this.submitNewBill(input, formValue.pdfFile ?? null);

    this.isSubmitting.set(false);
  }

  async submitNewBill(input: CreateEnrichedBillInput, pdfFile: BillPdfMemoryFile | null): Promise<void> {
    this.error.set(null);

    const result = await this.createEnrichedBillUseCase.execute(input);

    if (result.success) {
      this.store.setDraftBill(result.data, pdfFile);
      this.isSuccess.set(true);
    } else {
      this.error.set(result.error.message);
    }
  }

  dismissSuccess(): void {
    this.isSuccess.set(false);
  }
}

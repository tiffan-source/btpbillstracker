import { Injectable, signal, inject } from '@angular/core';
import { BillStore } from '../stores/bill.store';
import { SubmitNewBillUseCase, SubmitNewBillInput } from '../../domain/usecases/submit-new-bill.usecase';

export type SubmitBillInput = SubmitNewBillInput;

@Injectable({ providedIn: 'root' })
export class BillingFacade {
  private readonly submitNewBillUseCase = inject(SubmitNewBillUseCase);
  private readonly store = inject(BillStore);

  readonly isSubmitting = signal(false);
  readonly error = signal<string | null>(null);
  readonly draftBill = this.store.draftBill;

  // Mock data to satisfy UI blueprint
  readonly clients = signal<{id: string, name: string}[]>([
    { id: 'client-1', name: 'Client 1' },
    { id: 'client-2', name: 'Client 2' }
  ]);

  readonly scenarios = signal<{id: string, label: string}[]>([
    { id: 'standard', label: 'Standard - J-3, J+3, J+10' }
  ]);

  async createInvoice(formValue: any): Promise<void> {
    this.isSubmitting.set(true);
    // Temporary implementation linking to old logic for compatibility if needed.
    // Wait for 500ms to simulate network
    await new Promise(resolve => setTimeout(resolve, 500));

    console.log('Facture en cours de création', formValue);

    // Attempt submitting logic if client exists or dynamically
    const input: SubmitBillInput = {
      isNewClient: !!formValue.newClientName,
      clientIdOrName: formValue.newClientName || formValue.clientId || 'unknown'
    };
    await this.submitNewBill(input);

    this.isSubmitting.set(false);
  }

  async submitNewBill(input: SubmitBillInput): Promise<void> {
    this.error.set(null);

    const result = await this.submitNewBillUseCase.execute(input);

    if (result.success) {
      this.store.setDraftBill(result.data);
    } else {
      this.error.set(result.error.message);
    }
  }
}

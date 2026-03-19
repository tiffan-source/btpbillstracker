import { Injectable, signal, inject } from '@angular/core';
import { CreateDraftBillUseCase } from '../../domain/usecases/create-draft-bill.usecase';
import { BillStore } from '../stores/bill.store';
import { CreateQuickClientUseCase, CreateQuickClientInput } from '../../../clients';

export type SubmitBillInput = {
  isNewClient: boolean;
  clientIdOrName: string;
  clientEmail?: string;
};

@Injectable({ providedIn: 'root' })
export class BillingFacade {
  private readonly createDraftBillUseCase = inject(CreateDraftBillUseCase);
  private readonly createQuickClientUseCase = inject(CreateQuickClientUseCase);
  private readonly store = inject(BillStore);

  readonly isSubmitting = signal(false);
  readonly error = signal<string | null>(null);
  readonly draftBill = this.store.draftBill;

  async submitNewBill(input: SubmitBillInput): Promise<void> {
    this.isSubmitting.set(true);
    this.error.set(null);

    let finalClientId = input.clientIdOrName;

    if (input.isNewClient) {
      const clientResult = await this.createQuickClientUseCase.execute({ 
        name: input.clientIdOrName, 
        email: input.clientEmail 
      });

      if (!clientResult.success) {
        this.error.set(clientResult.error.message);
        this.isSubmitting.set(false);
        return;
      }
      finalClientId = clientResult.data.id;
    }

    const billResult = await this.createDraftBillUseCase.execute(finalClientId);

    if (billResult.success) {
      this.store.setDraftBill(billResult.data);
    } else {
      this.error.set(billResult.error.message);
    }

    this.isSubmitting.set(false);
  }
}


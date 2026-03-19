import { Injectable, signal, inject } from '@angular/core';
import { CreateDraftBillUseCase } from '../../domain/usecases/create-draft-bill.usecase';
import { BillStore } from '../stores/bill.store';

@Injectable({ providedIn: 'root' })
export class BillingFacade {
  private readonly createDraftBillUseCase = inject(CreateDraftBillUseCase);
  private readonly store = inject(BillStore);

  readonly isSubmitting = signal(false);
  readonly error = signal<string | null>(null);
  readonly draftBill = this.store.draftBill;

  async createDraftBill(clientId: string): Promise<void> {
    this.isSubmitting.set(true);
    this.error.set(null);

    const result = await this.createDraftBillUseCase.execute(clientId);

    if (result.success) {
      this.store.setDraftBill(result.data);
    } else {
      this.error.set(result.error.message);
    }

    this.isSubmitting.set(false);
  }
}

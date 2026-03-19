import { Injectable, signal } from '@angular/core';
import { BillStore, BillViewModel } from '../../presentation/stores/bill.store';
import { Bill } from '../../domain/entities/bill.entity';

@Injectable({ providedIn: 'root' })
export class LocalBillStore implements BillStore {
  readonly draftBill = signal<BillViewModel | null>(null);

  setDraftBill(bill: Bill): void {
    this.draftBill.set({
      id: bill.id,
      reference: bill.reference,
      clientId: bill.clientId,
      status: bill.status
    });
  }
}

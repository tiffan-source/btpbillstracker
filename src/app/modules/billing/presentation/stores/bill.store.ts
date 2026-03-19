import { Bill } from '../../domain/entities/bill.entity';
import { Signal } from '@angular/core';

export type BillViewModel = {
  id: string;
  reference: string;
  clientId: string;
  status: string;
};

export abstract class BillStore {
  abstract readonly draftBill: Signal<BillViewModel | null>;

  abstract setDraftBill(bill: Bill): void;
}

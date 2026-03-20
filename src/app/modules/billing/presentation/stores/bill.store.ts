import { Bill } from '../../domain/entities/bill.entity';
import { Signal } from '@angular/core';
import { BillPdfMemoryFile } from '../models/bill-pdf-memory-file.model';

export type BillViewModel = {
  id: string;
  reference: string;
  clientId: string;
  status: string;
  amountTTC?: number;
  dueDate?: string;
  externalInvoiceReference?: string;
  type?: string;
  paymentMode?: string;
  pdfFile?: BillPdfMemoryFile | null;
};

export abstract class BillStore {
  abstract readonly draftBill: Signal<BillViewModel | null>;

  abstract setDraftBill(bill: Bill, pdfFile?: BillPdfMemoryFile | null): void;
}

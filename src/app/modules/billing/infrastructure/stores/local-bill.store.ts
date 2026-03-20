import { Injectable, signal } from '@angular/core';
import { BillStore, BillViewModel } from '../../presentation/stores/bill.store';
import { BillPdfMemoryFile } from '../../presentation/models/bill-pdf-memory-file.model';
import { Bill } from '../../domain/entities/bill.entity';

@Injectable({ providedIn: 'root' })
export class LocalBillStore implements BillStore {
  readonly draftBill = signal<BillViewModel | null>(null);

  setDraftBill(bill: Bill, pdfFile?: BillPdfMemoryFile | null): void {
    this.draftBill.set({
      id: bill.id,
      reference: bill.reference,
      clientId: bill.clientId,
      status: bill.status,
      amountTTC: bill.amountTTC,
      dueDate: bill.dueDate,
      externalInvoiceReference: bill.externalInvoiceReference,
      type: bill.type,
      paymentMode: bill.paymentMode,
      pdfFile: pdfFile ?? null
    });
  }
}

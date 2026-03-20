import { Injectable } from '@angular/core';
import { BillRepository } from '../../domain/ports/bill.repository';
import { Bill } from '../../domain/entities/bill.entity';
import { BillPersistenceError } from '../../domain/errors/bill-persistence.error';

@Injectable({ providedIn: 'root' })
export class LocalBillRepository implements BillRepository {
  private readonly storageKey = 'btp_bills';

  /**
   * Sauvegarder une facture en stockage local.
   * @throws {BillPersistenceError} Quand la persistance locale échoue.
   */
  async save(bill: Bill): Promise<void> {
    try {
      const rawData = localStorage.getItem(this.storageKey);
      const bills = rawData ? JSON.parse(rawData) : [];

      const plainBill = {
        id: bill.id,
        reference: bill.reference,
        clientId: bill.clientId,
        status: bill.status,
        amountTTC: bill.amountTTC,
        dueDate: bill.dueDate,
        externalInvoiceReference: bill.externalInvoiceReference,
        type: bill.type,
        paymentMode: bill.paymentMode
      };

      bills.push(plainBill);
      localStorage.setItem(this.storageKey, JSON.stringify(bills));
    } catch (error: unknown) {
      throw new BillPersistenceError(undefined, { storageKey: this.storageKey }, error);
    }
  }
}

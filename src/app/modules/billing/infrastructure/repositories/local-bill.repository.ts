import { Injectable } from '@angular/core';
import { BillRepository } from '../../domain/ports/bill.repository';
import { Bill, BillStatus } from '../../domain/entities/bill.entity';
import { BillNotFoundError } from '../../domain/errors/bill-not-found.error';
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
      const bills = this.readPlainBills();

      const plainBill = this.toPlainBill(bill);

      bills.push(plainBill);
      localStorage.setItem(this.storageKey, JSON.stringify(bills));
    } catch (error: unknown) {
      throw new BillPersistenceError(undefined, { storageKey: this.storageKey }, error);
    }
  }

  async list(): Promise<Bill[]> {
    try {
      return this.readPlainBills().map((plainBill) => {
        const bill = new Bill(plainBill.id, plainBill.reference, plainBill.clientId);

        if (typeof plainBill.amountTTC === 'number') {
          bill.setAmountTTC(plainBill.amountTTC);
        }
        if (plainBill.dueDate) {
          bill.setDueDate(plainBill.dueDate);
        }
        if (plainBill.externalInvoiceReference) {
          bill.setExternalInvoiceReference(plainBill.externalInvoiceReference);
        }
        if (plainBill.type) {
          bill.setType(plainBill.type);
        }
        if (plainBill.paymentMode) {
          bill.setPaymentMode(plainBill.paymentMode);
        }
        if (plainBill.chantier) {
          bill.setChantier(plainBill.chantier);
        }
        if (this.isBillStatus(plainBill.status)) {
          bill.setStatus(plainBill.status);
        }

        return bill;
      });
    } catch (error: unknown) {
      throw new BillPersistenceError('Impossible de lire les factures.', { storageKey: this.storageKey }, error);
    }
  }


  async listByOwner(userId: string): Promise<Bill[]> {
    return this.list();
  }

  async update(bill: Bill): Promise<void> {
    try {
      const bills = this.readPlainBills();
      const index = bills.findIndex((item) => item.id === bill.id);

      if (index < 0) {
        throw new BillNotFoundError(undefined, { billId: bill.id });
      }

      bills[index] = this.toPlainBill(bill);
      localStorage.setItem(this.storageKey, JSON.stringify(bills));
    } catch (error: unknown) {
      if (error instanceof BillNotFoundError) {
        throw error;
      }
      throw new BillPersistenceError(undefined, { storageKey: this.storageKey }, error);
    }
  }

  private readPlainBills(): Array<{
    id: string;
    reference: string;
    clientId: string;
    status?: string;
    amountTTC?: number;
    dueDate?: string;
    externalInvoiceReference?: string;
    type?: string;
    paymentMode?: string;
    chantier?: string;
  }> {
    const rawData = localStorage.getItem(this.storageKey);
    return rawData ? JSON.parse(rawData) : [];
  }

  private toPlainBill(bill: Bill): {
    id: string;
    reference: string;
    clientId: string;
    status: string;
    amountTTC?: number;
    dueDate?: string;
    externalInvoiceReference?: string;
    type?: string;
    paymentMode?: string;
    chantier?: string;
  } {
    return {
      id: bill.id,
      reference: bill.reference,
      clientId: bill.clientId,
      status: bill.status,
      amountTTC: bill.amountTTC,
      dueDate: bill.dueDate,
      externalInvoiceReference: bill.externalInvoiceReference,
      type: bill.type,
      paymentMode: bill.paymentMode,
      chantier: bill.chantier
    };
  }

  private isBillStatus(value: string | undefined): value is BillStatus {
    return value === 'DRAFT' || value === 'VALIDATED' || value === 'PAID';
  }
}

import { Injectable } from '@angular/core';
import { BillRepository } from '../../domain/ports/bill.repository';
import { Bill, BillStatus } from '../../domain/entities/bill.entity';
import { BillNotFoundError } from '../../domain/errors/bill-not-found.error';
import { BillPersistenceError } from '../../domain/errors/bill-persistence.error';
import { LocalBillDataSource } from './local-bill.datasource';

type LocalPlainBill = {
  id: string;
  ownerUid?: string;
  reference: string;
  clientId: string;
  status?: string;
  amountTTC?: number;
  dueDate?: string;
  externalInvoiceReference?: string;
  type?: string;
  paymentMode?: string;
  chantierId?: string;
};

@Injectable({ providedIn: 'root' })
export class LocalBillRepository implements BillRepository {
  private readonly storageKey = 'btp_bills';

  constructor(private readonly dataSource: LocalBillDataSource) {}

  async save(bill: Bill): Promise<void> {
    try {
      const ownerUid = this.getOwnerUid();
      const bills = this.readPlainBills();

      bills.push(this.toPlainBill(bill, ownerUid));
      localStorage.setItem(this.storageKey, JSON.stringify(bills));
    } catch (error: unknown) {
      throw new BillPersistenceError(undefined, { storageKey: this.storageKey }, error);
    }
  }

  async list(): Promise<Bill[]> {
    try {
      const ownerUid = this.getOwnerUid();
      return this.mapToEntities(this.readPlainBills().filter((plainBill) => plainBill.ownerUid === ownerUid));
    } catch (error: unknown) {
      throw new BillPersistenceError('Impossible de lire les factures.', { storageKey: this.storageKey }, error);
    }
  }

  async listByOwner(userId: string): Promise<Bill[]> {
    try {
      return this.mapToEntities(this.readPlainBills().filter((plainBill) => plainBill.ownerUid === userId));
    } catch (error: unknown) {
      throw new BillPersistenceError('Impossible de lire les factures.', { storageKey: this.storageKey }, error);
    }
  }

  async update(bill: Bill): Promise<void> {
    try {
      const ownerUid = this.getOwnerUid();
      const bills = this.readPlainBills();
      const index = bills.findIndex((item) => item.id === bill.id && item.ownerUid === ownerUid);

      if (index < 0) {
        throw new BillNotFoundError(undefined, { billId: bill.id });
      }

      bills[index] = this.toPlainBill(bill, ownerUid);
      localStorage.setItem(this.storageKey, JSON.stringify(bills));
    } catch (error: unknown) {
      if (error instanceof BillNotFoundError) {
        throw error;
      }
      throw new BillPersistenceError(undefined, { storageKey: this.storageKey }, error);
    }
  }

  private mapToEntities(plainBills: LocalPlainBill[]): Bill[] {
    return plainBills.map((plainBill) => {
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
      if (plainBill.chantierId) {
        bill.setChantierId(plainBill.chantierId);
      }
      if (this.isBillStatus(plainBill.status)) {
        bill.setStatus(plainBill.status);
      }

      return bill;
    });
  }

  private readPlainBills(): LocalPlainBill[] {
    const rawData = localStorage.getItem(this.storageKey);
    return rawData ? JSON.parse(rawData) : [];
  }

  private toPlainBill(bill: Bill, ownerUid: string): LocalPlainBill {
    return {
      id: bill.id,
      ownerUid,
      reference: bill.reference,
      clientId: bill.clientId,
      status: bill.status,
      amountTTC: bill.amountTTC,
      dueDate: bill.dueDate,
      externalInvoiceReference: bill.externalInvoiceReference,
      type: bill.type,
      paymentMode: bill.paymentMode,
      chantierId: bill.chantierId
    };
  }

  private isBillStatus(value: string | undefined): value is BillStatus {
    return value === 'DRAFT' || value === 'VALIDATED' || value === 'PAID';
  }

  private getOwnerUid(): string {
    const currentUser = this.dataSource.getCurrentUser();
    if (!currentUser?.uid) {
      throw new BillPersistenceError('Utilisateur non authentifié.', { storageKey: this.storageKey });
    }

    return currentUser.uid;
  }
}

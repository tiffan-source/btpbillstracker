import { Injectable } from '@angular/core';
import { Bill, BillStatus } from '../../domain/entities/bill.entity';
import { BillNotFoundError } from '../../domain/errors/bill-not-found.error';
import { BillPersistenceError } from '../../domain/errors/bill-persistence.error';
import { BillRepository } from '../../domain/ports/bill.repository';
import { FirestoreBillDataSource, FirestorePlainBill } from './firestore-bill.datasource';

@Injectable({ providedIn: 'root' })
export class FirestoreBillRepository implements BillRepository {
  private readonly collectionName = 'bills';

  constructor(private readonly dataSource: FirestoreBillDataSource) {}

  async save(bill: Bill): Promise<void> {
    try {
      const ownerUid = this.getOwnerUid();
      await this.dataSource.saveById(bill.id, this.toPlainBill(bill, ownerUid));
    } catch (error: unknown) {
      throw new BillPersistenceError(undefined, { collection: this.collectionName, billId: bill.id }, error);
    }
  }

  async list(): Promise<Bill[]> {
    try {
      const ownerUid = this.getOwnerUid();
      const snapshot = await this.dataSource.readAll();
      return snapshot.docs
        .map((entry) => entry.data() as FirestorePlainBill)
        .filter((plainBill) => plainBill.ownerUid === ownerUid)
        .map((plainBill) => this.toEntity(plainBill));
    } catch (error: unknown) {
      throw new BillPersistenceError('Impossible de lire les factures.', { collection: this.collectionName }, error);
    }
  }


  async listByOwner(userId: string): Promise<Bill[]> {
    return this.list();
  }

  async update(bill: Bill): Promise<void> {
    try {
      const ownerUid = this.getOwnerUid();
      const existing = await this.dataSource.readById(bill.id);

      if (!existing.exists()) {
        throw new BillNotFoundError(undefined, { billId: bill.id });
      }

      const existingData = existing.data() as FirestorePlainBill;
      if (existingData.ownerUid !== ownerUid) {
        throw new BillNotFoundError(undefined, { billId: bill.id });
      }

      await this.dataSource.saveById(bill.id, this.toPlainBill(bill, ownerUid));
    } catch (error: unknown) {
      if (error instanceof BillNotFoundError || error instanceof BillPersistenceError) {
        throw error;
      }
      throw new BillPersistenceError(undefined, { collection: this.collectionName, billId: bill.id }, error);
    }
  }

  private toEntity(plainBill: FirestorePlainBill): Bill {
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
  }

  private toPlainBill(bill: Bill, ownerUid: string): FirestorePlainBill {
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
      chantier: bill.chantier
    };
  }

  private isBillStatus(value: string | undefined): value is BillStatus {
    return value === 'DRAFT' || value === 'VALIDATED' || value === 'PAID';
  }

  private getOwnerUid(): string {
    const currentUser = this.dataSource.getCurrentUser();
    if (!currentUser?.uid) {
      throw new BillPersistenceError('Utilisateur non authentifié.', { collection: this.collectionName });
    }

    return currentUser.uid;
  }
}

import { Injectable } from '@angular/core';
import { BillRepository } from '../../domain/ports/bill.repository';
import { Bill } from '../../domain/entities/bill.entity';

@Injectable({ providedIn: 'root' })
export class LocalBillRepository implements BillRepository {
  private readonly storageKey = 'btp_bills';

  async save(bill: Bill): Promise<void> {
    const rawData = localStorage.getItem(this.storageKey);
    const bills = rawData ? JSON.parse(rawData) : [];

    const plainBill = {
      id: bill.id,
      reference: bill.reference,
      clientId: bill.clientId,
      status: bill.status
    };

    bills.push(plainBill);
    localStorage.setItem(this.storageKey, JSON.stringify(bills));
  }
}

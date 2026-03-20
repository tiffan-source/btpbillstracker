import { Bill } from '../entities/bill.entity';
import { BillNotFoundError } from '../errors/bill-not-found.error';
import { BillPersistenceError } from '../errors/bill-persistence.error';
import { BillRepository } from '../ports/bill.repository';
import { UpdateEnrichedBillUseCase } from './update-enriched-bill.usecase';

class InMemoryBillRepository implements BillRepository {
  private readonly byId = new Map<string, Bill>();
  throwPersistence = false;
  throwUnknown = false;

  constructor(initialBills: Bill[] = []) {
    for (const bill of initialBills) {
      this.byId.set(bill.id, bill);
    }
  }

  async save(bill: Bill): Promise<void> {
    this.byId.set(bill.id, bill);
  }

  async list(): Promise<Bill[]> {
    return Array.from(this.byId.values());
  }

  async update(bill: Bill): Promise<void> {
    if (this.throwUnknown) {
      throw 'unexpected';
    }
    if (this.throwPersistence) {
      throw new BillPersistenceError('Erreur de persistance.');
    }
    if (!this.byId.has(bill.id)) {
      throw new BillNotFoundError(undefined, { billId: bill.id });
    }

    this.byId.set(bill.id, bill);
  }
}

describe('UpdateEnrichedBillUseCase', () => {
  it('updates an existing enriched bill from a valid payload', async () => {
    const existing = new Bill('b-1', 'F-2026-0100', 'client-1');
    const repository = new InMemoryBillRepository([existing]);
    const useCase = new UpdateEnrichedBillUseCase(repository);

    const result = await useCase.execute({
      id: 'b-1',
      reference: 'F-2026-0100',
      clientId: 'client-1',
      amountTTC: 480,
      dueDate: '2026-04-22',
      externalInvoiceReference: 'EXT-9',
      type: 'Situation',
      paymentMode: 'Chèque',
      chantier: 'Cadjehoun',
      remindersAutoEnabled: true,
      reminderScenarioId: 'standard-reminder-scenario',
      status: 'PAID'
    });

    expect(result.success).toBe(true);
    if (!result.success) {
      return;
    }

    expect(result.data.status).toBe('PAID');
    expect(result.data.amountTTC).toBe(480);
    expect(result.data.paymentMode).toBe('Chèque');
    expect(result.data.chantier).toBe('Cadjehoun');
  });

  it('fails when updating a non persisted bill', async () => {
    const repository = new InMemoryBillRepository();
    const useCase = new UpdateEnrichedBillUseCase(repository);

    const result = await useCase.execute({
      id: 'missing',
      reference: 'F-2026-0101',
      clientId: 'client-1',
      amountTTC: 480,
      dueDate: '2026-04-22',
      externalInvoiceReference: 'EXT-9',
      type: 'Situation',
      paymentMode: 'Chèque',
      remindersAutoEnabled: false,
      status: 'VALIDATED'
    });

    expect(result.success).toBe(false);
    if (result.success) {
      return;
    }

    expect(result.error.code).toBe('BILL_NOT_FOUND');
  });

  it('maps persistence failures to BILL_PERSISTENCE_ERROR', async () => {
    const existing = new Bill('b-2', 'F-2026-0102', 'client-1');
    const repository = new InMemoryBillRepository([existing]);
    repository.throwPersistence = true;
    const useCase = new UpdateEnrichedBillUseCase(repository);

    const result = await useCase.execute({
      id: 'b-2',
      reference: 'F-2026-0102',
      clientId: 'client-1',
      amountTTC: 300,
      dueDate: '2026-04-22',
      externalInvoiceReference: 'EXT-10',
      type: 'Situation',
      paymentMode: 'Virement',
      remindersAutoEnabled: false,
      status: 'VALIDATED'
    });

    expect(result.success).toBe(false);
    if (result.success) {
      return;
    }

    expect(result.error.code).toBe('BILL_PERSISTENCE_ERROR');
  });

  it('maps unknown failures to UNKNOWN_ERROR', async () => {
    const existing = new Bill('b-3', 'F-2026-0103', 'client-1');
    const repository = new InMemoryBillRepository([existing]);
    repository.throwUnknown = true;
    const useCase = new UpdateEnrichedBillUseCase(repository);

    const result = await useCase.execute({
      id: 'b-3',
      reference: 'F-2026-0103',
      clientId: 'client-1',
      amountTTC: 300,
      dueDate: '2026-04-22',
      externalInvoiceReference: 'EXT-10',
      type: 'Situation',
      paymentMode: 'Virement',
      remindersAutoEnabled: false,
      status: 'VALIDATED'
    });

    expect(result.success).toBe(false);
    if (result.success) {
      return;
    }

    expect(result.error.code).toBe('UNKNOWN_ERROR');
  });
});

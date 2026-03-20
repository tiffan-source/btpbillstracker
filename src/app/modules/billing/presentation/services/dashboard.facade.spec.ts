import { TestBed } from '@angular/core/testing';
import { Bill } from '../../domain/entities/bill.entity';
import { BillNotFoundError } from '../../domain/errors/bill-not-found.error';
import { BillRepository } from '../../domain/ports/bill.repository';
import { UpdateEnrichedBillUseCase } from '../../domain/usecases/update-enriched-bill.usecase';
import { DashboardFacade } from './dashboard.facade';

class InMemoryBillRepository implements BillRepository {
  private readonly bills = new Map<string, Bill>();

  constructor(initialBills: Bill[] = []) {
    for (const bill of initialBills) {
      this.bills.set(bill.id, bill);
    }
  }

  async save(bill: Bill): Promise<void> {
    this.bills.set(bill.id, bill);
  }

  async list(): Promise<Bill[]> {
    return Array.from(this.bills.values());
  }

  async update(bill: Bill): Promise<void> {
    if (!this.bills.has(bill.id)) {
      throw new BillNotFoundError(undefined, { billId: bill.id });
    }

    this.bills.set(bill.id, bill);
  }
}

describe('DashboardFacade', () => {
  it('should expose seeded invoices and relance placeholder', async () => {
    TestBed.configureTestingModule({
      providers: [
        DashboardFacade,
        { provide: BillRepository, useValue: new InMemoryBillRepository() },
        {
          provide: UpdateEnrichedBillUseCase,
          useFactory: (repo: BillRepository) => new UpdateEnrichedBillUseCase(repo),
          deps: [BillRepository]
        }
      ]
    });

    const facade = TestBed.inject(DashboardFacade);
    await Promise.resolve();
    const invoices = facade.invoices();

    expect(invoices.length).toBeGreaterThan(0);
    expect(invoices.every((invoice) => invoice.nextReminder === '—')).toBe(true);
  });

  it('opens edit mode only for persisted invoices', async () => {
    const persisted = new Bill('b-1', 'F-2026-0100', 'client-1')
      .setAmountTTC(420)
      .setDueDate('2099-12-30')
      .setExternalInvoiceReference('EXT-1')
      .setType('Situation')
      .setPaymentMode('Virement')
      .setStatus('VALIDATED');
    const repository = new InMemoryBillRepository([persisted]);

    TestBed.configureTestingModule({
      providers: [
        DashboardFacade,
        { provide: BillRepository, useValue: repository },
        {
          provide: UpdateEnrichedBillUseCase,
          useFactory: (repo: BillRepository) => new UpdateEnrichedBillUseCase(repo),
          deps: [BillRepository]
        }
      ]
    });

    const facade = TestBed.inject(DashboardFacade);
    await Promise.resolve();

    const editable = await facade.openEditInvoice('b-1');
    expect(editable).not.toBeNull();
    expect(facade.isEditModalOpen()).toBe(true);

    const denied = await facade.openEditInvoice('inv-2');
    expect(denied).toBeNull();
    expect(facade.editError()).toContain('Seules les factures persistées');
  });

  it('submits edited invoice, closes modal and refreshes dashboard on success', async () => {
    const persisted = new Bill('b-2', 'F-2026-0101', 'client-2')
      .setAmountTTC(510)
      .setDueDate('2099-12-30')
      .setExternalInvoiceReference('EXT-2')
      .setType('Situation')
      .setPaymentMode('Virement')
      .setStatus('VALIDATED');
    const repository = new InMemoryBillRepository([persisted]);

    TestBed.configureTestingModule({
      providers: [
        DashboardFacade,
        { provide: BillRepository, useValue: repository },
        {
          provide: UpdateEnrichedBillUseCase,
          useFactory: (repo: BillRepository) => new UpdateEnrichedBillUseCase(repo),
          deps: [BillRepository]
        }
      ]
    });
    const facade = TestBed.inject(DashboardFacade);
    await Promise.resolve();
    await facade.openEditInvoice('b-2');

    await facade.submitEditedInvoice({
      id: 'b-2',
      reference: 'F-2026-0101',
      clientId: 'client-2',
      newClientName: '',
      chantier: 'Akpakpa',
      amountTTC: 777,
      dueDate: '2099-12-28',
      invoiceNumber: 'EXT-2B',
      type: 'Solde',
      paymentMode: 'Chèque',
      status: 'PAID',
      remindersAutoEnabled: false,
      reminderScenarioId: ''
    });

    expect(facade.isEditModalOpen()).toBe(false);
    expect(facade.editSuccess()).toBe(true);
    expect(facade.editError()).toBeNull();
    expect(facade.isEditSubmitting()).toBe(false);

    const updatedInvoice = facade.invoices().find((item) => item.id === 'b-2');
    expect(updatedInvoice?.status).toBe('PAYE');
    expect(updatedInvoice?.amountTTC).toBe(777);
    expect(updatedInvoice?.chantier).toBe('Akpakpa');
  });

  it('keeps modal open and exposes error when update fails', async () => {
    TestBed.configureTestingModule({
      providers: [
        DashboardFacade,
        { provide: BillRepository, useValue: new InMemoryBillRepository() },
        {
          provide: UpdateEnrichedBillUseCase,
          useFactory: (repo: BillRepository) => new UpdateEnrichedBillUseCase(repo),
          deps: [BillRepository]
        }
      ]
    });
    const facade = TestBed.inject(DashboardFacade);
    await Promise.resolve();

    facade.isEditModalOpen.set(true);

    await facade.submitEditedInvoice({
      id: 'missing',
      reference: 'F-2026-9999',
      clientId: 'client-2',
      newClientName: '',
      chantier: '',
      amountTTC: 777,
      dueDate: '2099-12-28',
      invoiceNumber: 'EXT-2B',
      type: 'Solde',
      paymentMode: 'Chèque',
      status: 'PAID',
      remindersAutoEnabled: false,
      reminderScenarioId: ''
    });

    expect(facade.isEditModalOpen()).toBe(true);
    expect(facade.editSuccess()).toBe(false);
    expect(facade.editError()).toContain('introuvable');
    expect(facade.isEditSubmitting()).toBe(false);
  });
});

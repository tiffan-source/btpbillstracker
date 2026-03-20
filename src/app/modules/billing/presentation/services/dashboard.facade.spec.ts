import { TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { BillStore, BillViewModel } from '../stores/bill.store';
import { DashboardFacade } from './dashboard.facade';
import { Bill } from '../../domain/entities/bill.entity';

class MockBillStore implements BillStore {
  draftBill = signal<BillViewModel | null>(null);

  setDraftBill(bill: Bill): void {
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
      pdfFile: null
    });
  }
}

describe('DashboardFacade', () => {
  it('should expose seeded invoices and relance placeholder', () => {
    TestBed.configureTestingModule({
      providers: [DashboardFacade, { provide: BillStore, useClass: MockBillStore }]
    });

    const facade = TestBed.inject(DashboardFacade);
    const invoices = facade.invoices();

    expect(invoices.length).toBeGreaterThan(0);
    expect(invoices.every((invoice) => invoice.nextReminder === '—')).toBe(true);
  });

  it('should include draft bill in dashboard invoices', () => {
    const store = new MockBillStore();
    TestBed.configureTestingModule({
      providers: [DashboardFacade, { provide: BillStore, useValue: store }]
    });

    const facade = TestBed.inject(DashboardFacade);
    const draft = new Bill('draft-1', 'F-2026-1001', 'client-100').setAmountTTC(650).setDueDate('2099-12-31');
    store.setDraftBill(draft);

    const invoices = facade.invoices();
    expect(invoices[0].id).toBe('draft-1');
    expect(invoices[0].status).toBe('EN_COURS');
  });

  it('should compute kpis with current month collection rule', () => {
    TestBed.configureTestingModule({
      providers: [DashboardFacade, { provide: BillStore, useClass: MockBillStore }]
    });
    const facade = TestBed.inject(DashboardFacade);
    const kpis = facade.kpis();

    expect(kpis.overdueInvoices).toBeGreaterThanOrEqual(1);
    expect(kpis.totalOverdueAmount).toBeGreaterThanOrEqual(0);
    expect(kpis.toCollectThisMonth).toBeGreaterThanOrEqual(0);
    expect(kpis.inProgressInvoices).toBeGreaterThanOrEqual(0);
  });

  it('should mark invoice as paid in UI-only mode', () => {
    TestBed.configureTestingModule({
      providers: [DashboardFacade, { provide: BillStore, useClass: MockBillStore }]
    });
    const facade = TestBed.inject(DashboardFacade);
    const invoice = facade.invoices().find((item) => item.status !== 'PAYE');
    expect(invoice).toBeTruthy();
    if (!invoice) {
      return;
    }

    facade.markAsPaid(invoice.id);
    const updated = facade.invoices().find((item) => item.id === invoice.id);
    expect(updated?.status).toBe('PAYE');
  });
});


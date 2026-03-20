import { TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { BillPdfMemoryFile, BillStore, BillViewModel } from '../stores/bill.store';
import { Bill } from '../../domain/entities/bill.entity';
import { SubmitNewBillUseCase } from '../../domain/usecases/submit-new-bill.usecase';
import { BillingFacade } from './billing.facade';
import { success, failure } from '../../../../core/result/result';

class MockBillStore implements BillStore {
  draftBill = signal<BillViewModel | null>(null);

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

describe('BillingFacade', () => {
  it('should create a bill and update state on success', async () => {
    const mockStore = new MockBillStore();
    const mockSubmitNewBill = {
      execute: vitest.fn().mockResolvedValue(
        success(
          new Bill('b-1', 'F-2026-0001', 'c-1')
            .setAmountTTC(1400)
            .setDueDate('2026-05-01')
            .setExternalInvoiceReference('EXT-77')
            .setType('Situation')
            .setPaymentMode('Virement')
        )
      )
    };

    TestBed.configureTestingModule({
      providers: [
        BillingFacade,
        { provide: BillStore, useValue: mockStore },
        { provide: SubmitNewBillUseCase, useValue: mockSubmitNewBill }
      ]
    });

    const facade = TestBed.inject(BillingFacade);

    expect(facade.isSubmitting()).toBe(false);

    const promise = facade.createInvoice({
      clientId: 'c-1',
      newClientName: '',
      chantier: '',
      amountTTC: 1400,
      dueDate: '2026-05-01',
      invoiceNumber: 'EXT-77',
      type: 'Situation',
      paymentMode: 'Virement',
      pdfFile: { name: 'facture.pdf', size: 2048, type: 'application/pdf' }
    });
    
    expect(facade.isSubmitting()).toBe(true);

    await promise;

    expect(mockSubmitNewBill.execute).toHaveBeenCalledWith({
      clientMode: 'EXISTING',
      clientId: 'c-1',
      amountTTC: 1400,
      dueDate: '2026-05-01',
      externalInvoiceReference: 'EXT-77',
      type: 'Situation',
      paymentMode: 'Virement',
      pdfFile: { name: 'facture.pdf', size: 2048, type: 'application/pdf' }
    });
    expect(facade.isSubmitting()).toBe(false);
    expect(facade.error()).toBeNull();
    expect(mockStore.draftBill()).toEqual({
      id: 'b-1',
      reference: 'F-2026-0001',
      clientId: 'c-1',
      status: 'DRAFT',
      amountTTC: 1400,
      dueDate: '2026-05-01',
      externalInvoiceReference: 'EXT-77',
      type: 'Situation',
      paymentMode: 'Virement',
      pdfFile: { name: 'facture.pdf', size: 2048, type: 'application/pdf' }
    });
  });

  it('should format correctly for new client inputs', async () => {
    const mockStore = new MockBillStore();
    const mockSubmitNewBill = {
      execute: vitest.fn().mockResolvedValue(
        success(new Bill('b-1', 'F-2026-0001', 'new-client-id'))
      )
    };

    TestBed.configureTestingModule({
      providers: [
        BillingFacade,
        { provide: BillStore, useValue: mockStore },
        { provide: SubmitNewBillUseCase, useValue: mockSubmitNewBill }
      ]
    });

    const facade = TestBed.inject(BillingFacade);

    await facade.createInvoice({
      clientId: '',
      newClientName: 'Alice',
      chantier: '',
      amountTTC: null,
      dueDate: '',
      invoiceNumber: '',
      type: 'Situation',
      paymentMode: 'Virement'
    });

    expect(mockSubmitNewBill.execute).toHaveBeenCalledWith({
      clientMode: 'NEW',
      newClientName: 'Alice',
      amountTTC: 0,
      dueDate: '',
      externalInvoiceReference: '',
      type: 'Situation',
      paymentMode: 'Virement',
      pdfFile: null
    });
    expect(facade.error()).toBeNull();
    expect(mockStore.draftBill()?.clientId).toBe('new-client-id');
  });

  it('should set error state on failure', async () => {
    const mockStore = new MockBillStore();
    const mockSubmitNewBill = {
      execute: vitest.fn().mockResolvedValue(
        failure('ERROR', 'Impossible de créer la facture')
      )
    };

    TestBed.configureTestingModule({
      providers: [
        BillingFacade,
        { provide: BillStore, useValue: mockStore },
        { provide: SubmitNewBillUseCase, useValue: mockSubmitNewBill }
      ]
    });

    const facade = TestBed.inject(BillingFacade);

    await facade.createInvoice({
      clientId: 'c-1',
      newClientName: '',
      amountTTC: null,
      dueDate: '',
      invoiceNumber: '',
      type: 'Situation',
      paymentMode: 'Virement'
    });

    expect(facade.isSubmitting()).toBe(false);
    // facade error state doesn't update until after the timeout and submit finishes
    expect(facade.error()).toBe('Impossible de créer la facture');
    expect(mockStore.draftBill()).toBeNull();
  });

  it('should expose a success signal when invoice creation succeeds', async () => {
    const mockStore = new MockBillStore();
    const mockSubmitNewBill = {
      execute: vitest.fn().mockResolvedValue(
        success(new Bill('b-9', 'F-2026-0099', 'c-9'))
      )
    };

    TestBed.configureTestingModule({
      providers: [
        BillingFacade,
        { provide: BillStore, useValue: mockStore },
        { provide: SubmitNewBillUseCase, useValue: mockSubmitNewBill }
      ]
    });

    const facade = TestBed.inject(BillingFacade);

    expect(facade.isSuccess()).toBe(false);

    await facade.createInvoice({
      clientId: 'c-9',
      newClientName: '',
      chantier: '',
      amountTTC: 1000,
      dueDate: '2026-08-01',
      invoiceNumber: 'FAC-9',
      type: 'Situation',
      paymentMode: 'Virement'
    });

    expect(facade.error()).toBeNull();
    expect(facade.isSuccess()).toBe(true);
  });

  it('should dismiss success signal explicitly', () => {
    const mockStore = new MockBillStore();
    const mockSubmitNewBill = {
      execute: vitest.fn().mockResolvedValue(
        success(new Bill('b-10', 'F-2026-0110', 'c-10'))
      )
    };

    TestBed.configureTestingModule({
      providers: [
        BillingFacade,
        { provide: BillStore, useValue: mockStore },
        { provide: SubmitNewBillUseCase, useValue: mockSubmitNewBill }
      ]
    });

    const facade = TestBed.inject(BillingFacade);
    facade.isSuccess.set(true);

    facade.dismissSuccess();

    expect(facade.isSuccess()).toBe(false);
  });

  it('should persist enriched bill fields in local repository format', async () => {
    const storage = new Map<string, string>();
    const getItemSpy = vitest.spyOn(Storage.prototype, 'getItem').mockImplementation((key: string) => {
      return storage.get(key) ?? null;
    });
    const setItemSpy = vitest.spyOn(Storage.prototype, 'setItem').mockImplementation((key: string, value: string) => {
      storage.set(key, value);
    });

    const { LocalBillRepository } = await import('../../infrastructure/repositories/local-bill.repository');
    const repository = new LocalBillRepository();

    const bill = new Bill('b-2', 'F-2026-0002', 'c-9')
      .setAmountTTC(2100)
      .setDueDate('2026-05-14')
      .setExternalInvoiceReference('EXT-900')
      .setType('Solde')
      .setPaymentMode('Chèque');

    await repository.save(bill);

    const savedPayload = storage.get('btp_bills');
    expect(savedPayload).toBeTruthy();
    if (!savedPayload) {
      getItemSpy.mockRestore();
      setItemSpy.mockRestore();
      return;
    }

    const parsed = JSON.parse(savedPayload);
    expect(parsed).toEqual([
      {
        id: 'b-2',
        reference: 'F-2026-0002',
        clientId: 'c-9',
        status: 'DRAFT',
        amountTTC: 2100,
        dueDate: '2026-05-14',
        externalInvoiceReference: 'EXT-900',
        type: 'Solde',
        paymentMode: 'Chèque'
      }
    ]);

    getItemSpy.mockRestore();
    setItemSpy.mockRestore();
  });
});

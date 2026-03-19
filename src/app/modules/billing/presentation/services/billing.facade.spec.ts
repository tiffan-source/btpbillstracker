import { TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { BillStore, BillViewModel } from '../stores/bill.store';
import { Bill } from '../../domain/entities/bill.entity';
import { SubmitNewBillUseCase } from '../../domain/usecases/submit-new-bill.usecase';
import { BillingFacade } from './billing.facade';
import { success, failure } from '../../../../core/result/result';

class MockBillStore implements BillStore {
  draftBill = signal<BillViewModel | null>(null);

  setDraftBill(bill: Bill): void {
    this.draftBill.set({
      id: bill.id,
      reference: bill.reference,
      clientId: bill.clientId,
      status: bill.status
    });
  }
}

describe('BillingFacade', () => {
  it('should create a bill and update state on success', async () => {
    const mockStore = new MockBillStore();
    const mockSubmitNewBill = {
      execute: vitest.fn().mockResolvedValue(
        success(new Bill('b-1', 'F-2026-0001', 'c-1'))
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
      amountTTC: null,
      dueDate: '',
      invoiceNumber: '',
      type: 'Situation',
      paymentMode: 'Virement',
      scenario: 'standard'
    });
    
    expect(facade.isSubmitting()).toBe(true);

    await promise;

    expect(mockSubmitNewBill.execute).toHaveBeenCalledWith({
      isNewClient: false,
      clientIdOrName: 'c-1'
    });
    expect(facade.isSubmitting()).toBe(false);
    expect(facade.error()).toBeNull();
    expect(mockStore.draftBill()).toEqual({
      id: 'b-1',
      reference: 'F-2026-0001',
      clientId: 'c-1',
      status: 'DRAFT'
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
      paymentMode: 'Virement',
      scenario: 'standard'
    });

    expect(mockSubmitNewBill.execute).toHaveBeenCalledWith({
      isNewClient: true,
      clientIdOrName: 'Alice'
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
      newClientName: ''
    });

    expect(facade.isSubmitting()).toBe(false);
    // facade error state doesn't update until after the timeout and submit finishes
    expect(facade.error()).toBe('Impossible de créer la facture');
    expect(mockStore.draftBill()).toBeNull();
  });
});

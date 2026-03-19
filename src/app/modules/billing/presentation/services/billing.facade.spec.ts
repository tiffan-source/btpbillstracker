import { TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { BillStore, BillViewModel } from '../stores/bill.store';
import { Bill } from '../../domain/entities/bill.entity';
import { CreateDraftBillUseCase } from '../../domain/usecases/create-draft-bill.usecase';
import { BillingFacade } from './billing.facade';
import { success, failure } from '../../../../core/result/result';
import { CreateQuickClientUseCase } from '../../../clients';

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
  it('should create a draft bill and update state on success', async () => {
    const mockStore = new MockBillStore();
    const mockCreateDraftBill = {
      execute: vitest.fn().mockResolvedValue(
        success(new Bill('b-1', 'F-2026-0001', 'c-1'))
      )
    };
    const mockCreateQuickClient = {
      execute: vitest.fn()
    };

    TestBed.configureTestingModule({
      providers: [
        BillingFacade,
        { provide: BillStore, useValue: mockStore },
        { provide: CreateDraftBillUseCase, useValue: mockCreateDraftBill },
        { provide: CreateQuickClientUseCase, useValue: mockCreateQuickClient }
      ]
    });

    const facade = TestBed.inject(BillingFacade);

    expect(facade.isSubmitting()).toBe(false);

    const promise = facade.submitNewBill({ isNewClient: false, clientIdOrName: 'c-1' });
    expect(facade.isSubmitting()).toBe(true);

    await promise;

    expect(mockCreateDraftBill.execute).toHaveBeenCalledWith('c-1');
    expect(facade.isSubmitting()).toBe(false);
    expect(facade.error()).toBeNull();
    expect(mockStore.draftBill()).toEqual({
      id: 'b-1',
      reference: 'F-2026-0001',
      clientId: 'c-1',
      status: 'DRAFT'
    });
  });

  it('should create a new client first if requested, then create draft bill', async () => {
    const mockStore = new MockBillStore();
    const mockCreateDraftBill = {
      execute: vitest.fn().mockResolvedValue(
        success(new Bill('b-1', 'F-2026-0001', 'new-client-id'))
      )
    };
    const mockCreateQuickClient = {
      execute: vitest.fn().mockResolvedValue(
        success({ id: 'new-client-id', name: 'Alice', email: 'alice@example.com' })
      )
    };

    TestBed.configureTestingModule({
      providers: [
        BillingFacade,
        { provide: BillStore, useValue: mockStore },
        { provide: CreateDraftBillUseCase, useValue: mockCreateDraftBill },
        { provide: CreateQuickClientUseCase, useValue: mockCreateQuickClient }
      ]
    });

    const facade = TestBed.inject(BillingFacade);

    await facade.submitNewBill({ 
      isNewClient: true, 
      clientIdOrName: 'Alice', 
      clientEmail: 'alice@example.com' 
    });

    expect(mockCreateQuickClient.execute).toHaveBeenCalledWith({ name: 'Alice', email: 'alice@example.com' });
    expect(mockCreateDraftBill.execute).toHaveBeenCalledWith('new-client-id');
    expect(facade.error()).toBeNull();
    expect(mockStore.draftBill()?.clientId).toBe('new-client-id');
  });

  it('should set error state on failure', async () => {
    const mockStore = new MockBillStore();
    const mockCreateDraftBill = {
      execute: vitest.fn().mockResolvedValue(
        failure('ERROR', 'Impossible de créer la facture')
      )
    };
    const mockCreateQuickClient = {
      execute: vitest.fn()
    };

    TestBed.configureTestingModule({
      providers: [
        BillingFacade,
        { provide: BillStore, useValue: mockStore },
        { provide: CreateDraftBillUseCase, useValue: mockCreateDraftBill },
        { provide: CreateQuickClientUseCase, useValue: mockCreateQuickClient }
      ]
    });

    const facade = TestBed.inject(BillingFacade);

    await facade.submitNewBill({ isNewClient: false, clientIdOrName: 'c-1' });

    expect(facade.isSubmitting()).toBe(false);
    expect(facade.error()).toBe('Impossible de créer la facture');
    expect(mockStore.draftBill()).toBeNull();
  });
});

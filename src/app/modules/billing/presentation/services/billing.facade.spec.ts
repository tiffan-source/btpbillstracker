import { TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { BillStore, BillViewModel } from '../stores/bill.store';
import { Bill } from '../../domain/entities/bill.entity';
import { CreateDraftBillUseCase } from '../../domain/usecases/create-draft-bill.usecase';
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
  it('should create a draft bill and update state on success', async () => {
    const mockStore = new MockBillStore();
    const mockUseCase = {
      execute: vitest.fn().mockResolvedValue(
        success(new Bill('b-1', 'F-2026-0001', 'c-1'))
      )
    };

    TestBed.configureTestingModule({
      providers: [
        BillingFacade,
        { provide: BillStore, useValue: mockStore },
        { provide: CreateDraftBillUseCase, useValue: mockUseCase }
      ]
    });

    const facade = TestBed.inject(BillingFacade);

    expect(facade.isSubmitting()).toBe(false);

    const promise = facade.createDraftBill('c-1');
    expect(facade.isSubmitting()).toBe(true);

    await promise;

    expect(mockUseCase.execute).toHaveBeenCalledWith('c-1');
    expect(facade.isSubmitting()).toBe(false);
    expect(facade.error()).toBeNull();
    expect(mockStore.draftBill()).toEqual({
      id: 'b-1',
      reference: 'F-2026-0001',
      clientId: 'c-1',
      status: 'DRAFT'
    });
  });

  it('should set error state on failure', async () => {
    const mockStore = new MockBillStore();
    const mockUseCase = {
      execute: vitest.fn().mockResolvedValue(
        failure('ERROR', 'Impossible de créer la facture')
      )
    };

    TestBed.configureTestingModule({
      providers: [
        BillingFacade,
        { provide: BillStore, useValue: mockStore },
        { provide: CreateDraftBillUseCase, useValue: mockUseCase }
      ]
    });

    const facade = TestBed.inject(BillingFacade);

    await facade.createDraftBill('c-1');

    expect(facade.isSubmitting()).toBe(false);
    expect(facade.error()).toBe('Impossible de créer la facture');
    expect(mockStore.draftBill()).toBeNull();
  });
});

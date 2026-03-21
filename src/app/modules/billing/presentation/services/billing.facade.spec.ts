import { TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { BillStore, BillViewModel } from '../stores/bill.store';
import { BillPdfMemoryFile } from '../models/bill-pdf-memory-file.model';
import { Bill } from '../../domain/entities/bill.entity';
import { CreateEnrichedBillUseCase } from '../../domain/usecases/create-enriched-bill.usecase';
import { ListUserBillsUseCase } from '../../domain/usecases/list-user-bills.usecase';
import { ListClientsUseCase } from '../../../clients';
import { ListChantiersUseCase } from '../../../chantiers';
import { BillingFacade } from './billing.facade';
import { success, failure } from '../../../../core/result/result';
import { ReminderAssociationRepository } from '../../../reminders/domain/ports/reminder-association.repository';
import { ListReminderScenariosUseCase } from '../../../reminders/domain/usecases/list-reminder-scenarios.usecase';

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

const defaultListUserBillsUseCase = {
  execute: vitest.fn().mockResolvedValue(success([]))
};

describe('BillingFacade', () => {
  const defaultReminderUseCase = {
    execute: vitest.fn().mockResolvedValue(success([]))
  };

  it('loads and sorts persisted clients A-Z for new bill selector', async () => {
    const mockStore = new MockBillStore();
    const listUserBillsUseCase = {
      execute: vitest.fn().mockResolvedValue(
        success([
          new Bill('b-1', 'F-1', 'c-1'),
          new Bill('b-2', 'F-2', 'c-2')
        ])
      )
    };
    const listClientsUseCase = {
      execute: vitest.fn().mockResolvedValue(success([
        { id: 'c-1', name: 'Zed Dupont' },
        { id: 'c-2', name: 'Alice Martin' }
      ]))
    };

    TestBed.configureTestingModule({
      providers: [
        BillingFacade,
        { provide: BillStore, useValue: mockStore },
        { provide: CreateEnrichedBillUseCase, useValue: { execute: vitest.fn() } },
        { provide: ReminderAssociationRepository, useValue: { save: vitest.fn(), findByBillId: vitest.fn() } },
        { provide: ListClientsUseCase, useValue: listClientsUseCase },
        { provide: ListChantiersUseCase, useValue: { execute: vitest.fn().mockResolvedValue(success([])) } },
        { provide: ListUserBillsUseCase, useValue: listUserBillsUseCase },
        { provide: ListReminderScenariosUseCase, useValue: defaultReminderUseCase }
      ]
    });

    const facade = TestBed.inject(BillingFacade);
    await facade.loadClients();

    expect(facade.clients()).toEqual([
      { id: 'c-2', name: 'Alice Martin' },
      { id: 'c-1', name: 'Zed Dupont' }
    ]);
  });

  it('filters selectable clients to only those linked to user invoices', async () => {
    const mockStore = new MockBillStore();
    const listClientsUseCase = {
      execute: vitest.fn().mockResolvedValue(
        success([
          { id: 'c-1', name: 'Alice Martin' },
          { id: 'c-2', name: 'Benoit Dossou' },
          { id: 'c-3', name: 'Client Hors Facture' }
        ])
      )
    };
    const listUserBillsUseCase = {
      execute: vitest.fn().mockResolvedValue(
        success([
          new Bill('b-1', 'F-1', 'c-2'),
          new Bill('b-2', 'F-2', 'c-1')
        ])
      )
    };

    TestBed.configureTestingModule({
      providers: [
        BillingFacade,
        { provide: BillStore, useValue: mockStore },
        { provide: CreateEnrichedBillUseCase, useValue: { execute: vitest.fn() } },
        { provide: ReminderAssociationRepository, useValue: { save: vitest.fn(), findByBillId: vitest.fn() } },
        { provide: ListClientsUseCase, useValue: listClientsUseCase },
        { provide: ListChantiersUseCase, useValue: { execute: vitest.fn().mockResolvedValue(success([])) } },
        { provide: ListUserBillsUseCase, useValue: listUserBillsUseCase },
        { provide: ListReminderScenariosUseCase, useValue: defaultReminderUseCase }
      ]
    });

    const facade = TestBed.inject(BillingFacade);
    await facade.loadClients();

    expect(facade.clients()).toEqual([
      { id: 'c-1', name: 'Alice Martin' },
      { id: 'c-2', name: 'Benoit Dossou' }
    ]);
  });

  it('loads and sorts chantier options from user linked invoices', async () => {
    const mockStore = new MockBillStore();
    const chantierAlpha = new Bill('b-a', 'F-A', 'c-1').setChantierId('chantier-z');
    const chantierBeta = new Bill('b-b', 'F-B', 'c-1').setChantierId('chantier-a');
    const duplicated = new Bill('b-c', 'F-C', 'c-1').setChantierId('chantier-a');
    const noChantier = new Bill('b-d', 'F-D', 'c-1');
    const listUserBillsUseCase = {
      execute: vitest.fn().mockResolvedValue(success([chantierAlpha, chantierBeta, duplicated, noChantier]))
    };
    const listChantiersUseCase = {
      execute: vitest.fn().mockResolvedValue(
        success([
          { id: 'chantier-z', name: 'Zeta Lot' },
          { id: 'chantier-a', name: 'Alpha Lot' },
          { id: 'chantier-x', name: 'Hors Facture' }
        ])
      )
    };

    TestBed.configureTestingModule({
      providers: [
        BillingFacade,
        { provide: BillStore, useValue: mockStore },
        { provide: CreateEnrichedBillUseCase, useValue: { execute: vitest.fn() } },
        { provide: ReminderAssociationRepository, useValue: { save: vitest.fn(), findByBillId: vitest.fn() } },
        { provide: ListClientsUseCase, useValue: { execute: vitest.fn().mockResolvedValue(success([])) } },
        { provide: ListChantiersUseCase, useValue: listChantiersUseCase },
        { provide: ListUserBillsUseCase, useValue: listUserBillsUseCase },
        { provide: ListReminderScenariosUseCase, useValue: defaultReminderUseCase }
      ]
    });

    const facade = TestBed.inject(BillingFacade);
    await facade.loadChantiers();

    expect(facade.chantiers()).toEqual([
      { id: 'chantier-a', name: 'Alpha Lot' },
      { id: 'chantier-z', name: 'Zeta Lot' }
    ]);
    expect(facade.chantiersLoadError()).toBeNull();
  });

  it('blocks invoice creation when selected client is outside authorized invoice-linked set', async () => {
    const mockStore = new MockBillStore();
    const createEnrichedBillUseCase = {
      execute: vitest.fn()
    };
    const listClientsUseCase = {
      execute: vitest.fn().mockResolvedValue(
        success([
          { id: 'c-1', name: 'Client Autorise' },
          { id: 'c-9', name: 'Client Non Autorise' }
        ])
      )
    };
    const listUserBillsUseCase = {
      execute: vitest.fn().mockResolvedValue(success([new Bill('b-1', 'F-1', 'c-1')]))
    };

    TestBed.configureTestingModule({
      providers: [
        BillingFacade,
        { provide: BillStore, useValue: mockStore },
        { provide: CreateEnrichedBillUseCase, useValue: createEnrichedBillUseCase },
        { provide: ReminderAssociationRepository, useValue: { save: vitest.fn(), findByBillId: vitest.fn() } },
        { provide: ListClientsUseCase, useValue: listClientsUseCase },
        { provide: ListChantiersUseCase, useValue: { execute: vitest.fn().mockResolvedValue(success([])) } },
        { provide: ListUserBillsUseCase, useValue: listUserBillsUseCase },
        { provide: ListReminderScenariosUseCase, useValue: defaultReminderUseCase }
      ]
    });

    const facade = TestBed.inject(BillingFacade);
    await facade.loadClients();
    await facade.requestInvoiceCreation({
      clientId: 'c-9',
      newClientName: '',
      chantier: '',
      amountTTC: 250,
      dueDate: '2026-12-11',
      invoiceNumber: 'FAC-UNAUTH',
      type: 'Situation',
      paymentMode: 'Virement',
      remindersAutoEnabled: false,
      reminderScenarioId: ''
    });

    expect(createEnrichedBillUseCase.execute).not.toHaveBeenCalled();
    expect(facade.error()).toBe('Le client sélectionné n’est pas autorisé pour votre périmètre facture.');
    expect(facade.isSuccess()).toBe(false);
  });

  it('keeps bill creation available when client loading fails', async () => {
    const mockStore = new MockBillStore();
    const listClientsUseCase = {
      execute: vitest.fn().mockResolvedValue(failure('CLIENT_PERSISTENCE_ERROR', 'Impossible de charger les clients'))
    };

    TestBed.configureTestingModule({
      providers: [
        BillingFacade,
        { provide: BillStore, useValue: mockStore },
        { provide: CreateEnrichedBillUseCase, useValue: { execute: vitest.fn() } },
        { provide: ReminderAssociationRepository, useValue: { save: vitest.fn(), findByBillId: vitest.fn() } },
        { provide: ListClientsUseCase, useValue: listClientsUseCase },
        { provide: ListChantiersUseCase, useValue: { execute: vitest.fn().mockResolvedValue(success([])) } },
        { provide: ListUserBillsUseCase, useValue: defaultListUserBillsUseCase },
        { provide: ListReminderScenariosUseCase, useValue: defaultReminderUseCase }
      ]
    });

    const facade = TestBed.inject(BillingFacade);
    await facade.loadClients();

    expect(facade.clientsLoadError()).toBe('Impossible de charger les clients');
    expect(facade.clients()).toEqual([]);
  });

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
        { provide: CreateEnrichedBillUseCase, useValue: mockSubmitNewBill },
        { provide: ReminderAssociationRepository, useValue: { save: vitest.fn(), findByBillId: vitest.fn() } },
        { provide: ListClientsUseCase, useValue: { execute: vitest.fn().mockResolvedValue(success([])) } },
        { provide: ListChantiersUseCase, useValue: { execute: vitest.fn().mockResolvedValue(success([])) } },
        { provide: ListUserBillsUseCase, useValue: defaultListUserBillsUseCase },
        { provide: ListReminderScenariosUseCase, useValue: defaultReminderUseCase }
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
      isNewClient: false,
      clientIdOrName: 'c-1',
      amountTTC: 1400,
      dueDate: '2026-05-01',
      externalInvoiceReference: 'EXT-77',
      type: 'Situation',
      paymentMode: 'Virement',
      chantierId: '',
      remindersAutoEnabled: false,
      reminderScenarioId: ''
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

  it('refreshes clients list after successful invoice creation', async () => {
    const mockStore = new MockBillStore();
    const listUserBillsUseCase = {
      execute: vitest
        .fn()
        .mockResolvedValue(
          success([
            new Bill('b-90', 'F-90', 'c-9'),
            new Bill('b-91', 'F-91', 'c-1')
          ])
        )
    };
    const listClientsUseCase = {
      execute: vitest
        .fn()
        .mockResolvedValueOnce(success([{ id: 'c-9', name: 'Zed Client' }]))
        .mockResolvedValueOnce(
          success([
            { id: 'c-1', name: 'Alice Client' },
            { id: 'c-9', name: 'Zed Client' }
          ])
        )
    };
    const mockSubmitNewBill = {
      execute: vitest.fn().mockResolvedValue(success(new Bill('b-12', 'F-2026-0012', 'c-1')))
    };

    TestBed.configureTestingModule({
      providers: [
        BillingFacade,
        { provide: BillStore, useValue: mockStore },
        { provide: CreateEnrichedBillUseCase, useValue: mockSubmitNewBill },
        { provide: ReminderAssociationRepository, useValue: { save: vitest.fn(), findByBillId: vitest.fn() } },
        { provide: ListClientsUseCase, useValue: listClientsUseCase },
        { provide: ListChantiersUseCase, useValue: { execute: vitest.fn().mockResolvedValue(success([])) } },
        { provide: ListUserBillsUseCase, useValue: listUserBillsUseCase },
        { provide: ListReminderScenariosUseCase, useValue: { execute: vitest.fn().mockResolvedValue(success([])) } }
      ]
    });

    const facade = TestBed.inject(BillingFacade);
    await facade.loadClients();
    expect(facade.clients()).toEqual([{ id: 'c-9', name: 'Zed Client' }]);

    await facade.createInvoice({
      clientId: '',
      newClientName: 'Alice Client',
      chantier: '',
      amountTTC: 300,
      dueDate: '2026-10-01',
      invoiceNumber: 'FAC-12',
      type: 'Situation',
      paymentMode: 'Virement',
      remindersAutoEnabled: false,
      reminderScenarioId: ''
    });

    expect(listClientsUseCase.execute).toHaveBeenCalledTimes(2);
    expect(facade.clients()).toEqual([
      { id: 'c-1', name: 'Alice Client' },
      { id: 'c-9', name: 'Zed Client' }
    ]);
  });

  it('opens duplicate prompt when new client name matches existing client', async () => {
    const mockStore = new MockBillStore();
    const listUserBillsUseCase = {
      execute: vitest.fn().mockResolvedValue(success([new Bill('b-77', 'F-77', 'c-1')]))
    };
    const listClientsUseCase = {
      execute: vitest
        .fn()
        .mockResolvedValue(success([{ id: 'c-1', name: 'Alice Martin' }]))
    };
    const mockSubmitNewBill = { execute: vitest.fn() };

    TestBed.configureTestingModule({
      providers: [
        BillingFacade,
        { provide: BillStore, useValue: mockStore },
        { provide: CreateEnrichedBillUseCase, useValue: mockSubmitNewBill },
        { provide: ReminderAssociationRepository, useValue: { save: vitest.fn(), findByBillId: vitest.fn() } },
        { provide: ListClientsUseCase, useValue: listClientsUseCase },
        { provide: ListChantiersUseCase, useValue: { execute: vitest.fn().mockResolvedValue(success([])) } },
        { provide: ListUserBillsUseCase, useValue: listUserBillsUseCase },
        { provide: ListReminderScenariosUseCase, useValue: { execute: vitest.fn().mockResolvedValue(success([])) } }
      ]
    });

    const facade = TestBed.inject(BillingFacade);
    await facade.loadClients();

    await facade.requestInvoiceCreation({
      clientId: '',
      newClientName: ' alice   martin ',
      chantier: '',
      amountTTC: 100,
      dueDate: '2026-10-10',
      invoiceNumber: 'FAC-77',
      type: 'Situation',
      paymentMode: 'Virement',
      remindersAutoEnabled: false,
      reminderScenarioId: ''
    });

    expect(mockSubmitNewBill.execute).not.toHaveBeenCalled();
    expect(facade.duplicateClientPrompt()).toEqual({
      existingClientId: 'c-1',
      existingClientName: 'Alice Martin',
      pendingForm: {
        clientId: '',
        newClientName: ' alice   martin ',
        chantier: '',
        amountTTC: 100,
        dueDate: '2026-10-10',
        invoiceNumber: 'FAC-77',
        type: 'Situation',
        paymentMode: 'Virement',
        remindersAutoEnabled: false,
        reminderScenarioId: ''
      }
    });
  });

  it('uses existing client when duplicate prompt is confirmed', async () => {
    const mockStore = new MockBillStore();
    const listUserBillsUseCase = {
      execute: vitest.fn().mockResolvedValue(success([new Bill('b-88', 'F-88', 'c-1')]))
    };
    const listClientsUseCase = {
      execute: vitest
        .fn()
        .mockResolvedValueOnce(success([{ id: 'c-1', name: 'Alice Martin' }]))
        .mockResolvedValueOnce(success([{ id: 'c-1', name: 'Alice Martin' }]))
    };
    const mockSubmitNewBill = {
      execute: vitest.fn().mockResolvedValue(success(new Bill('b-88', 'F-2026-0088', 'c-1')))
    };

    TestBed.configureTestingModule({
      providers: [
        BillingFacade,
        { provide: BillStore, useValue: mockStore },
        { provide: CreateEnrichedBillUseCase, useValue: mockSubmitNewBill },
        { provide: ReminderAssociationRepository, useValue: { save: vitest.fn(), findByBillId: vitest.fn() } },
        { provide: ListClientsUseCase, useValue: listClientsUseCase },
        { provide: ListChantiersUseCase, useValue: { execute: vitest.fn().mockResolvedValue(success([])) } },
        { provide: ListUserBillsUseCase, useValue: listUserBillsUseCase },
        { provide: ListReminderScenariosUseCase, useValue: { execute: vitest.fn().mockResolvedValue(success([])) } }
      ]
    });

    const facade = TestBed.inject(BillingFacade);
    await facade.loadClients();
    await facade.requestInvoiceCreation({
      clientId: '',
      newClientName: 'Alice Martin',
      chantier: '',
      amountTTC: 300,
      dueDate: '2026-10-01',
      invoiceNumber: 'FAC-88',
      type: 'Situation',
      paymentMode: 'Virement',
      remindersAutoEnabled: false,
      reminderScenarioId: ''
    });

    await facade.confirmUseExistingClient();

    expect(facade.duplicateClientPrompt()).toBeNull();
    expect(mockSubmitNewBill.execute).toHaveBeenCalledWith({
      isNewClient: false,
      clientIdOrName: 'c-1',
      amountTTC: 300,
      dueDate: '2026-10-01',
      externalInvoiceReference: 'FAC-88',
      type: 'Situation',
      paymentMode: 'Virement',
      chantierId: '',
      remindersAutoEnabled: false,
      reminderScenarioId: ''
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
        { provide: CreateEnrichedBillUseCase, useValue: mockSubmitNewBill },
        { provide: ReminderAssociationRepository, useValue: { save: vitest.fn(), findByBillId: vitest.fn() } },
        { provide: ListClientsUseCase, useValue: { execute: vitest.fn().mockResolvedValue(success([])) } },
        { provide: ListChantiersUseCase, useValue: { execute: vitest.fn().mockResolvedValue(success([])) } },
        { provide: ListUserBillsUseCase, useValue: defaultListUserBillsUseCase },
        { provide: ListReminderScenariosUseCase, useValue: { execute: vitest.fn().mockResolvedValue(success([])) } }
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
      remindersAutoEnabled: false,
      reminderScenarioId: ''
    });

    expect(mockSubmitNewBill.execute).toHaveBeenCalledWith({
      isNewClient: true,
      clientIdOrName: 'Alice',
      amountTTC: 0,
      dueDate: '',
      externalInvoiceReference: '',
      type: 'Situation',
      paymentMode: 'Virement',
      chantierId: '',
      remindersAutoEnabled: false,
      reminderScenarioId: ''
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
        { provide: CreateEnrichedBillUseCase, useValue: mockSubmitNewBill },
        { provide: ReminderAssociationRepository, useValue: { save: vitest.fn(), findByBillId: vitest.fn() } },
        { provide: ListClientsUseCase, useValue: { execute: vitest.fn().mockResolvedValue(success([])) } },
        { provide: ListChantiersUseCase, useValue: { execute: vitest.fn().mockResolvedValue(success([])) } },
        { provide: ListUserBillsUseCase, useValue: defaultListUserBillsUseCase },
        { provide: ListReminderScenariosUseCase, useValue: { execute: vitest.fn().mockResolvedValue(success([])) } }
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
      paymentMode: 'Virement',
      remindersAutoEnabled: false,
      reminderScenarioId: ''
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
        { provide: CreateEnrichedBillUseCase, useValue: mockSubmitNewBill },
        { provide: ReminderAssociationRepository, useValue: { save: vitest.fn(), findByBillId: vitest.fn() } },
        { provide: ListClientsUseCase, useValue: { execute: vitest.fn().mockResolvedValue(success([])) } },
        { provide: ListChantiersUseCase, useValue: { execute: vitest.fn().mockResolvedValue(success([])) } },
        { provide: ListUserBillsUseCase, useValue: defaultListUserBillsUseCase },
        { provide: ListReminderScenariosUseCase, useValue: { execute: vitest.fn().mockResolvedValue(success([])) } }
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
      paymentMode: 'Virement',
      remindersAutoEnabled: false,
      reminderScenarioId: ''
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
        { provide: CreateEnrichedBillUseCase, useValue: mockSubmitNewBill },
        { provide: ReminderAssociationRepository, useValue: { save: vitest.fn(), findByBillId: vitest.fn() } },
        { provide: ListClientsUseCase, useValue: { execute: vitest.fn().mockResolvedValue(success([])) } },
        { provide: ListChantiersUseCase, useValue: { execute: vitest.fn().mockResolvedValue(success([])) } },
        { provide: ListUserBillsUseCase, useValue: defaultListUserBillsUseCase },
        { provide: ListReminderScenariosUseCase, useValue: { execute: vitest.fn().mockResolvedValue(success([])) } }
      ]
    });

    const facade = TestBed.inject(BillingFacade);
    facade.isSuccess.set(true);

    facade.dismissSuccess();

    expect(facade.isSuccess()).toBe(false);
  });



  it('persists reminder association when reminders are enabled', async () => {
    const mockStore = new MockBillStore();
    const mockAssociationRepository = { save: vitest.fn().mockResolvedValue(undefined), findByBillId: vitest.fn() };
    const bill = new Bill('b-4', 'F-2026-0400', 'c-4')
      .setAmountTTC(1000)
      .setDueDate('2026-11-10')
      .setExternalInvoiceReference('FAC-400')
      .setType('Situation')
      .setPaymentMode('Virement')
      .configureReminder(true, 'standard-reminder-scenario');
    const mockSubmitNewBill = {
      execute: vitest.fn().mockResolvedValue(success(bill))
    };

    TestBed.configureTestingModule({
      providers: [
        BillingFacade,
        { provide: BillStore, useValue: mockStore },
        { provide: CreateEnrichedBillUseCase, useValue: mockSubmitNewBill },
        { provide: ReminderAssociationRepository, useValue: mockAssociationRepository },
        { provide: ListClientsUseCase, useValue: { execute: vitest.fn().mockResolvedValue(success([])) } },
        { provide: ListChantiersUseCase, useValue: { execute: vitest.fn().mockResolvedValue(success([])) } },
        { provide: ListUserBillsUseCase, useValue: defaultListUserBillsUseCase },
        { provide: ListReminderScenariosUseCase, useValue: { execute: vitest.fn().mockResolvedValue(success([])) } }
      ]
    });

    const facade = TestBed.inject(BillingFacade);

    await facade.createInvoice({
      clientId: 'c-4',
      newClientName: '',
      chantier: '',
      amountTTC: 1000,
      dueDate: '2026-11-10',
      invoiceNumber: 'FAC-400',
      type: 'Situation',
      paymentMode: 'Virement',
      remindersAutoEnabled: true,
      reminderScenarioId: 'standard-reminder-scenario'
    });

    expect(mockAssociationRepository.save).toHaveBeenCalledTimes(1);
    expect(facade.error()).toBeNull();
    expect(facade.isSuccess()).toBe(true);
  });

  it('fails globally when reminder association persistence fails', async () => {
    const mockStore = new MockBillStore();
    const mockAssociationRepository = { save: vitest.fn().mockRejectedValue(new Error('storage fail')), findByBillId: vitest.fn() };
    const bill = new Bill('b-5', 'F-2026-0500', 'c-5')
      .setAmountTTC(1200)
      .setDueDate('2026-12-10')
      .setExternalInvoiceReference('FAC-500')
      .setType('Situation')
      .setPaymentMode('Virement')
      .configureReminder(true, 'standard-reminder-scenario');
    const mockSubmitNewBill = {
      execute: vitest.fn().mockResolvedValue(success(bill))
    };

    TestBed.configureTestingModule({
      providers: [
        BillingFacade,
        { provide: BillStore, useValue: mockStore },
        { provide: CreateEnrichedBillUseCase, useValue: mockSubmitNewBill },
        { provide: ReminderAssociationRepository, useValue: mockAssociationRepository },
        { provide: ListClientsUseCase, useValue: { execute: vitest.fn().mockResolvedValue(success([])) } },
        { provide: ListChantiersUseCase, useValue: { execute: vitest.fn().mockResolvedValue(success([])) } },
        { provide: ListUserBillsUseCase, useValue: defaultListUserBillsUseCase },
        { provide: ListReminderScenariosUseCase, useValue: { execute: vitest.fn().mockResolvedValue(success([])) } }
      ]
    });

    const facade = TestBed.inject(BillingFacade);

    await facade.createInvoice({
      clientId: 'c-5',
      newClientName: '',
      chantier: '',
      amountTTC: 1200,
      dueDate: '2026-12-10',
      invoiceNumber: 'FAC-500',
      type: 'Situation',
      paymentMode: 'Virement',
      remindersAutoEnabled: true,
      reminderScenarioId: 'standard-reminder-scenario'
    });

    expect(facade.isSuccess()).toBe(false);
    expect(facade.error()).toBe("La facture a été créée mais l'association de relance a échoué.");
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
    const repository = new LocalBillRepository({
      getCurrentUser: () => ({ uid: 'owner-1' })
    } as never);

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
        ownerUid: 'owner-1',
        reference: 'F-2026-0002',
        clientId: 'c-9',
        status: 'DRAFT',
        amountTTC: 2100,
        dueDate: '2026-05-14',
         externalInvoiceReference: 'EXT-900',
         type: 'Solde',
         paymentMode: 'Chèque',
         chantierId: undefined
       }
     ]);

    getItemSpy.mockRestore();
    setItemSpy.mockRestore();
  });
});

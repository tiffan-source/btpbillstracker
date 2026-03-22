import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { Bill } from '../../domain/entities/bill.entity';
import { BillNotFoundError } from '../../domain/errors/bill-not-found.error';
import { BillRepository } from '../../domain/ports/bill.repository';
import { ListClientsUseCase } from '../../../clients';
import { ListChantiersUseCase } from '../../../chantiers';
import { ListUserBillsUseCase } from '../../domain/usecases/list-user-bills.usecase';
import { UpdateEnrichedBillUseCase } from '../../domain/usecases/update-enriched-bill.usecase';
import { ClientDisplayResolver } from './client-display.resolver';
import { DashboardFacade } from './dashboard.facade';
import { ResolveChantierIdPort } from '../../domain/ports/resolve-chantier-id.port';
import { ClientProviderPort } from '../../domain/ports/client-provider.port';

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

  async listByOwner(userId: string): Promise<Bill[]> {
    return this.list();
  }

  async update(bill: Bill): Promise<void> {
    if (!this.bills.has(bill.id)) {
      throw new BillNotFoundError(undefined, { billId: bill.id });
    }

    this.bills.set(bill.id, bill);
  }
}

describe('DashboardFacade', () => {
  const flushFacadeEffects = async (): Promise<void> => {
    await Promise.resolve();
    await Promise.resolve();
  };

  const createListUserBillsUseCase = (repository: BillRepository): ListUserBillsUseCase =>
    ({
      execute: vi.fn().mockImplementation(async () => {
        const bills = await repository.listByOwner('owner-1');
        return { success: true, data: bills };
      })
    }) as unknown as ListUserBillsUseCase;

  const createRouter = (): Router =>
    ({
      navigateByUrl: vi.fn().mockResolvedValue(true)
    }) as unknown as Router;

  const createDisplayResolver = (): ClientDisplayResolver =>
    ({
      resolve: vi.fn().mockImplementation((profile: { id: string }) => ({
        label: profile.id === 'client-1' ? 'Alice Martin' : profile.id === 'client-2' ? 'Bob Dupont' : 'Client inconnu',
        showsIncompleteIndicator: profile.id !== 'client-1'
      }))
    }) as unknown as ClientDisplayResolver;

  const createListClientsUseCase = (): ListClientsUseCase =>
    ({
      execute: vi.fn().mockResolvedValue(
        {
          success: true,
          data: [
            { id: 'client-1', name: 'Alice Martin', firstName: 'Alice', lastName: 'Martin' },
            { id: 'client-2', name: 'Bob Dupont', firstName: 'Bob', lastName: 'Dupont' }
          ]
        }
      )
    }) as unknown as ListClientsUseCase;

  const createListChantiersUseCase = (): ListChantiersUseCase =>
    ({
      execute: vi.fn().mockResolvedValue({
        success: true,
        data: [
          { id: 'ch-1', name: 'Cadjehoun' },
          { id: 'ch-2', name: 'Akpakpa' },
          { id: 'ch-x', name: 'Hors scope' }
        ]
      })
    }) as unknown as ListChantiersUseCase;

  const createResolveChantierIdPort = (): ResolveChantierIdPort =>
    ({
      execute: vi.fn().mockImplementation(async ({ chantierName }: { chantierName: string }) => ({
        success: true,
        data: `created-${chantierName}`
      }))
    }) as unknown as ResolveChantierIdPort;

  const createClientProviderPort = (): ClientProviderPort =>
    ({
      resolveClient: vi.fn().mockImplementation(async ({ isNewClient, clientIdOrName }) => ({
        success: true,
        data: isNewClient ? `created-${clientIdOrName}` : clientIdOrName
      }))
    }) as unknown as ClientProviderPort;

  it('should expose persisted invoices and relance placeholder', async () => {
    const repository = new InMemoryBillRepository();
    TestBed.configureTestingModule({
      providers: [
        DashboardFacade,
        { provide: BillRepository, useValue: repository },
        { provide: ClientDisplayResolver, useValue: createDisplayResolver() },
        { provide: ListClientsUseCase, useValue: createListClientsUseCase() },
        { provide: ListChantiersUseCase, useValue: createListChantiersUseCase() },
        { provide: ResolveChantierIdPort, useValue: createResolveChantierIdPort() },
        { provide: ClientProviderPort, useValue: createClientProviderPort() },
        { provide: ListUserBillsUseCase, useValue: createListUserBillsUseCase(repository) },
        { provide: Router, useValue: createRouter() },
        {
          provide: UpdateEnrichedBillUseCase,
          useFactory: (repo: BillRepository) => new UpdateEnrichedBillUseCase(repo),
          deps: [BillRepository]
        }
      ]
    });

    const facade = TestBed.inject(DashboardFacade);
    await flushFacadeEffects();
    const invoices = facade.invoices();

    expect(invoices.length).toBe(0);
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
        { provide: ClientDisplayResolver, useValue: createDisplayResolver() },
        { provide: ListClientsUseCase, useValue: createListClientsUseCase() },
        { provide: ListChantiersUseCase, useValue: createListChantiersUseCase() },
        { provide: ResolveChantierIdPort, useValue: createResolveChantierIdPort() },
        { provide: ClientProviderPort, useValue: createClientProviderPort() },
        { provide: ListUserBillsUseCase, useValue: createListUserBillsUseCase(repository) },
        { provide: Router, useValue: createRouter() },
        {
          provide: UpdateEnrichedBillUseCase,
          useFactory: (repo: BillRepository) => new UpdateEnrichedBillUseCase(repo),
          deps: [BillRepository]
        }
      ]
    });

    const facade = TestBed.inject(DashboardFacade);
    await flushFacadeEffects();

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
        { provide: ClientDisplayResolver, useValue: createDisplayResolver() },
        { provide: ListClientsUseCase, useValue: createListClientsUseCase() },
        { provide: ListChantiersUseCase, useValue: createListChantiersUseCase() },
        { provide: ResolveChantierIdPort, useValue: createResolveChantierIdPort() },
        { provide: ClientProviderPort, useValue: createClientProviderPort() },
        { provide: ListUserBillsUseCase, useValue: createListUserBillsUseCase(repository) },
        { provide: Router, useValue: createRouter() },
        {
          provide: UpdateEnrichedBillUseCase,
          useFactory: (repo: BillRepository) => new UpdateEnrichedBillUseCase(repo),
          deps: [BillRepository]
        }
      ]
    });
    const facade = TestBed.inject(DashboardFacade);
    await flushFacadeEffects();
    await facade.openEditInvoice('b-2');

    await facade.submitEditedInvoice({
      id: 'b-2',
      reference: 'F-2026-0101',
      clientId: 'client-2',
      newClientName: '',
      chantierId: 'ch-2',
      chantierName: '',
      shouldCreateChantier: false,
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
    expect(updatedInvoice?.client).toBe('Bob Dupont');
    expect(updatedInvoice?.showsIncompleteClientIndicator).toBe(true);
  });

  it('rejects edit submit when selected existing client is outside authorized list', async () => {
    const persisted = new Bill('b-2b', 'F-2026-0101B', 'client-2')
      .setAmountTTC(510)
      .setDueDate('2099-12-30')
      .setExternalInvoiceReference('EXT-2B')
      .setType('Situation')
      .setPaymentMode('Virement')
      .setStatus('VALIDATED');
    const repository = new InMemoryBillRepository([persisted]);

    TestBed.configureTestingModule({
      providers: [
        DashboardFacade,
        { provide: BillRepository, useValue: repository },
        { provide: ClientDisplayResolver, useValue: createDisplayResolver() },
        { provide: ListClientsUseCase, useValue: createListClientsUseCase() },
        { provide: ListChantiersUseCase, useValue: createListChantiersUseCase() },
        { provide: ResolveChantierIdPort, useValue: createResolveChantierIdPort() },
        { provide: ClientProviderPort, useValue: createClientProviderPort() },
        { provide: ListUserBillsUseCase, useValue: createListUserBillsUseCase(repository) },
        { provide: Router, useValue: createRouter() },
        {
          provide: UpdateEnrichedBillUseCase,
          useFactory: (repo: BillRepository) => new UpdateEnrichedBillUseCase(repo),
          deps: [BillRepository]
        }
      ]
    });

    const facade = TestBed.inject(DashboardFacade);
    await flushFacadeEffects();
    await facade.openEditInvoice('b-2b');

    await facade.submitEditedInvoice({
      id: 'b-2b',
      reference: 'F-2026-0101B',
      clientId: 'client-outside-scope',
      newClientName: '',
      chantierId: 'ch-2',
      chantierName: '',
      shouldCreateChantier: false,
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
    expect(facade.editError()).toContain('client');
  });

  it('exposes chantier options only for chantier ids linked to user invoices', async () => {
    const persisted = [
      new Bill('b-1', 'F-2026-0100', 'client-1').setChantierId('ch-2'),
      new Bill('b-2', 'F-2026-0101', 'client-2').setChantierId('ch-1'),
      new Bill('b-3', 'F-2026-0102', 'client-2')
    ];
    const listUserBillsUseCase = {
      execute: vi.fn().mockResolvedValue({ success: true, data: persisted })
    } as unknown as ListUserBillsUseCase;
    const repository = new InMemoryBillRepository(persisted);

    TestBed.configureTestingModule({
      providers: [
        DashboardFacade,
        { provide: BillRepository, useValue: repository },
        { provide: ClientDisplayResolver, useValue: createDisplayResolver() },
        { provide: ListClientsUseCase, useValue: createListClientsUseCase() },
        { provide: ListChantiersUseCase, useValue: createListChantiersUseCase() },
        { provide: ResolveChantierIdPort, useValue: createResolveChantierIdPort() },
        { provide: ClientProviderPort, useValue: createClientProviderPort() },
        { provide: ListUserBillsUseCase, useValue: listUserBillsUseCase },
        { provide: Router, useValue: createRouter() },
        {
          provide: UpdateEnrichedBillUseCase,
          useFactory: (repo: BillRepository) => new UpdateEnrichedBillUseCase(repo),
          deps: [BillRepository]
        }
      ]
    });

    const facade = TestBed.inject(DashboardFacade);
    await flushFacadeEffects();

    expect(facade.chantiers()).toEqual([
      { id: 'ch-2', name: 'Akpakpa' },
      { id: 'ch-1', name: 'Cadjehoun' }
    ]);
  });

  it('keeps modal open and exposes error when update fails', async () => {
    const repository = new InMemoryBillRepository();
    TestBed.configureTestingModule({
      providers: [
        DashboardFacade,
        { provide: BillRepository, useValue: repository },
        { provide: ClientDisplayResolver, useValue: createDisplayResolver() },
        { provide: ListClientsUseCase, useValue: createListClientsUseCase() },
        { provide: ListChantiersUseCase, useValue: createListChantiersUseCase() },
        { provide: ResolveChantierIdPort, useValue: createResolveChantierIdPort() },
        { provide: ClientProviderPort, useValue: createClientProviderPort() },
        { provide: ListUserBillsUseCase, useValue: createListUserBillsUseCase(repository) },
        { provide: Router, useValue: createRouter() },
        {
          provide: UpdateEnrichedBillUseCase,
          useFactory: (repo: BillRepository) => new UpdateEnrichedBillUseCase(repo),
          deps: [BillRepository]
        }
      ]
    });
    const facade = TestBed.inject(DashboardFacade);
    await flushFacadeEffects();

    facade.isEditModalOpen.set(true);

    await facade.submitEditedInvoice({
      id: 'missing',
      reference: 'F-2026-9999',
      clientId: 'client-2',
      newClientName: '',
      chantierId: '',
      chantierName: '',
      shouldCreateChantier: false,
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

  it('does not close edit modal while a submit is in progress', () => {
    const repository = new InMemoryBillRepository();
    TestBed.configureTestingModule({
      providers: [
        DashboardFacade,
        { provide: BillRepository, useValue: repository },
        { provide: ClientDisplayResolver, useValue: createDisplayResolver() },
        { provide: ListClientsUseCase, useValue: createListClientsUseCase() },
        { provide: ListChantiersUseCase, useValue: createListChantiersUseCase() },
        { provide: ResolveChantierIdPort, useValue: createResolveChantierIdPort() },
        { provide: ClientProviderPort, useValue: createClientProviderPort() },
        { provide: ListUserBillsUseCase, useValue: createListUserBillsUseCase(repository) },
        { provide: Router, useValue: createRouter() },
        {
          provide: UpdateEnrichedBillUseCase,
          useFactory: (repo: BillRepository) => new UpdateEnrichedBillUseCase(repo),
          deps: [BillRepository]
        }
      ]
    });
    const facade = TestBed.inject(DashboardFacade);
    facade.isEditModalOpen.set(true);
    facade.isEditSubmitting.set(true);

    facade.closeEditModal();

    expect(facade.isEditModalOpen()).toBe(true);
  });

  it('redirects to login when no authenticated user', async () => {
    const repository = new InMemoryBillRepository();
    const router = createRouter();
    const listUserBillsUseCase = {
      execute: vi.fn().mockResolvedValue({
        success: false,
        error: { code: 'AUTH_USER_NOT_FOUND', message: 'Utilisateur non authentifié.' }
      })
    } as unknown as ListUserBillsUseCase;

    TestBed.configureTestingModule({
      providers: [
        DashboardFacade,
        { provide: BillRepository, useValue: repository },
        { provide: ClientDisplayResolver, useValue: createDisplayResolver() },
        { provide: ListClientsUseCase, useValue: createListClientsUseCase() },
        { provide: ListChantiersUseCase, useValue: createListChantiersUseCase() },
        { provide: ResolveChantierIdPort, useValue: createResolveChantierIdPort() },
        { provide: ClientProviderPort, useValue: createClientProviderPort() },
        { provide: ListUserBillsUseCase, useValue: listUserBillsUseCase },
        { provide: Router, useValue: router },
        {
          provide: UpdateEnrichedBillUseCase,
          useFactory: (repo: BillRepository) => new UpdateEnrichedBillUseCase(repo),
          deps: [BillRepository]
        }
      ]
    });

    TestBed.inject(DashboardFacade);
    await flushFacadeEffects();

    expect(router.navigateByUrl).toHaveBeenCalledWith('/login?returnUrl=/dashboard');
  });

  it('denies edit when invoice is outside user-scoped listing', async () => {
    const persisted = new Bill('b-owner-2', 'F-2026-0999', 'client-2')
      .setAmountTTC(999)
      .setDueDate('2099-12-31')
      .setExternalInvoiceReference('EXT-OUT')
      .setType('Situation')
      .setPaymentMode('Virement')
      .setStatus('VALIDATED');
    const repository = new InMemoryBillRepository([persisted]);
    const router = createRouter();
    const listUserBillsUseCase = {
      execute: vi.fn().mockResolvedValue({ success: true, data: [] })
    } as unknown as ListUserBillsUseCase;

    TestBed.configureTestingModule({
      providers: [
        DashboardFacade,
        { provide: BillRepository, useValue: repository },
        { provide: ClientDisplayResolver, useValue: createDisplayResolver() },
        { provide: ListClientsUseCase, useValue: createListClientsUseCase() },
        { provide: ListChantiersUseCase, useValue: createListChantiersUseCase() },
        { provide: ResolveChantierIdPort, useValue: createResolveChantierIdPort() },
        { provide: ClientProviderPort, useValue: createClientProviderPort() },
        { provide: ListUserBillsUseCase, useValue: listUserBillsUseCase },
        { provide: Router, useValue: router },
        {
          provide: UpdateEnrichedBillUseCase,
          useFactory: (repo: BillRepository) => new UpdateEnrichedBillUseCase(repo),
          deps: [BillRepository]
        }
      ]
    });

    const facade = TestBed.inject(DashboardFacade);
    await flushFacadeEffects();

    const editable = await facade.openEditInvoice('b-owner-2');

    expect(editable).toBeNull();
    expect(facade.isEditModalOpen()).toBe(false);
    expect(facade.editError()).toContain('Seules les factures persistées');
  });

  it('uses display resolver to avoid exposing raw client ids', async () => {
    const persisted = new Bill('b-3', 'F-2026-0103', 'client-1')
      .setAmountTTC(100)
      .setDueDate('2099-12-30')
      .setStatus('VALIDATED');
    const repository = new InMemoryBillRepository([persisted]);

    TestBed.configureTestingModule({
      providers: [
        DashboardFacade,
        { provide: BillRepository, useValue: repository },
        { provide: ClientDisplayResolver, useValue: createDisplayResolver() },
        { provide: ListClientsUseCase, useValue: createListClientsUseCase() },
        { provide: ListChantiersUseCase, useValue: createListChantiersUseCase() },
        { provide: ResolveChantierIdPort, useValue: createResolveChantierIdPort() },
        { provide: ClientProviderPort, useValue: createClientProviderPort() },
        { provide: ListUserBillsUseCase, useValue: createListUserBillsUseCase(repository) },
        { provide: Router, useValue: createRouter() },
        {
          provide: UpdateEnrichedBillUseCase,
          useFactory: (repo: BillRepository) => new UpdateEnrichedBillUseCase(repo),
          deps: [BillRepository]
        }
      ]
    });

    const facade = TestBed.inject(DashboardFacade);
    await flushFacadeEffects();
    await facade.openEditInvoice('b-3');

    expect(facade.invoices()[0]?.client).toBe('Alice Martin');
    expect(facade.invoices()[0]?.client).not.toBe('client-1');
    expect(facade.invoices()[0]?.showsIncompleteClientIndicator).toBe(false);
  });

  it('opens duplicate prompt when edited chantier name matches existing chantier', async () => {
    const persisted = new Bill('b-4', 'F-2026-0104', 'client-1')
      .setAmountTTC(100)
      .setDueDate('2099-12-30')
      .setChantierId('ch-1')
      .setStatus('VALIDATED');
    const repository = new InMemoryBillRepository([persisted]);

    TestBed.configureTestingModule({
      providers: [
        DashboardFacade,
        { provide: BillRepository, useValue: repository },
        { provide: ClientDisplayResolver, useValue: createDisplayResolver() },
        { provide: ListClientsUseCase, useValue: createListClientsUseCase() },
        { provide: ListChantiersUseCase, useValue: createListChantiersUseCase() },
        { provide: ResolveChantierIdPort, useValue: createResolveChantierIdPort() },
        { provide: ClientProviderPort, useValue: createClientProviderPort() },
        { provide: ListUserBillsUseCase, useValue: createListUserBillsUseCase(repository) },
        { provide: Router, useValue: createRouter() },
        {
          provide: UpdateEnrichedBillUseCase,
          useFactory: (repo: BillRepository) => new UpdateEnrichedBillUseCase(repo),
          deps: [BillRepository]
        }
      ]
    });

    const facade = TestBed.inject(DashboardFacade);
    await flushFacadeEffects();
    await facade.openEditInvoice('b-4');

    await facade.submitEditedInvoice({
      id: 'b-4',
      reference: 'F-2026-0104',
      clientId: 'client-1',
      newClientName: '',
      chantierId: '',
      chantierName: '  cadjehoun ',
      shouldCreateChantier: true,
      amountTTC: 100,
      dueDate: '2099-12-30',
      invoiceNumber: 'EXT-4',
      type: 'Situation',
      paymentMode: 'Virement',
      status: 'VALIDATED',
      remindersAutoEnabled: false,
      reminderScenarioId: ''
    });

    expect(facade.duplicateChantierPrompt()).toEqual({
      existingChantierId: 'ch-1',
      existingChantierName: 'Cadjehoun'
    });
    expect(facade.isEditSubmitting()).toBe(false);
  });

  it('opens duplicate client prompt with normalized name matching during edit submit', async () => {
    const persisted = new Bill('b-4c', 'F-2026-0104C', 'client-2')
      .setAmountTTC(100)
      .setDueDate('2099-12-30')
      .setStatus('VALIDATED');
    const repository = new InMemoryBillRepository([persisted]);

    TestBed.configureTestingModule({
      providers: [
        DashboardFacade,
        { provide: BillRepository, useValue: repository },
        { provide: ClientDisplayResolver, useValue: createDisplayResolver() },
        { provide: ListClientsUseCase, useValue: createListClientsUseCase() },
        { provide: ListChantiersUseCase, useValue: createListChantiersUseCase() },
        { provide: ResolveChantierIdPort, useValue: createResolveChantierIdPort() },
        { provide: ClientProviderPort, useValue: createClientProviderPort() },
        { provide: ListUserBillsUseCase, useValue: createListUserBillsUseCase(repository) },
        { provide: Router, useValue: createRouter() },
        {
          provide: UpdateEnrichedBillUseCase,
          useFactory: (repo: BillRepository) => new UpdateEnrichedBillUseCase(repo),
          deps: [BillRepository]
        }
      ]
    });

    const facade = TestBed.inject(DashboardFacade);
    await flushFacadeEffects();
    await facade.openEditInvoice('b-4c');

    await facade.submitEditedInvoice({
      id: 'b-4c',
      reference: 'F-2026-0104C',
      clientId: 'client-2',
      newClientName: '  álIce   mARTin ',
      chantierId: '',
      chantierName: '',
      shouldCreateChantier: false,
      amountTTC: 100,
      dueDate: '2099-12-30',
      invoiceNumber: 'EXT-4C',
      type: 'Situation',
      paymentMode: 'Virement',
      status: 'VALIDATED',
      remindersAutoEnabled: false,
      reminderScenarioId: ''
    });

    const updated = (await repository.list()).find((bill) => bill.id === 'b-4c');
    expect(facade.duplicateClientPrompt()).toEqual({
      existingClientId: 'client-1',
      existingClientName: 'Alice Martin'
    });
    expect(updated?.clientId).toBe('client-2');
    expect(facade.isEditSubmitting()).toBe(false);
  });

  it('uses existing client on confirmation and updates bill clientId', async () => {
    const persisted = new Bill('b-4d', 'F-2026-0104D', 'client-2')
      .setAmountTTC(100)
      .setDueDate('2099-12-30')
      .setStatus('VALIDATED');
    const repository = new InMemoryBillRepository([persisted]);

    TestBed.configureTestingModule({
      providers: [
        DashboardFacade,
        { provide: BillRepository, useValue: repository },
        { provide: ClientDisplayResolver, useValue: createDisplayResolver() },
        { provide: ListClientsUseCase, useValue: createListClientsUseCase() },
        { provide: ListChantiersUseCase, useValue: createListChantiersUseCase() },
        { provide: ResolveChantierIdPort, useValue: createResolveChantierIdPort() },
        { provide: ClientProviderPort, useValue: createClientProviderPort() },
        { provide: ListUserBillsUseCase, useValue: createListUserBillsUseCase(repository) },
        { provide: Router, useValue: createRouter() },
        {
          provide: UpdateEnrichedBillUseCase,
          useFactory: (repo: BillRepository) => new UpdateEnrichedBillUseCase(repo),
          deps: [BillRepository]
        }
      ]
    });

    const facade = TestBed.inject(DashboardFacade);
    await flushFacadeEffects();
    await facade.openEditInvoice('b-4d');

    await facade.submitEditedInvoice({
      id: 'b-4d',
      reference: 'F-2026-0104D',
      clientId: 'client-2',
      newClientName: ' alice martin ',
      chantierId: '',
      chantierName: '',
      shouldCreateChantier: false,
      amountTTC: 100,
      dueDate: '2099-12-30',
      invoiceNumber: 'EXT-4D',
      type: 'Situation',
      paymentMode: 'Virement',
      status: 'VALIDATED',
      remindersAutoEnabled: false,
      reminderScenarioId: ''
    });

    await facade.confirmUseExistingClientForEdit();
    const updated = (await repository.list()).find((bill) => bill.id === 'b-4d');

    expect(facade.duplicateClientPrompt()).toBeNull();
    expect(updated?.clientId).toBe('client-1');
    expect(facade.isEditModalOpen()).toBe(false);
  });

  it('creates a new client on duplicate client confirmation and updates bill with created id', async () => {
    const persisted = new Bill('b-4e', 'F-2026-0104E', 'client-2')
      .setAmountTTC(100)
      .setDueDate('2099-12-30')
      .setStatus('VALIDATED');
    const repository = new InMemoryBillRepository([persisted]);
    const clientProviderPort = {
      resolveClient: vi.fn().mockImplementation(async ({ isNewClient, clientIdOrName }) => ({
        success: true,
        data: isNewClient ? `created-${clientIdOrName}` : clientIdOrName
      }))
    } as unknown as ClientProviderPort;

    TestBed.configureTestingModule({
      providers: [
        DashboardFacade,
        { provide: BillRepository, useValue: repository },
        { provide: ClientDisplayResolver, useValue: createDisplayResolver() },
        { provide: ListClientsUseCase, useValue: createListClientsUseCase() },
        { provide: ListChantiersUseCase, useValue: createListChantiersUseCase() },
        { provide: ResolveChantierIdPort, useValue: createResolveChantierIdPort() },
        { provide: ClientProviderPort, useValue: clientProviderPort },
        { provide: ListUserBillsUseCase, useValue: createListUserBillsUseCase(repository) },
        { provide: Router, useValue: createRouter() },
        {
          provide: UpdateEnrichedBillUseCase,
          useFactory: (repo: BillRepository) => new UpdateEnrichedBillUseCase(repo),
          deps: [BillRepository]
        }
      ]
    });

    const facade = TestBed.inject(DashboardFacade);
    await flushFacadeEffects();
    await facade.openEditInvoice('b-4e');

    await facade.submitEditedInvoice({
      id: 'b-4e',
      reference: 'F-2026-0104E',
      clientId: 'client-2',
      newClientName: 'alice martin',
      chantierId: '',
      chantierName: '',
      shouldCreateChantier: false,
      amountTTC: 100,
      dueDate: '2099-12-30',
      invoiceNumber: 'EXT-4E',
      type: 'Situation',
      paymentMode: 'Virement',
      status: 'VALIDATED',
      remindersAutoEnabled: false,
      reminderScenarioId: ''
    });

    await facade.confirmCreateNewClientForEdit();
    const updated = (await repository.list()).find((bill) => bill.id === 'b-4e');

    expect(clientProviderPort.resolveClient).toHaveBeenCalledWith({
      isNewClient: true,
      clientIdOrName: 'alice martin'
    });
    expect(facade.duplicateClientPrompt()).toBeNull();
    expect(updated?.clientId).toBe('created-alice martin');
    expect(facade.isEditModalOpen()).toBe(false);
  });

  it('uses existing chantier on confirmation and updates bill chantierId', async () => {
    const persisted = new Bill('b-5', 'F-2026-0105', 'client-2')
      .setAmountTTC(100)
      .setDueDate('2099-12-30')
      .setChantierId('ch-1')
      .setStatus('VALIDATED');
    const repository = new InMemoryBillRepository([persisted]);

    TestBed.configureTestingModule({
      providers: [
        DashboardFacade,
        { provide: BillRepository, useValue: repository },
        { provide: ClientDisplayResolver, useValue: createDisplayResolver() },
        { provide: ListClientsUseCase, useValue: createListClientsUseCase() },
        { provide: ListChantiersUseCase, useValue: createListChantiersUseCase() },
        { provide: ResolveChantierIdPort, useValue: createResolveChantierIdPort() },
        { provide: ClientProviderPort, useValue: createClientProviderPort() },
        { provide: ListUserBillsUseCase, useValue: createListUserBillsUseCase(repository) },
        { provide: Router, useValue: createRouter() },
        {
          provide: UpdateEnrichedBillUseCase,
          useFactory: (repo: BillRepository) => new UpdateEnrichedBillUseCase(repo),
          deps: [BillRepository]
        }
      ]
    });

    const facade = TestBed.inject(DashboardFacade);
    await flushFacadeEffects();
    await facade.openEditInvoice('b-5');

    await facade.submitEditedInvoice({
      id: 'b-5',
      reference: 'F-2026-0105',
      clientId: 'client-2',
      newClientName: '',
      chantierId: '',
      chantierName: 'Cadjehoun',
      shouldCreateChantier: true,
      amountTTC: 100,
      dueDate: '2099-12-30',
      invoiceNumber: 'EXT-5',
      type: 'Situation',
      paymentMode: 'Virement',
      status: 'VALIDATED',
      remindersAutoEnabled: false,
      reminderScenarioId: ''
    });

    await facade.confirmUseExistingChantierForEdit();
    const updated = (await repository.list()).find((bill) => bill.id === 'b-5');

    expect(facade.duplicateChantierPrompt()).toBeNull();
    expect(updated?.chantierId).toBe('ch-1');
  });

  it('shows resolve chantier error and keeps edit modal open when chantier creation fails', async () => {
    const persisted = new Bill('b-6', 'F-2026-0106', 'client-1')
      .setAmountTTC(100)
      .setDueDate('2099-12-30')
      .setStatus('VALIDATED');
    const repository = new InMemoryBillRepository([persisted]);
    const resolveChantierIdPort = {
      execute: vi.fn().mockResolvedValue({
        success: false,
        error: { code: 'CHANTIER_PERSISTENCE_ERROR', message: 'Impossible de créer le chantier.' }
      })
    } as unknown as ResolveChantierIdPort;

    TestBed.configureTestingModule({
      providers: [
        DashboardFacade,
        { provide: BillRepository, useValue: repository },
        { provide: ClientDisplayResolver, useValue: createDisplayResolver() },
        { provide: ListClientsUseCase, useValue: createListClientsUseCase() },
        { provide: ListChantiersUseCase, useValue: createListChantiersUseCase() },
        { provide: ResolveChantierIdPort, useValue: resolveChantierIdPort },
        { provide: ClientProviderPort, useValue: createClientProviderPort() },
        { provide: ListUserBillsUseCase, useValue: createListUserBillsUseCase(repository) },
        { provide: Router, useValue: createRouter() },
        {
          provide: UpdateEnrichedBillUseCase,
          useFactory: (repo: BillRepository) => new UpdateEnrichedBillUseCase(repo),
          deps: [BillRepository]
        }
      ]
    });

    const facade = TestBed.inject(DashboardFacade);
    await flushFacadeEffects();
    await facade.openEditInvoice('b-6');

    await facade.submitEditedInvoice({
      id: 'b-6',
      reference: 'F-2026-0106',
      clientId: 'client-1',
      newClientName: '',
      chantierId: '',
      chantierName: 'Nouveau chantier',
      shouldCreateChantier: true,
      amountTTC: 100,
      dueDate: '2099-12-30',
      invoiceNumber: 'EXT-6',
      type: 'Situation',
      paymentMode: 'Virement',
      status: 'VALIDATED',
      remindersAutoEnabled: false,
      reminderScenarioId: ''
    });

    expect(facade.isEditModalOpen()).toBe(true);
    expect(facade.editError()).toBe('Impossible de créer le chantier.');
    expect(facade.isEditSubmitting()).toBe(false);
  });

  it('keeps selected existing client id when no new client name is provided', async () => {
    const persisted = new Bill('b-7', 'F-2026-0107', 'client-1')
      .setAmountTTC(100)
      .setDueDate('2099-12-30')
      .setExternalInvoiceReference('EXT-7')
      .setType('Situation')
      .setPaymentMode('Virement')
      .setStatus('VALIDATED');
    const repository = new InMemoryBillRepository([persisted]);

    TestBed.configureTestingModule({
      providers: [
        DashboardFacade,
        { provide: BillRepository, useValue: repository },
        { provide: ClientDisplayResolver, useValue: createDisplayResolver() },
        { provide: ListClientsUseCase, useValue: createListClientsUseCase() },
        { provide: ListChantiersUseCase, useValue: createListChantiersUseCase() },
        { provide: ResolveChantierIdPort, useValue: createResolveChantierIdPort() },
        { provide: ClientProviderPort, useValue: createClientProviderPort() },
        { provide: ListUserBillsUseCase, useValue: createListUserBillsUseCase(repository) },
        { provide: Router, useValue: createRouter() },
        {
          provide: UpdateEnrichedBillUseCase,
          useFactory: (repo: BillRepository) => new UpdateEnrichedBillUseCase(repo),
          deps: [BillRepository]
        }
      ]
    });

    const facade = TestBed.inject(DashboardFacade);
    await flushFacadeEffects();
    await facade.openEditInvoice('b-7');

    await facade.submitEditedInvoice({
      id: 'b-7',
      reference: 'F-2026-0107',
      clientId: 'client-1',
      newClientName: '',
      chantierId: 'ch-1',
      chantierName: '',
      shouldCreateChantier: false,
      amountTTC: 150,
      dueDate: '2099-12-29',
      invoiceNumber: 'EXT-7-EDIT',
      type: 'Situation',
      paymentMode: 'Virement',
      status: 'VALIDATED',
      remindersAutoEnabled: false,
      reminderScenarioId: ''
    });

    const updated = (await repository.list()).find((bill) => bill.id === 'b-7');
    expect(updated?.clientId).toBe('client-1');
  });

  it('creates a new client on edit when newClientName is provided and updates bill with resolved client id', async () => {
    const persisted = new Bill('b-8', 'F-2026-0108', 'client-1')
      .setAmountTTC(100)
      .setDueDate('2099-12-30')
      .setExternalInvoiceReference('EXT-8')
      .setType('Situation')
      .setPaymentMode('Virement')
      .setStatus('VALIDATED');
    const repository = new InMemoryBillRepository([persisted]);
    const clientProviderPort = {
      resolveClient: vi.fn().mockResolvedValue({ success: true, data: 'client-created-1' })
    } as unknown as ClientProviderPort;

    TestBed.configureTestingModule({
      providers: [
        DashboardFacade,
        { provide: BillRepository, useValue: repository },
        { provide: ClientDisplayResolver, useValue: createDisplayResolver() },
        { provide: ListClientsUseCase, useValue: createListClientsUseCase() },
        { provide: ListChantiersUseCase, useValue: createListChantiersUseCase() },
        { provide: ResolveChantierIdPort, useValue: createResolveChantierIdPort() },
        { provide: ClientProviderPort, useValue: createClientProviderPort() },
        { provide: ClientProviderPort, useValue: clientProviderPort },
        { provide: ListUserBillsUseCase, useValue: createListUserBillsUseCase(repository) },
        { provide: Router, useValue: createRouter() },
        {
          provide: UpdateEnrichedBillUseCase,
          useFactory: (repo: BillRepository) => new UpdateEnrichedBillUseCase(repo),
          deps: [BillRepository]
        }
      ]
    });

    const facade = TestBed.inject(DashboardFacade);
    await flushFacadeEffects();
    await facade.openEditInvoice('b-8');

    await facade.submitEditedInvoice({
      id: 'b-8',
      reference: 'F-2026-0108',
      clientId: '',
      newClientName: 'Client Created',
      chantierId: 'ch-1',
      chantierName: '',
      shouldCreateChantier: false,
      amountTTC: 150,
      dueDate: '2099-12-29',
      invoiceNumber: 'EXT-8-EDIT',
      type: 'Situation',
      paymentMode: 'Virement',
      status: 'VALIDATED',
      remindersAutoEnabled: false,
      reminderScenarioId: ''
    });

    const updated = (await repository.list()).find((bill) => bill.id === 'b-8');
    expect(clientProviderPort.resolveClient).toHaveBeenCalledWith({
      isNewClient: true,
      clientIdOrName: 'Client Created'
    });
    expect(updated?.clientId).toBe('client-created-1');
    expect(facade.isEditModalOpen()).toBe(false);
    expect(facade.editSuccess()).toBe(true);
  });

  it('keeps edit modal open with clear error when new client resolution fails', async () => {
    const persisted = new Bill('b-9', 'F-2026-0109', 'client-1')
      .setAmountTTC(100)
      .setDueDate('2099-12-30')
      .setExternalInvoiceReference('EXT-9')
      .setType('Situation')
      .setPaymentMode('Virement')
      .setStatus('VALIDATED');
    const repository = new InMemoryBillRepository([persisted]);
    const clientProviderPort = {
      resolveClient: vi.fn().mockResolvedValue({
        success: false,
        error: { code: 'CLIENT_RESOLUTION_ERROR', message: 'Impossible de créer le client.' }
      })
    } as unknown as ClientProviderPort;

    TestBed.configureTestingModule({
      providers: [
        DashboardFacade,
        { provide: BillRepository, useValue: repository },
        { provide: ClientDisplayResolver, useValue: createDisplayResolver() },
        { provide: ListClientsUseCase, useValue: createListClientsUseCase() },
        { provide: ListChantiersUseCase, useValue: createListChantiersUseCase() },
        { provide: ResolveChantierIdPort, useValue: createResolveChantierIdPort() },
        { provide: ClientProviderPort, useValue: createClientProviderPort() },
        { provide: ClientProviderPort, useValue: clientProviderPort },
        { provide: ListUserBillsUseCase, useValue: createListUserBillsUseCase(repository) },
        { provide: Router, useValue: createRouter() },
        {
          provide: UpdateEnrichedBillUseCase,
          useFactory: (repo: BillRepository) => new UpdateEnrichedBillUseCase(repo),
          deps: [BillRepository]
        }
      ]
    });

    const facade = TestBed.inject(DashboardFacade);
    await flushFacadeEffects();
    await facade.openEditInvoice('b-9');

    await facade.submitEditedInvoice({
      id: 'b-9',
      reference: 'F-2026-0109',
      clientId: '',
      newClientName: 'Client Failing',
      chantierId: 'ch-1',
      chantierName: '',
      shouldCreateChantier: false,
      amountTTC: 150,
      dueDate: '2099-12-29',
      invoiceNumber: 'EXT-9-EDIT',
      type: 'Situation',
      paymentMode: 'Virement',
      status: 'VALIDATED',
      remindersAutoEnabled: false,
      reminderScenarioId: ''
    });

    const updated = (await repository.list()).find((bill) => bill.id === 'b-9');
    expect(clientProviderPort.resolveClient).toHaveBeenCalledWith({
      isNewClient: true,
      clientIdOrName: 'Client Failing'
    });
    expect(updated?.clientId).toBe('client-1');
    expect(facade.isEditModalOpen()).toBe(true);
    expect(facade.editSuccess()).toBe(false);
    expect(facade.editError()).toBe('Impossible de créer le client.');
  });
});

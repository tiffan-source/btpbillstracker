import { TestBed } from '@angular/core/testing';
import { BillRepository } from '../../domain/ports/bill.repository';
import { failure, success } from '../../../../core/result/result';
import { Client } from '../../../clients/domain/entities/client.entity';
import { ListClientsUseCase } from '../../../clients/domain/usecases/list-clients.usecase';
import { UpdateClientUseCase } from '../../../clients/domain/usecases/update-client.usecase';
import { Chantier } from '../../../chantiers/domain/entities/chantier.entity';
import { ListChantiersUseCase } from '../../../chantiers/domain/usecases/list-chantiers.usecase';
import { UpdateChantierUseCase } from '../../../chantiers/domain/usecases/update-chantier.usecase';
import { ClientsChantiersFacade } from './clients-chantiers.facade';
import { Bill } from '../../domain/entities/bill.entity';

describe('ClientsChantiersFacade', () => {
  const billLike = (input: {
    clientId: string;
    status: 'DRAFT' | 'VALIDATED' | 'PAID';
    amountTTC: number;
    chantier?: string;
  }): Bill =>
    ({
      clientId: input.clientId,
      status: input.status,
      amountTTC: input.amountTTC,
      chantier: input.chantier
    }) as unknown as Bill;

  it('loads client view models with bill aggregates', async () => {
    const client = new Client('c-1', 'Alice Martin')
      .setFirstName('Alice')
      .setLastName('Martin')
      .setEmail('alice@example.com')
      .setPhone('+2290100000000');
    const paidBill = billLike({ clientId: 'c-1', status: 'PAID', amountTTC: 100 });
    const dueBill = billLike({ clientId: 'c-1', status: 'DRAFT', amountTTC: 300 });

    const listClientsUseCase = { execute: vitest.fn().mockResolvedValue(success([client])) };
    const listChantiersUseCase = { execute: vitest.fn().mockResolvedValue(success([])) };
    const updateClientUseCase = { execute: vitest.fn() };
    const updateChantierUseCase = { execute: vitest.fn() };
    const billRepository = { list: vitest.fn().mockResolvedValue([paidBill, dueBill]), save: vitest.fn() };

    TestBed.configureTestingModule({
      providers: [
        ClientsChantiersFacade,
        { provide: ListClientsUseCase, useValue: listClientsUseCase },
        { provide: UpdateClientUseCase, useValue: updateClientUseCase },
        { provide: ListChantiersUseCase, useValue: listChantiersUseCase },
        { provide: UpdateChantierUseCase, useValue: updateChantierUseCase },
        { provide: BillRepository, useValue: billRepository }
      ]
    });

    const facade = TestBed.inject(ClientsChantiersFacade);
    await facade.loadClients();

    expect(facade.error()).toBeNull();
    expect(facade.clients()).toEqual([
      {
        id: 'c-1',
        fullName: 'Alice Martin',
        email: 'alice@example.com',
        phone: '+2290100000000',
        invoiceCount: 2,
        totalDue: 300,
        paid: 100,
        firstName: 'Alice',
        lastName: 'Martin'
      }
    ]);
  });

  it('loads chantier view models with paid/pending progress', async () => {
    const chantier = new Chantier('ch-1', 'Villa A');
    const paidBill = billLike({ clientId: 'c-1', status: 'PAID', amountTTC: 200, chantier: 'Villa A' });
    const pendingBill = billLike({ clientId: 'c-1', status: 'DRAFT', amountTTC: 300, chantier: 'Villa A' });

    const listClientsUseCase = { execute: vitest.fn().mockResolvedValue(success([])) };
    const listChantiersUseCase = { execute: vitest.fn().mockResolvedValue(success([chantier])) };
    const updateClientUseCase = { execute: vitest.fn() };
    const updateChantierUseCase = { execute: vitest.fn() };
    const billRepository = { list: vitest.fn().mockResolvedValue([paidBill, pendingBill]), save: vitest.fn() };

    TestBed.configureTestingModule({
      providers: [
        ClientsChantiersFacade,
        { provide: ListClientsUseCase, useValue: listClientsUseCase },
        { provide: UpdateClientUseCase, useValue: updateClientUseCase },
        { provide: ListChantiersUseCase, useValue: listChantiersUseCase },
        { provide: UpdateChantierUseCase, useValue: updateChantierUseCase },
        { provide: BillRepository, useValue: billRepository }
      ]
    });

    const facade = TestBed.inject(ClientsChantiersFacade);
    await facade.loadChantiers();

    expect(facade.error()).toBeNull();
    expect(facade.chantiers()).toEqual([
      {
        id: 'ch-1',
        name: 'Villa A',
        paid: 200,
        pending: 300,
        progressPercent: 40
      }
    ]);
  });

  it('returns false and sets error when client update fails', async () => {
    const listClientsUseCase = { execute: vitest.fn().mockResolvedValue(success([])) };
    const listChantiersUseCase = { execute: vitest.fn().mockResolvedValue(success([])) };
    const updateClientUseCase = { execute: vitest.fn().mockResolvedValue(failure('CLIENT_PERSISTENCE_ERROR', 'update failed')) };
    const updateChantierUseCase = { execute: vitest.fn() };
    const billRepository = { list: vitest.fn().mockResolvedValue([]), save: vitest.fn() };

    TestBed.configureTestingModule({
      providers: [
        ClientsChantiersFacade,
        { provide: ListClientsUseCase, useValue: listClientsUseCase },
        { provide: UpdateClientUseCase, useValue: updateClientUseCase },
        { provide: ListChantiersUseCase, useValue: listChantiersUseCase },
        { provide: UpdateChantierUseCase, useValue: updateChantierUseCase },
        { provide: BillRepository, useValue: billRepository }
      ]
    });

    const facade = TestBed.inject(ClientsChantiersFacade);
    const updated = await facade.updateClient('c-1', {
      firstName: 'Alice',
      lastName: 'Martin',
      email: 'alice@example.com',
      phone: '+2290100000000'
    });

    expect(updated).toBe(false);
    expect(facade.error()).toBe('update failed');
    expect(facade.isSubmitting()).toBe(false);
  });

  it('returns false and sets error when chantier update fails', async () => {
    const listClientsUseCase = { execute: vitest.fn().mockResolvedValue(success([])) };
    const listChantiersUseCase = { execute: vitest.fn().mockResolvedValue(success([])) };
    const updateClientUseCase = { execute: vitest.fn() };
    const updateChantierUseCase = { execute: vitest.fn().mockResolvedValue(failure('CHANTIER_PERSISTENCE_ERROR', 'chantier update failed')) };
    const billRepository = { list: vitest.fn().mockResolvedValue([]), save: vitest.fn() };

    TestBed.configureTestingModule({
      providers: [
        ClientsChantiersFacade,
        { provide: ListClientsUseCase, useValue: listClientsUseCase },
        { provide: UpdateClientUseCase, useValue: updateClientUseCase },
        { provide: ListChantiersUseCase, useValue: listChantiersUseCase },
        { provide: UpdateChantierUseCase, useValue: updateChantierUseCase },
        { provide: BillRepository, useValue: billRepository }
      ]
    });

    const facade = TestBed.inject(ClientsChantiersFacade);
    const updated = await facade.updateChantier('ch-1', { name: 'Villa B' });

    expect(updated).toBe(false);
    expect(facade.error()).toBe('chantier update failed');
    expect(facade.isSubmitting()).toBe(false);
  });
});

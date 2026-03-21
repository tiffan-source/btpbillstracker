import { failure, success } from '../../../../core/result/result';
import { Bill } from '../entities/bill.entity';
import { BillPersistenceError } from '../errors/bill-persistence.error';
import { BillRepository } from '../ports/bill.repository';
import { CurrentUserPort } from '../ports/current-user.port';
import { ListUserBillsUseCase } from './list-user-bills.usecase';

class InMemoryBillRepository implements BillRepository {
  public readonly calls: string[] = [];

  async save(_bill: Bill): Promise<void> {}

  async list(): Promise<Bill[]> {
    return [new Bill('b-1', 'F-2026-0001', 'c-1')];
  }

  async listByOwner(userId: string): Promise<Bill[]> {
    this.calls.push(userId);
    return this.list();
  }

  async update(_bill: Bill): Promise<void> {}
}

class StubCurrentUserPort implements CurrentUserPort {
  constructor(private readonly result = success<{ uid: string } | null>({ uid: 'owner-1' })) {}

  async getCurrentUser() {
    return this.result;
  }
}

describe('ListUserBillsUseCase', () => {
  it('lists bills for authenticated user uid', async () => {
    const repository = new InMemoryBillRepository();
    const currentUser = new StubCurrentUserPort(success({ uid: 'owner-1' }));
    const useCase = new ListUserBillsUseCase(repository, currentUser);

    const result = await useCase.execute();

    expect(result.success).toBe(true);
    expect(repository.calls).toEqual(['owner-1']);
  });

  it('returns AUTH_USER_NOT_FOUND when no authenticated user exists', async () => {
    const repository = new InMemoryBillRepository();
    const currentUser = new StubCurrentUserPort(success(null));
    const useCase = new ListUserBillsUseCase(repository, currentUser);

    const result = await useCase.execute();

    expect(result.success).toBe(false);
    if (result.success) {
      return;
    }

    expect(result.error.code).toBe('AUTH_USER_NOT_FOUND');
  });

  it('propagates current user retrieval failure', async () => {
    const repository = new InMemoryBillRepository();
    const currentUser = new StubCurrentUserPort(failure('AUTH_PERSISTENCE_ERROR', 'Session indisponible'));
    const useCase = new ListUserBillsUseCase(repository, currentUser);

    const result = await useCase.execute();

    expect(result.success).toBe(false);
    if (result.success) {
      return;
    }

    expect(result.error.code).toBe('AUTH_PERSISTENCE_ERROR');
  });

  it('maps unknown repository failures to UNKNOWN_ERROR', async () => {
    const repository = new InMemoryBillRepository();
    repository.listByOwner = vi.fn().mockRejectedValue('unexpected');
    const currentUser = new StubCurrentUserPort(success({ uid: 'owner-1' }));
    const useCase = new ListUserBillsUseCase(repository, currentUser);

    const result = await useCase.execute();

    expect(result.success).toBe(false);
    if (result.success) {
      return;
    }

    expect(result.error.code).toBe('UNKNOWN_ERROR');
  });

  it('maps repository persistence error', async () => {
    const repository = new InMemoryBillRepository();
    repository.listByOwner = vi.fn().mockRejectedValue(new BillPersistenceError('lecture impossible'));
    const currentUser = new StubCurrentUserPort(success({ uid: 'owner-1' }));
    const useCase = new ListUserBillsUseCase(repository, currentUser);

    const result = await useCase.execute();

    expect(result.success).toBe(false);
    if (result.success) {
      return;
    }

    expect(result.error.code).toBe('BILL_PERSISTENCE_ERROR');
  });
});

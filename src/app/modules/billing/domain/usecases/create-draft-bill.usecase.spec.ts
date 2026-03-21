import { Bill } from '../entities/bill.entity';
import { BillPersistenceError } from '../errors/bill-persistence.error';
import { BillRepository } from '../ports/bill.repository';
import { ReferenceGeneratorService } from '../ports/reference-generator.service';
import { CreateDraftBillUseCase } from './create-draft-bill.usecase';
import { IdGeneratorPort } from '../../../../core/ids/id-generator.port';

class MockBillRepository implements BillRepository {
  savedBill: Bill | null = null;

  async save(bill: Bill): Promise<void> {
    this.savedBill = bill;
  }

  async list(): Promise<Bill[]> {
    return this.savedBill ? [this.savedBill] : [];
  }

  async listByOwner(userId: string): Promise<Bill[]> {
    return this.list();
  }

  async update(_bill: Bill): Promise<void> {}
}

class MockReferenceGenerator implements ReferenceGeneratorService {
  async generate(): Promise<string> {
    return 'F-2026-0001';
  }
}

class StaticIdGenerator implements IdGeneratorPort {
  generate(): string {
    return 'bill-id-123';
  }
}

describe('CreateDraftBillUseCase', () => {
  it('should successfully create a draft bill and save it', async () => {
    const repository = new MockBillRepository();
    const generator = new MockReferenceGenerator();
    const idGenerator = new StaticIdGenerator();
    const useCase = new CreateDraftBillUseCase(repository, generator, idGenerator);

    const result = await useCase.execute('client-123');

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.clientId).toBe('client-123');
      expect(result.data.reference).toBe('F-2026-0001');
      expect(result.data.id).toBe('bill-id-123');
      expect(result.data.status).toBe('DRAFT');

      expect(repository.savedBill).toBe(result.data);
    }
  });

  it('should return a failure if repository throws an error', async () => {
    const repository = new MockBillRepository();
    repository.save = vitest.fn().mockRejectedValue(new BillPersistenceError('DB failure'));

    const generator = new MockReferenceGenerator();
    const idGenerator = new StaticIdGenerator();
    const useCase = new CreateDraftBillUseCase(repository, generator, idGenerator);

    const result = await useCase.execute('client-123');

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.code).toBe('BILL_PERSISTENCE_ERROR');
      expect(result.error.message).toBe('DB failure');
    }
  });

  it('should map unknown errors to UNKNOWN_ERROR', async () => {
    const repository = new MockBillRepository();
    repository.save = vitest.fn().mockRejectedValue('unexpected');

    const generator = new MockReferenceGenerator();
    const idGenerator = new StaticIdGenerator();
    const useCase = new CreateDraftBillUseCase(repository, generator, idGenerator);

    const result = await useCase.execute('client-123');

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.code).toBe('UNKNOWN_ERROR');
    }
  });
});

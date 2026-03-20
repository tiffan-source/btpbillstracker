import { Client } from '../entities/client.entity';
import { ClientRepository } from '../ports/client.repository';
import { CreateQuickClientUseCase } from './create-quick-client.usecase';
import { ClientPersistenceError } from '../errors/client-persistence.error';

class MockClientRepository implements ClientRepository {
  savedClient: Client | null = null;
  throwUnknown = false;
  throwPersistenceError = false;

  async save(client: Client): Promise<void> {
    if (this.throwPersistenceError) {
      throw new ClientPersistenceError();
    }
    if (this.throwUnknown) {
      throw new Error('Unknown runtime issue');
    }
    this.savedClient = client;
  }
}

describe('CreateQuickClientUseCase', () => {
  it('should successfully create and save a new client', async () => {
    const repository = new MockClientRepository();
    const useCase = new CreateQuickClientUseCase(repository);

    const result = await useCase.execute({ name: 'Jane Doe', email: 'jane@example.com' });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.name).toBe('Jane Doe');
      expect(result.data.email).toBe('jane@example.com');
      expect(result.data.id).toBeDefined();

      expect(repository.savedClient).toBe(result.data);
    }
  });

  it('should return failure with specific code when name is empty', async () => {
    const repository = new MockClientRepository();
    const useCase = new CreateQuickClientUseCase(repository);

    const result = await useCase.execute({ name: '   ' });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.code).toBe('INVALID_CLIENT_NAME');
      expect(result.error.message).toContain('nom valide');
    }
  });

  it('should map known persistence error to its exact code', async () => {
    const repository = new MockClientRepository();
    repository.throwPersistenceError = true;
    const useCase = new CreateQuickClientUseCase(repository);

    const result = await useCase.execute({ name: 'Jane Doe' });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.code).toBe('CLIENT_PERSISTENCE_ERROR');
    }
  });

  it('should map unknown errors to UNKNOWN_ERROR', async () => {
    const repository = new MockClientRepository();
    repository.throwUnknown = true;
    const useCase = new CreateQuickClientUseCase(repository);

    const result = await useCase.execute({ name: 'Jane Doe' });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.code).toBe('UNKNOWN_ERROR');
    }
  });
});

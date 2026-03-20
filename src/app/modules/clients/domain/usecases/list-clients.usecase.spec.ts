import { Client } from '../entities/client.entity';
import { ClientRepository } from '../ports/client.repository';
import { ListClientsUseCase } from './list-clients.usecase';

class InMemoryClientRepository extends ClientRepository {
  constructor(private readonly clients: Client[]) {
    super();
  }

  async save(client: Client): Promise<void> {
    this.clients.push(client);
  }

  async list(): Promise<Client[]> {
    return [...this.clients];
  }

  async update(client: Client): Promise<void> {
    const index = this.clients.findIndex((current) => current.id === client.id);
    if (index >= 0) {
      this.clients[index] = client;
    }
  }
}

describe('ListClientsUseCase', () => {
  it('returns clients from repository', async () => {
    const repo = new InMemoryClientRepository([
      new Client('c-1', 'Alice Martin').setFirstName('Alice').setLastName('Martin')
    ]);
    const useCase = new ListClientsUseCase(repo);

    const result = await useCase.execute();

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toHaveLength(1);
      expect(result.data[0]?.name).toBe('Alice Martin');
    }
  });
});

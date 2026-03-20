import { Client } from '../entities/client.entity';
import { ClientRepository } from '../ports/client.repository';
import { UpdateClientUseCase } from './update-client.usecase';

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
    if (index < 0) {
      throw new Error('Not found');
    }
    this.clients[index] = client;
  }
}

describe('UpdateClientUseCase', () => {
  it('updates client identity fields', async () => {
    const repo = new InMemoryClientRepository([
      new Client('c-1', 'Old Name').setFirstName('Old').setLastName('Name')
    ]);
    const useCase = new UpdateClientUseCase(repo);

    const result = await useCase.execute({
      id: 'c-1',
      firstName: 'Alice',
      lastName: 'Martin',
      email: 'alice@example.com',
      phone: '+2290100000000'
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.name).toBe('Alice Martin');
      expect(result.data.email).toBe('alice@example.com');
      expect(result.data.phone).toBe('+2290100000000');
    }
  });
});

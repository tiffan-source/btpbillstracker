import { Client } from '../domain/entities/client.entity';
import { ClientPersistenceError } from '../domain/errors/client-persistence.error';
import { LocalClientRepository } from './local-client.repository';

describe('LocalClientRepository', () => {
  afterEach(() => {
    localStorage.clear();
  });

  it('should save a client in local storage', async () => {
    const repository = new LocalClientRepository();
    const client = new Client('c-1', 'Alice').setEmail('alice@example.com');

    await repository.save(client);

    const raw = localStorage.getItem('btp_clients');
    expect(raw).toBeTruthy();
    expect(JSON.parse(raw ?? '[]')).toEqual([
      {
        id: 'c-1',
        name: 'Alice',
        email: 'alice@example.com'
      }
    ]);
  });

  it('should map storage technical failures to ClientPersistenceError', async () => {
    const repository = new LocalClientRepository();
    const client = new Client('c-2', 'Bob');
    const setItemSpy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('Quota exceeded');
    });

    await expect(repository.save(client)).rejects.toThrow(ClientPersistenceError);

    setItemSpy.mockRestore();
  });
});


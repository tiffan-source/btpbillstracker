import { Client } from '../domain/entities/client.entity';
import { ClientPersistenceError } from '../domain/errors/client-persistence.error';
import { LocalClientRepository } from './local-client.repository';

describe('LocalClientRepository', () => {
  afterEach(() => {
    localStorage.clear();
  });

  it('should save a client in local storage', async () => {
    const repository = new LocalClientRepository();
    const client = new Client('c-1', 'Alice')
      .setFirstName('Alice')
      .setLastName('Martin')
      .setPhone('+2290100000000')
      .setEmail('alice@example.com');

    await repository.save(client);

    const raw = localStorage.getItem('btp_clients');
    expect(raw).toBeTruthy();
    expect(JSON.parse(raw ?? '[]')).toEqual([
      {
        id: 'c-1',
        name: 'Alice Martin',
        firstName: 'Alice',
        lastName: 'Martin',
        email: 'alice@example.com',
        phone: '+2290100000000'
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

  it('should list persisted clients', async () => {
    localStorage.setItem('btp_clients', JSON.stringify([
      {
        id: 'c-1',
        name: 'Alice Martin',
        firstName: 'Alice',
        lastName: 'Martin',
        email: 'alice@example.com',
        phone: '+2290100000000'
      }
    ]));

    const repository = new LocalClientRepository();
    const clients = await repository.list();

    expect(clients).toHaveLength(1);
    expect(clients[0]?.id).toBe('c-1');
    expect(clients[0]?.firstName).toBe('Alice');
    expect(clients[0]?.lastName).toBe('Martin');
    expect(clients[0]?.email).toBe('alice@example.com');
    expect(clients[0]?.phone).toBe('+2290100000000');
    expect(clients[0]?.name).toBe('Alice Martin');
  });

  it('should update an existing client', async () => {
    localStorage.setItem('btp_clients', JSON.stringify([
      {
        id: 'c-1',
        name: 'Alice Martin',
        firstName: 'Alice',
        lastName: 'Martin',
        email: 'alice@example.com',
        phone: '+2290100000000'
      }
    ]));
    const repository = new LocalClientRepository();
    const updated = new Client('c-1', 'Alice Martin')
      .setFirstName('Alicia')
      .setLastName('Martin')
      .setEmail('alicia@example.com')
      .setPhone('+2290199999999');

    await repository.update(updated);

    const raw = localStorage.getItem('btp_clients');
    expect(raw).toBeTruthy();
    expect(JSON.parse(raw ?? '[]')).toEqual([
      {
        id: 'c-1',
        name: 'Alicia Martin',
        firstName: 'Alicia',
        lastName: 'Martin',
        email: 'alicia@example.com',
        phone: '+2290199999999'
      }
    ]);
  });
});

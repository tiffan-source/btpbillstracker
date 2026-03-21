import { Client } from '../domain/entities/client.entity';
import { ClientPersistenceError } from '../domain/errors/client-persistence.error';
import { FirestoreClientDataSource } from './firestore-client.datasource';
import { FirestoreClientRepository } from './firestore-client.repository';

describe('FirestoreClientRepository', () => {
  const createDataSource = (): FirestoreClientDataSource =>
    ({
      saveById: vi.fn(),
      readAll: vi.fn(),
      readById: vi.fn(),
      getCurrentUser: vi.fn().mockReturnValue({ uid: 'owner-1' }),
      getCollection: vi.fn(),
      getClientDocRef: vi.fn()
    }) as unknown as FirestoreClientDataSource;

  it('saves a client with domain id as document id', async () => {
    const dataSource = createDataSource();
    vi.mocked(dataSource.saveById).mockResolvedValue(undefined);
    const repository = new FirestoreClientRepository(dataSource);
    const client = new Client('c-1', 'Alice Martin')
      .setFirstName('Alice')
      .setLastName('Martin')
      .setEmail('alice@example.com')
      .setPhone('+2290100000000');

    await repository.save(client);

    expect(dataSource.saveById).toHaveBeenCalledWith('c-1', {
      id: 'c-1',
      ownerUid: 'owner-1',
      name: 'Alice Martin',
      firstName: 'Alice',
      lastName: 'Martin',
      email: 'alice@example.com',
      phone: '+2290100000000'
    });
  });

  it('lists clients and rebuilds domain entities', async () => {
    const dataSource = createDataSource();
    vi.mocked(dataSource.readAll).mockResolvedValue({
      docs: [
        {
          data: () => ({
            id: 'c-1',
            ownerUid: 'owner-1',
            name: 'Alice Martin',
            firstName: 'Alice',
            lastName: 'Martin',
            email: 'alice@example.com',
            phone: '+2290100000000'
          })
        }
      ]
    } as never);

    const repository = new FirestoreClientRepository(dataSource);
    const clients = await repository.list();

    expect(clients).toHaveLength(1);
    expect(clients[0]?.id).toBe('c-1');
    expect(clients[0]?.name).toBe('Alice Martin');
    expect(clients[0]?.firstName).toBe('Alice');
    expect(clients[0]?.lastName).toBe('Martin');
    expect(clients[0]?.email).toBe('alice@example.com');
    expect(clients[0]?.phone).toBe('+2290100000000');
  });

  it('throws ClientPersistenceError when updating a non-existent client', async () => {
    const dataSource = createDataSource();
    vi.mocked(dataSource.readById).mockResolvedValue({ exists: () => false } as never);
    const repository = new FirestoreClientRepository(dataSource);
    const client = new Client('missing-client', 'Missing User');

    await expect(repository.update(client)).rejects.toThrow(ClientPersistenceError);
    await expect(repository.update(client)).rejects.toMatchObject({
      code: 'CLIENT_PERSISTENCE_ERROR',
      message: 'Client introuvable pour mise à jour.'
    });
  });

  it('does not return clients from another owner', async () => {
    const dataSource = createDataSource();
    vi.mocked(dataSource.readAll).mockResolvedValue({
      docs: [
        { data: () => ({ id: 'c-1', ownerUid: 'owner-1', name: 'Alice Martin' }) },
        { data: () => ({ id: 'c-2', ownerUid: 'owner-2', name: 'Other Owner' }) },
        { data: () => ({ id: 'c-3', name: 'No owner' }) }
      ]
    } as never);
    const repository = new FirestoreClientRepository(dataSource);

    const clients = await repository.list();

    expect(clients).toHaveLength(1);
    expect(clients[0]?.id).toBe('c-1');
  });

  it('rejects write when existing client belongs to another owner', async () => {
    const dataSource = createDataSource();
    vi.mocked(dataSource.readById).mockResolvedValue({
      exists: () => true,
      data: () => ({ id: 'c-1', ownerUid: 'owner-2', name: 'Other Owner' })
    } as never);
    const repository = new FirestoreClientRepository(dataSource);
    const client = new Client('c-1', 'Alice Martin');

    await expect(repository.update(client)).rejects.toMatchObject({
      code: 'CLIENT_PERSISTENCE_ERROR',
      message: 'Client introuvable pour mise à jour.'
    });
  });

  it('maps technical data-source failures to ClientPersistenceError', async () => {
    const dataSource = createDataSource();
    vi.mocked(dataSource.saveById).mockRejectedValue(new Error('permission denied'));
    const repository = new FirestoreClientRepository(dataSource);
    const client = new Client('c-9', 'Failure User');

    await expect(repository.save(client)).rejects.toThrow(ClientPersistenceError);
  });
});

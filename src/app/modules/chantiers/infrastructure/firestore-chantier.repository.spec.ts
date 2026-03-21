import { Chantier } from '../domain/entities/chantier.entity';
import { ChantierPersistenceError } from '../domain/errors/chantier-persistence.error';
import { FirestoreChantierDataSource } from './firestore-chantier.datasource';
import { FirestoreChantierRepository } from './firestore-chantier.repository';

describe('FirestoreChantierRepository', () => {
  const createDataSource = (): FirestoreChantierDataSource =>
    ({
      saveById: vi.fn(),
      readAll: vi.fn(),
      readById: vi.fn(),
      getCurrentUser: vi.fn().mockReturnValue({ uid: 'owner-1' }),
      getCollection: vi.fn(),
      getChantierDocRef: vi.fn()
    }) as unknown as FirestoreChantierDataSource;

  it('saves a chantier with domain id as document id', async () => {
    const dataSource = createDataSource();
    vi.mocked(dataSource.saveById).mockResolvedValue(undefined);
    const repository = new FirestoreChantierRepository(dataSource);
    const chantier = new Chantier('ch-1', 'Villa A');

    await repository.save(chantier);

    expect(dataSource.saveById).toHaveBeenCalledWith('ch-1', {
      id: 'ch-1',
      ownerUid: 'owner-1',
      name: 'Villa A'
    });
  });

  it('lists chantiers and rebuilds domain entities', async () => {
    const dataSource = createDataSource();
    vi.mocked(dataSource.readAll).mockResolvedValue({
      docs: [
        {
          data: () => ({
            id: 'ch-1',
            ownerUid: 'owner-1',
            name: 'Villa A'
          })
        },
        {
          data: () => ({
            id: 'ch-2',
            ownerUid: 'owner-1',
            name: 'Akpakpa'
          })
        }
      ]
    } as never);
    const repository = new FirestoreChantierRepository(dataSource);

    const chantiers = await repository.list();

    expect(chantiers).toHaveLength(2);
    expect(chantiers[0]?.id).toBe('ch-1');
    expect(chantiers[0]?.name).toBe('Villa A');
    expect(chantiers[1]?.id).toBe('ch-2');
    expect(chantiers[1]?.name).toBe('Akpakpa');
  });

  it('throws ChantierPersistenceError when updating a non-existent chantier', async () => {
    const dataSource = createDataSource();
    vi.mocked(dataSource.readById).mockResolvedValue({ exists: () => false } as never);
    const repository = new FirestoreChantierRepository(dataSource);
    const chantier = new Chantier('ch-missing', 'Missing');

    await expect(repository.update(chantier)).rejects.toThrow(ChantierPersistenceError);
    await expect(repository.update(chantier)).rejects.toMatchObject({
      code: 'CHANTIER_PERSISTENCE_ERROR',
      message: 'Chantier introuvable pour mise à jour.'
    });
  });

  it('checks existsByName case-insensitively with excludeId support', async () => {
    const dataSource = createDataSource();
    vi.mocked(dataSource.readAll).mockResolvedValue({
      docs: [
        { data: () => ({ id: 'ch-1', ownerUid: 'owner-1', name: 'Villa A' }) },
        { data: () => ({ id: 'ch-2', ownerUid: 'owner-1', name: 'Calavi' }) }
      ]
    } as never);
    const repository = new FirestoreChantierRepository(dataSource);

    await expect(repository.existsByName('villa a')).resolves.toBe(true);
    await expect(repository.existsByName('villa a', 'ch-1')).resolves.toBe(false);
    await expect(repository.existsByName('akpakpa')).resolves.toBe(false);
  });

  it('maps technical data-source failures to ChantierPersistenceError', async () => {
    const dataSource = createDataSource();
    vi.mocked(dataSource.saveById).mockRejectedValue(new Error('permission denied'));
    const repository = new FirestoreChantierRepository(dataSource);
    const chantier = new Chantier('ch-9', 'Failure');

    await expect(repository.save(chantier)).rejects.toThrow(ChantierPersistenceError);
  });

  it('does not return chantiers from another owner', async () => {
    const dataSource = createDataSource();
    vi.mocked(dataSource.readAll).mockResolvedValue({
      docs: [
        { data: () => ({ id: 'ch-1', ownerUid: 'owner-1', name: 'Villa A' }) },
        { data: () => ({ id: 'ch-2', ownerUid: 'owner-2', name: 'Other Owner' }) },
        { data: () => ({ id: 'ch-3', name: 'No owner' }) }
      ]
    } as never);
    const repository = new FirestoreChantierRepository(dataSource);

    const chantiers = await repository.list();

    expect(chantiers).toHaveLength(1);
    expect(chantiers[0]?.id).toBe('ch-1');
  });

  it('rejects update when existing chantier belongs to another owner', async () => {
    const dataSource = createDataSource();
    vi.mocked(dataSource.readById).mockResolvedValue({
      exists: () => true,
      data: () => ({ id: 'ch-1', ownerUid: 'owner-2', name: 'Other Owner' })
    } as never);
    const repository = new FirestoreChantierRepository(dataSource);
    const chantier = new Chantier('ch-1', 'Villa A');

    await expect(repository.update(chantier)).rejects.toMatchObject({
      code: 'CHANTIER_PERSISTENCE_ERROR',
      message: 'Chantier introuvable pour mise à jour.'
    });
  });
});

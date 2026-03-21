import { Chantier } from '../domain/entities/chantier.entity';
import { LocalChantierRepository } from './local-chantier.repository';

describe('LocalChantierRepository', () => {
  afterEach(() => {
    localStorage.clear();
  });

  it('saves and lists chantiers from local storage', async () => {
    const repository = new LocalChantierRepository();

    await repository.save(new Chantier('ch-1', 'Villa A'));
    const chantiers = await repository.list();

    expect(chantiers).toHaveLength(1);
    expect(chantiers[0]?.id).toBe('ch-1');
    expect(chantiers[0]?.name).toBe('Villa A');
  });

  it('checks name uniqueness ignoring case', async () => {
    const repository = new LocalChantierRepository();
    await repository.save(new Chantier('ch-1', 'Villa A'));

    await expect(repository.existsByName('villa a')).resolves.toBe(true);
    await expect(repository.existsByName('autre chantier')).resolves.toBe(false);
    await expect(repository.existsByName('villa a', 'ch-1')).resolves.toBe(false);
  });

  it('rollback path keeps local repository functional for save/list/update/existsByName', async () => {
    const repository = new LocalChantierRepository();
    await repository.save(new Chantier('ch-rollback', 'Cadjehoun'));

    const listed = await repository.list();
    expect(listed.map((item) => item.id)).toContain('ch-rollback');

    const updated = new Chantier('ch-rollback', 'Cadjehoun').setName('Cadjehoun Nord');
    await repository.update(updated);

    await expect(repository.existsByName('cadjehoun nord')).resolves.toBe(true);
    await expect(repository.existsByName('cadjehoun nord', 'ch-rollback')).resolves.toBe(false);
  });
});

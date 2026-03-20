import { Chantier } from '../entities/chantier.entity';
import { ChantierRepository } from '../ports/chantier.repository';
import { UpdateChantierUseCase } from './update-chantier.usecase';

class InMemoryChantierRepository extends ChantierRepository {
  constructor(private readonly data: Chantier[]) {
    super();
  }

  async save(chantier: Chantier): Promise<void> {
    this.data.push(chantier);
  }

  async list(): Promise<Chantier[]> {
    return [...this.data];
  }

  async update(chantier: Chantier): Promise<void> {
    const index = this.data.findIndex((current) => current.id === chantier.id);
    if (index < 0) {
      throw new Error('Not found');
    }
    this.data[index] = chantier;
  }

  async existsByName(name: string, excludeId?: string): Promise<boolean> {
    const normalized = name.trim().toLowerCase();
    return this.data.some((chantier) => chantier.name.trim().toLowerCase() === normalized && chantier.id !== excludeId);
  }
}

describe('UpdateChantierUseCase', () => {
  it('updates chantier name when unique', async () => {
    const repo = new InMemoryChantierRepository([new Chantier('ch-1', 'Ancien')]);
    const useCase = new UpdateChantierUseCase(repo);

    const result = await useCase.execute({ id: 'ch-1', name: 'Nouveau Nom' });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.name).toBe('Nouveau Nom');
    }
  });

  it('fails when chantier name already exists with another id', async () => {
    const repo = new InMemoryChantierRepository([
      new Chantier('ch-1', 'Villa A'),
      new Chantier('ch-2', 'Villa B')
    ]);
    const useCase = new UpdateChantierUseCase(repo);

    const result = await useCase.execute({ id: 'ch-2', name: 'vIlLa a' });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.code).toBe('CHANTIER_NAME_ALREADY_EXISTS');
    }
  });
});

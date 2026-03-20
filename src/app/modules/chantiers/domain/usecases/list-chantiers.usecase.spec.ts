import { Chantier } from '../entities/chantier.entity';
import { ChantierRepository } from '../ports/chantier.repository';
import { ListChantiersUseCase } from './list-chantiers.usecase';

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
    if (index >= 0) {
      this.data[index] = chantier;
    }
  }

  async existsByName(name: string, excludeId?: string): Promise<boolean> {
    const normalized = name.trim().toLowerCase();
    return this.data.some((chantier) => chantier.name.trim().toLowerCase() === normalized && chantier.id !== excludeId);
  }
}

describe('ListChantiersUseCase', () => {
  it('returns chantier list', async () => {
    const repo = new InMemoryChantierRepository([new Chantier('ch-1', 'Villa A')]);
    const useCase = new ListChantiersUseCase(repo);

    const result = await useCase.execute();

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toHaveLength(1);
      expect(result.data[0]?.name).toBe('Villa A');
    }
  });
});

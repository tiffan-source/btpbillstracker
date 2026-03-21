import { Chantier } from '../entities/chantier.entity';
import { ChantierRepository } from '../ports/chantier.repository';
import { CreateChantierUseCase } from './create-chantier.usecase';
import { IdGeneratorPort } from '../../../../core/ids/id-generator.port';

class InMemoryChantierRepository extends ChantierRepository {
  readonly chantiers: Chantier[] = [];

  async save(chantier: Chantier): Promise<void> {
    this.chantiers.push(chantier);
  }

  async list(): Promise<Chantier[]> {
    return [...this.chantiers];
  }

  async update(chantier: Chantier): Promise<void> {
    const index = this.chantiers.findIndex((current) => current.id === chantier.id);
    if (index >= 0) {
      this.chantiers[index] = chantier;
    }
  }

  async existsByName(name: string, excludeId?: string): Promise<boolean> {
    const normalized = name.trim().toLowerCase();
    return this.chantiers.some((chantier) => chantier.name.trim().toLowerCase() === normalized && chantier.id !== excludeId);
  }
}

class StaticIdGenerator implements IdGeneratorPort {
  generate(): string {
    return 'chantier-id-123';
  }
}

describe('CreateChantierUseCase', () => {
  it('creates chantier with unique name (case-insensitive)', async () => {
    const repository = new InMemoryChantierRepository();
    const idGenerator = new StaticIdGenerator();
    const useCase = new CreateChantierUseCase(repository, idGenerator);

    const result = await useCase.execute({ name: 'Villa A' });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.name).toBe('Villa A');
      expect(result.data.id).toBe('chantier-id-123');
    }
  });

  it('fails when chantier name already exists', async () => {
    const repository = new InMemoryChantierRepository();
    await repository.save(new Chantier('ch-1', 'Villa A'));
    const idGenerator = new StaticIdGenerator();
    const useCase = new CreateChantierUseCase(repository, idGenerator);

    const result = await useCase.execute({ name: 'vIlLa a' });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.code).toBe('CHANTIER_NAME_ALREADY_EXISTS');
    }
  });
});

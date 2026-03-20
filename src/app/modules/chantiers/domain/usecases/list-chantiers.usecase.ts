import { failure, Result, success } from '../../../../core/result/result';
import { Chantier } from '../entities/chantier.entity';
import { ChantierPersistenceError } from '../errors/chantier-persistence.error';
import { ChantierRepository } from '../ports/chantier.repository';

/**
 * Lister les chantiers disponibles.
 */
export class ListChantiersUseCase {
  constructor(private readonly repository: ChantierRepository) {}

  async execute(): Promise<Result<Chantier[]>> {
    try {
      const chantiers = await this.repository.list();
      return success(chantiers);
    } catch (error: unknown) {
      if (error instanceof ChantierPersistenceError) {
        return failure(error.code, error.message, error.metadata);
      }

      const message = error instanceof Error ? error.message : 'Error listing chantiers';
      return failure('UNKNOWN_ERROR', message);
    }
  }
}

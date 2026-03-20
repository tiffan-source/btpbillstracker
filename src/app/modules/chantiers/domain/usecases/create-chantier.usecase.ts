import { failure, Result, success } from '../../../../core/result/result';
import { Chantier } from '../entities/chantier.entity';
import { ChantierNameAlreadyExistsError } from '../errors/chantier-name-already-exists.error';
import { ChantierPersistenceError } from '../errors/chantier-persistence.error';
import { InvalidChantierNameError } from '../errors/invalid-chantier-name.error';
import { ChantierRepository } from '../ports/chantier.repository';
import { CreateChantierInput } from './create-chantier.input';

export class CreateChantierUseCase {
  constructor(private readonly repository: ChantierRepository) {}

  async execute(input: CreateChantierInput): Promise<Result<Chantier>> {
    try {
      const alreadyExists = await this.repository.existsByName(input.name);
      if (alreadyExists) {
        throw new ChantierNameAlreadyExistsError();
      }

      const chantier = new Chantier(crypto.randomUUID(), input.name);
      await this.repository.save(chantier);
      return success(chantier);
    } catch (error: unknown) {
      if (
        error instanceof InvalidChantierNameError ||
        error instanceof ChantierNameAlreadyExistsError ||
        error instanceof ChantierPersistenceError
      ) {
        return failure(error.code, error.message, error.metadata);
      }

      const message = error instanceof Error ? error.message : 'Erreur inconnue sur la creation de chantier.';
      return failure('UNKNOWN_ERROR', message);
    }
  }
}


import { failure, Result, success } from '../../../../core/result/result';
import { Client } from '../entities/client.entity';
import { ClientPersistenceError } from '../errors/client-persistence.error';
import { ClientRepository } from '../ports/client.repository';

/**
 * Lister les clients disponibles pour la presentation.
 */
export class ListClientsUseCase {
  constructor(private readonly repository: ClientRepository) {}

  async execute(): Promise<Result<Client[]>> {
    try {
      const clients = await this.repository.list();
      return success(clients);
    } catch (error: unknown) {
      if (error instanceof ClientPersistenceError) {
        return failure(error.code, error.message, error.metadata);
      }
      const message = error instanceof Error ? error.message : 'Error listing clients';
      return failure('UNKNOWN_ERROR', message);
    }
  }
}

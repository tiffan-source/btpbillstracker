import { failure, Result, success } from '../../../../core/result/result';
import { Client } from '../entities/client.entity';
import { ClientPersistenceError } from '../errors/client-persistence.error';
import { InvalidClientNameError } from '../errors/invalid-client-name.error';
import { ClientRepository } from '../ports/client.repository';
import { UpdateClientInput } from './update-client.input';

/**
 * Mettre a jour les informations d'un client existant.
 */
export class UpdateClientUseCase {
  constructor(private readonly repository: ClientRepository) {}

  async execute(input: UpdateClientInput): Promise<Result<Client>> {
    try {
      const fullName = `${input.firstName} ${input.lastName}`.trim();
      const client = new Client(input.id, fullName)
        .setFirstName(input.firstName)
        .setLastName(input.lastName);

      if (input.email) {
        client.setEmail(input.email);
      }
      if (input.phone) {
        client.setPhone(input.phone);
      }

      await this.repository.update(client);
      return success(client);
    } catch (error: unknown) {
      if (error instanceof InvalidClientNameError || error instanceof ClientPersistenceError) {
        return failure(error.code, error.message, error.metadata);
      }
      const message = error instanceof Error ? error.message : 'Error updating client';
      return failure('UNKNOWN_ERROR', message);
    }
  }
}

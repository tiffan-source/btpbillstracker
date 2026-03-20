import { Result, success, failure } from '../../../../core/result/result';
import { Client } from '../entities/client.entity';
import { ClientPersistenceError } from '../errors/client-persistence.error';
import { InvalidClientNameError } from '../errors/invalid-client-name.error';
import { ClientRepository } from '../ports/client.repository';
import { CreateQuickClientInput } from './create-quick-client.input';
import { QuickClientCreatorPort } from '../ports/quick-client-creator.port';

export class CreateQuickClientUseCase extends QuickClientCreatorPort {
  constructor(private readonly repository: ClientRepository) {
    super();
  }

  async execute(input: CreateQuickClientInput): Promise<Result<Client>> {
    try {
      const id = crypto.randomUUID();
      const client = new Client(id, input.name);

      if (input.email) {
        client.setEmail(input.email);
      }

      await this.repository.save(client);
      return success(client);
    } catch (error: unknown) {
      if (error instanceof InvalidClientNameError || error instanceof ClientPersistenceError) {
        return failure(error.code, error.message, error.metadata);
      }

      const message = error instanceof Error ? error.message : 'Error creating client';
      return failure('UNKNOWN_ERROR', message);
    }
  }
}

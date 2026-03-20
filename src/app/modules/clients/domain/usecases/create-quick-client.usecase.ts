import { Result, success, failure } from '../../../../core/result/result';
import { Client } from '../entities/client.entity';
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
    } catch (e: any) {
      return failure('CLIENT_CREATION_ERROR', e.message || 'Error creating client');
    }
  }
}

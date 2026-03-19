import { Result, success, failure } from '../../../../core/result/result';
import { Client } from '../entities/client.entity';
import { ClientRepository } from '../ports/client.repository';
import { CreateQuickClientInput } from './create-quick-client.input';

export class CreateQuickClientUseCase {
  constructor(private readonly repository: ClientRepository) {}

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

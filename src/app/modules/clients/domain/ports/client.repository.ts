import { Client } from '../entities/client.entity';

export abstract class ClientRepository {
  abstract save(client: Client): Promise<void>;
}

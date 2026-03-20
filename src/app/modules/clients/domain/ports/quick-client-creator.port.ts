import { Result } from '../../../../core/result/result';
import { Client } from '../entities/client.entity';
import { CreateQuickClientInput } from '../usecases/create-quick-client.input';

/**
 * Port public pour la création rapide de client par les modules consommateurs.
 */
export abstract class QuickClientCreatorPort {
  abstract execute(input: CreateQuickClientInput): Promise<Result<Client>>;
}

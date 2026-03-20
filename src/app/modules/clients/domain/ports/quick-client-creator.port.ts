import { Result } from '../../../../core/result/result';
import { Client } from '../entities/client.entity';
import { CreateQuickClientInput } from '../usecases/create-quick-client.input';

/**
 * Port public pour la création rapide de client par les modules consommateurs.
 */
export abstract class QuickClientCreatorPort {
  /**
   * Créer un client rapide et retourner un résultat normalisé.
   * @throws {InvalidClientNameError} Quand le nom client est invalide.
   * @throws {ClientPersistenceError} Quand la persistance du client échoue.
   */
  abstract execute(input: CreateQuickClientInput): Promise<Result<Client>>;
}

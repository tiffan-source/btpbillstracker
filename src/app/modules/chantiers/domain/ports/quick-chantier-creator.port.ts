import { Result } from '../../../../core/result/result';
import { Chantier } from '../entities/chantier.entity';
import { CreateChantierInput } from '../usecases/create-chantier.input';

/**
 * Port public pour la création rapide de chantier par les modules consommateurs.
 */
export abstract class QuickChantierCreatorPort {
  /**
   * Créer un chantier rapide et retourner un résultat normalisé.
   */
  abstract execute(input: CreateChantierInput): Promise<Result<Chantier>>;
}

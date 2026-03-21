import { Result } from '../../../../core/result/result';

export type ResolveChantierIdInput = {
  chantierName: string;
};

/**
 * Résout un chantier par nom (avec création éventuelle) et retourne son identifiant.
 */
export abstract class ResolveChantierIdPort {
  /**
   * Résoudre l'identifiant chantier à partir d'un nom utilisateur.
   */
  abstract execute(input: ResolveChantierIdInput): Promise<Result<string>>;
}

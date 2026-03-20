import { Chantier } from '../entities/chantier.entity';

export abstract class ChantierRepository {
  /**
   * Persister un chantier.
   * @throws {ChantierPersistenceError} Quand le stockage ne peut pas enregistrer le chantier.
   */
  abstract save(chantier: Chantier): Promise<void>;

  /**
   * Lister les chantiers persistés.
   * @throws {ChantierPersistenceError} Quand le stockage ne peut pas lire les chantiers.
   */
  abstract list(): Promise<Chantier[]>;

  /**
   * Mettre à jour un chantier existant.
   * @throws {ChantierPersistenceError} Quand le stockage ne peut pas mettre à jour le chantier.
   */
  abstract update(chantier: Chantier): Promise<void>;

  /**
   * Vérifier l'unicité du nom de chantier.
   * @throws {ChantierPersistenceError} Quand le stockage ne peut pas vérifier l'unicité.
   */
  abstract existsByName(name: string, excludeId?: string): Promise<boolean>;
}


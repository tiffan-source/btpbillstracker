/**
 * Générer un identifiant unique pour les entités métier.
 */
export abstract class IdGeneratorPort {
  abstract generate(): string;
}


export abstract class ReferenceGeneratorService {
  /**
   * Générer une référence de facture.
   */
  abstract generate(): Promise<string>;
}

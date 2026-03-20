import { Result } from '../../../../core/result/result';

export type ResolveClientInput = {
  isNewClient: boolean;
  clientIdOrName: string;
  clientEmail?: string;
};

export abstract class ClientProviderPort {
  /**
   * Résoudre l'identifiant client à partir d'un client existant ou à créer.
   * @throws {ClientResolutionError} Quand la résolution technique du client échoue.
   */
  abstract resolveClient(input: ResolveClientInput): Promise<Result<string>>;
}

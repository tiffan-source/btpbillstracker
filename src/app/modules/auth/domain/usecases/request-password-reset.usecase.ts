import { Result, failure, success } from '../../../../core/result/result';
import { AuthPersistenceError } from '../errors/auth-persistence.error';
import { AuthIdentityPort } from '../ports/auth-identity.port';

export class RequestPasswordResetUseCase {
  constructor(private readonly identity: AuthIdentityPort) {}

  /**
   * Déclencher l'envoi d'un email de réinitialisation de mot de passe.
   */
  async execute(email: string): Promise<Result<void>> {
    try {
      await this.identity.requestPasswordReset(email);
      return success(undefined);
    } catch (error) {
      if (error instanceof AuthPersistenceError) {
        return failure(error.code, error.message, error.metadata);
      }

      return failure('UNKNOWN_ERROR', 'Une erreur inattendue est survenue.');
    }
  }
}

import { Result, failure, success } from '../../../../core/result/result';
import { AuthPersistenceError } from '../errors/auth-persistence.error';
import { AuthIdentityPort } from '../ports/auth-identity.port';

export class SendEmailVerificationUseCase {
  constructor(private readonly identity: AuthIdentityPort) {}

  /**
   * Renvoyer l'email de vérification pour l'utilisateur courant.
   */
  async execute(): Promise<Result<void>> {
    try {
      await this.identity.sendEmailVerification();
      return success(undefined);
    } catch (error) {
      if (error instanceof AuthPersistenceError) {
        return failure(error.code, error.message, error.metadata);
      }

      return failure('UNKNOWN_ERROR', 'Une erreur inattendue est survenue.');
    }
  }
}

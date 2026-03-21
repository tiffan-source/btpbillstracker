import { Result, failure, success } from '../../../../core/result/result';
import { AuthPersistenceError } from '../errors/auth-persistence.error';
import { AuthUser } from '../models/auth-user.model';
import { AuthIdentityPort } from '../ports/auth-identity.port';

export class LoginWithGoogleUseCase {
  constructor(private readonly identity: AuthIdentityPort) {}

  /**
   * Authentifier un utilisateur avec Google.
   */
  async execute(): Promise<Result<AuthUser>> {
    try {
      const user = await this.identity.loginWithGoogle();
      return success(user);
    } catch (error) {
      if (error instanceof AuthPersistenceError) {
        return failure(error.code, error.message, error.metadata);
      }

      return failure('UNKNOWN_ERROR', 'Une erreur inattendue est survenue.');
    }
  }
}

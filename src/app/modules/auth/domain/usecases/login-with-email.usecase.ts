import { Result, failure, success } from '../../../../core/result/result';
import { AuthEmailNotVerifiedError } from '../errors/auth-email-not-verified.error';
import { AuthPersistenceError } from '../errors/auth-persistence.error';
import { AuthUser } from '../models/auth-user.model';
import { AuthCredentials, AuthIdentityPort } from '../ports/auth-identity.port';

export class LoginWithEmailUseCase {
  constructor(private readonly identity: AuthIdentityPort) {}

  /**
   * Authentifier un utilisateur email/password en imposant une adresse vérifiée.
   */
  async execute(credentials: AuthCredentials): Promise<Result<AuthUser>> {
    try {
      const user = await this.identity.loginWithEmail(credentials);
      if (!user.emailVerified) {
        return failure(
          'AUTH_EMAIL_NOT_VERIFIED',
          "L'adresse email n'est pas encore vérifiée."
        );
      }

      return success(user);
    } catch (error) {
      if (error instanceof AuthEmailNotVerifiedError || error instanceof AuthPersistenceError) {
        return failure(error.code, error.message, error.metadata);
      }

      return failure('UNKNOWN_ERROR', 'Une erreur inattendue est survenue.');
    }
  }
}

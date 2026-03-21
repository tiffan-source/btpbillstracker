import { Result, failure, success } from '../../../../core/result/result';
import { AuthUser } from '../models/auth-user.model';
import { AuthCredentials, AuthIdentityPort } from '../ports/auth-identity.port';
import { AuthPersistenceError } from '../errors/auth-persistence.error';

export class RegisterWithEmailUseCase {
  constructor(private readonly identity: AuthIdentityPort) {}

  /**
   * Inscrire un utilisateur avec email/password et renvoyer l'utilisateur créé.
   */
  async execute(credentials: AuthCredentials): Promise<Result<AuthUser>> {
    try {
      const user = await this.identity.registerWithEmail(credentials);
      return success(user);
    } catch (error) {
      if (error instanceof AuthPersistenceError) {
        return failure(error.code, error.message, error.metadata);
      }

      return failure('UNKNOWN_ERROR', 'Une erreur inattendue est survenue.');
    }
  }
}

import { AuthUser } from '../models/auth-user.model';

export type AuthCredentials = {
  email: string;
  password: string;
};

export abstract class AuthIdentityPort {
  /**
   * Créer un compte email/password et déclencher l'email de vérification.
   */
  abstract registerWithEmail(credentials: AuthCredentials): Promise<AuthUser>;

  /**
   * Authentifier un utilisateur avec email/password.
   */
  abstract loginWithEmail(credentials: AuthCredentials): Promise<AuthUser>;

  /**
   * Authentifier un utilisateur avec Google.
   */
  abstract loginWithGoogle(): Promise<AuthUser>;

  /**
   * Authentifier un utilisateur avec Facebook.
   */
  abstract loginWithFacebook(): Promise<AuthUser>;

  /**
   * Fermer la session courante.
   */
  abstract signOut(): Promise<void>;

  abstract getCurrentUser(): Promise<AuthUser | null>;
}

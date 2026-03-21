import { Inject, Injectable, Optional } from '@angular/core';
import {
  Auth,
  FacebookAuthProvider,
  GoogleAuthProvider,
  User,
  createUserWithEmailAndPassword,
  signInWithPopup,
  getAuth,
  sendEmailVerification,
  signInWithEmailAndPassword,
  signOut
} from 'firebase/auth';
import { getFirebaseApp } from '../../../core/firebase/firebase-app';
import { AuthPersistenceError } from '../domain/errors/auth-persistence.error';
import { AuthCredentials, AuthIdentityPort } from '../domain/ports/auth-identity.port';
import { AuthUser } from '../domain/models/auth-user.model';

export abstract class FirebaseAuthGateway {
  abstract getAuth(): Auth;
  abstract createUser(auth: Auth, email: string, password: string): Promise<{ user: User }>;
  abstract sendVerificationEmail(user: User): Promise<void>;
  abstract signIn(auth: Auth, email: string, password: string): Promise<{ user: User }>;
  abstract signInWithGoogle(auth: Auth): Promise<{ user: User }>;
  abstract signInWithFacebook(auth: Auth): Promise<{ user: User }>;
  abstract signOut(auth: Auth): Promise<void>;
}

class DefaultFirebaseAuthGateway extends FirebaseAuthGateway {
  getAuth(): Auth {
    return getAuth(getFirebaseApp());
  }

  createUser(auth: Auth, email: string, password: string): Promise<{ user: User }> {
    return createUserWithEmailAndPassword(auth, email, password);
  }

  sendVerificationEmail(user: User): Promise<void> {
    return sendEmailVerification(user);
  }

  signIn(auth: Auth, email: string, password: string): Promise<{ user: User }> {
    return signInWithEmailAndPassword(auth, email, password);
  }

  signInWithGoogle(auth: Auth): Promise<{ user: User }> {
    const provider = new GoogleAuthProvider();
    return signInWithPopup(auth, provider);
  }

  signInWithFacebook(auth: Auth): Promise<{ user: User }> {
    const provider = new FacebookAuthProvider();
    return signInWithPopup(auth, provider);
  }

  signOut(auth: Auth): Promise<void> {
    return signOut(auth);
  }
}

const defaultFirebaseAuthGateway = new DefaultFirebaseAuthGateway();

@Injectable({ providedIn: 'root' })
export class FirebaseAuthIdentity extends AuthIdentityPort {
  private readonly auth: Auth;
  private readonly gateway: FirebaseAuthGateway;

  constructor(@Optional() @Inject(FirebaseAuthGateway) gateway: FirebaseAuthGateway | null = null) {
    super();
    this.gateway = gateway ?? defaultFirebaseAuthGateway;
    this.auth = this.gateway.getAuth();
  }

  /**
   * Créer un compte email/password et envoyer la vérification email.
   */
  async registerWithEmail(credentials: AuthCredentials): Promise<AuthUser> {
    try {
      const result = await this.gateway.createUser(this.auth, credentials.email, credentials.password);
      await this.gateway.sendVerificationEmail(result.user);
      return this.mapUser(result.user);
    } catch (error) {
      throw new AuthPersistenceError("Impossible de créer l'utilisateur.", error);
    }
  }

  /**
   * Connecter un utilisateur avec email/password.
   */
  async loginWithEmail(credentials: AuthCredentials): Promise<AuthUser> {
    try {
      const result = await this.gateway.signIn(this.auth, credentials.email, credentials.password);
      return this.mapUser(result.user);
    } catch (error) {
      throw new AuthPersistenceError('Connexion impossible avec ces identifiants.', error);
    }
  }

  /**
   * Connecter un utilisateur via Google OAuth.
   */
  async loginWithGoogle(): Promise<AuthUser> {
    try {
      const result = await this.gateway.signInWithGoogle(this.auth);
      return this.mapUser(result.user);
    } catch (error) {
      throw new AuthPersistenceError('Connexion Google impossible.', error);
    }
  }

  /**
   * Connecter un utilisateur via Facebook OAuth.
   */
  async loginWithFacebook(): Promise<AuthUser> {
    try {
      const result = await this.gateway.signInWithFacebook(this.auth);
      return this.mapUser(result.user);
    } catch (error) {
      throw new AuthPersistenceError('Connexion Facebook impossible.', error);
    }
  }

  /**
   * Fermer la session courante.
   */
  async signOut(): Promise<void> {
    try {
      await this.gateway.signOut(this.auth);
    } catch (error) {
      throw new AuthPersistenceError('Impossible de fermer la session.', error);
    }
  }

  async getCurrentUser(): Promise<AuthUser | null> {
    return this.auth.currentUser ? this.mapUser(this.auth.currentUser) : null;
  }

  private mapUser(user: User): AuthUser {
    return {
      uid: user.uid,
      email: user.email ?? '',
      emailVerified: user.emailVerified,
      displayName: user.displayName ?? undefined
    };
  }
}

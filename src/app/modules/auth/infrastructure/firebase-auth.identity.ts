import { Injectable } from '@angular/core';
import { AuthIdentityPort } from '../domain/ports/auth-identity.port';
import { AuthUser } from '../domain/models/auth-user.model';

@Injectable({ providedIn: 'root' })
export class FirebaseAuthIdentity extends AuthIdentityPort {
  async getCurrentUser(): Promise<AuthUser | null> {
    return null;
  }
}

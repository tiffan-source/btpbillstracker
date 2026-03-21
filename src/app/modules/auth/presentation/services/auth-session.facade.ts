import { Injectable, computed, signal } from '@angular/core';
import { AuthUser } from '../../domain/models/auth-user.model';

@Injectable({ providedIn: 'root' })
export class AuthSessionFacade {
  private readonly userState = signal<AuthUser | null>(null);

  readonly user = computed(() => this.userState());
  readonly isAuthenticated = computed(() => this.userState() !== null);

  setUser(user: AuthUser | null): void {
    this.userState.set(user);
  }
}

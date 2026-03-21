import { Injectable, computed, signal } from '@angular/core';
import { AuthUser } from '../../domain/models/auth-user.model';
import { LoginWithEmailUseCase } from '../../domain/usecases/login-with-email.usecase';
import { RegisterWithEmailUseCase } from '../../domain/usecases/register-with-email.usecase';

@Injectable({ providedIn: 'root' })
export class AuthSessionFacade {
  private readonly userState = signal<AuthUser | null>(null);
  private readonly errorState = signal<string | null>(null);
  private readonly isSubmittingState = signal(false);

  readonly user = computed(() => this.userState());
  readonly isAuthenticated = computed(() => this.userState() !== null);
  readonly error = computed(() => this.errorState());
  readonly isSubmitting = computed(() => this.isSubmittingState());

  constructor(
    private readonly registerWithEmailUseCase: RegisterWithEmailUseCase,
    private readonly loginWithEmailUseCase: LoginWithEmailUseCase
  ) {}

  setUser(user: AuthUser | null): void {
    this.userState.set(user);
  }

  async registerWithEmail(email: string, password: string): Promise<boolean> {
    this.errorState.set(null);
    this.isSubmittingState.set(true);
    const result = await this.registerWithEmailUseCase.execute({ email, password });
    this.isSubmittingState.set(false);

    if (!result.success) {
      this.errorState.set(result.error.message);
      return false;
    }

    this.userState.set(result.data);
    return true;
  }

  async loginWithEmail(email: string, password: string): Promise<boolean> {
    this.errorState.set(null);
    this.isSubmittingState.set(true);
    const result = await this.loginWithEmailUseCase.execute({ email, password });
    this.isSubmittingState.set(false);

    if (!result.success) {
      this.errorState.set(result.error.message);
      return false;
    }

    this.userState.set(result.data);
    return true;
  }
}

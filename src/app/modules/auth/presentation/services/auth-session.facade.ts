import { Injectable, computed, signal } from '@angular/core';
import { AuthUser } from '../../domain/models/auth-user.model';
import { GetCurrentUserUseCase } from '../../domain/usecases/get-current-user.usecase';
import { LoginWithFacebookUseCase } from '../../domain/usecases/login-with-facebook.usecase';
import { LoginWithGoogleUseCase } from '../../domain/usecases/login-with-google.usecase';
import { LoginWithEmailUseCase } from '../../domain/usecases/login-with-email.usecase';
import { RequestPasswordResetUseCase } from '../../domain/usecases/request-password-reset.usecase';
import { RegisterWithEmailUseCase } from '../../domain/usecases/register-with-email.usecase';
import { SendEmailVerificationUseCase } from '../../domain/usecases/send-email-verification.usecase';
import { SignOutUseCase } from '../../domain/usecases/sign-out.usecase';

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
    private readonly loginWithEmailUseCase: LoginWithEmailUseCase,
    private readonly loginWithGoogleUseCase: LoginWithGoogleUseCase,
    private readonly loginWithFacebookUseCase: LoginWithFacebookUseCase,
    private readonly requestPasswordResetUseCase: RequestPasswordResetUseCase,
    private readonly sendEmailVerificationUseCase: SendEmailVerificationUseCase,
    private readonly signOutUseCase: SignOutUseCase,
    private readonly getCurrentUserUseCase: GetCurrentUserUseCase
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

  async loginWithGoogle(): Promise<boolean> {
    this.errorState.set(null);
    this.isSubmittingState.set(true);
    const result = await this.loginWithGoogleUseCase.execute();
    this.isSubmittingState.set(false);

    if (!result.success) {
      this.errorState.set(result.error.message);
      return false;
    }

    this.userState.set(result.data);
    return true;
  }

  async loginWithFacebook(): Promise<boolean> {
    this.errorState.set(null);
    this.isSubmittingState.set(true);
    const result = await this.loginWithFacebookUseCase.execute();
    this.isSubmittingState.set(false);

    if (!result.success) {
      this.errorState.set(result.error.message);
      return false;
    }

    this.userState.set(result.data);
    return true;
  }

  async requestPasswordReset(email: string): Promise<boolean> {
    this.errorState.set(null);
    this.isSubmittingState.set(true);
    const result = await this.requestPasswordResetUseCase.execute(email);
    this.isSubmittingState.set(false);

    if (!result.success) {
      this.errorState.set(result.error.message);
      return false;
    }

    return true;
  }

  async sendEmailVerification(): Promise<boolean> {
    this.errorState.set(null);
    this.isSubmittingState.set(true);
    const result = await this.sendEmailVerificationUseCase.execute();
    this.isSubmittingState.set(false);

    if (!result.success) {
      this.errorState.set(result.error.message);
      return false;
    }

    return true;
  }

  async signOut(): Promise<boolean> {
    this.errorState.set(null);
    this.isSubmittingState.set(true);
    const result = await this.signOutUseCase.execute();
    this.isSubmittingState.set(false);

    if (!result.success) {
      this.errorState.set(result.error.message);
      return false;
    }

    this.userState.set(null);
    return true;
  }

  async refreshCurrentUser(): Promise<void> {
    const result = await this.getCurrentUserUseCase.execute();

    if (!result.success) {
      this.errorState.set(result.error.message);
      return;
    }

    this.userState.set(result.data);
  }
}

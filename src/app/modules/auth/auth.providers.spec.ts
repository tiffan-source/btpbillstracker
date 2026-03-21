import { TestBed } from '@angular/core/testing';
import { AuthIdentityPort } from './domain/ports/auth-identity.port';
import { GetCurrentUserUseCase } from './domain/usecases/get-current-user.usecase';
import { LoginWithFacebookUseCase } from './domain/usecases/login-with-facebook.usecase';
import { LoginWithEmailUseCase } from './domain/usecases/login-with-email.usecase';
import { LoginWithGoogleUseCase } from './domain/usecases/login-with-google.usecase';
import { RequestPasswordResetUseCase } from './domain/usecases/request-password-reset.usecase';
import { RegisterWithEmailUseCase } from './domain/usecases/register-with-email.usecase';
import { SendEmailVerificationUseCase } from './domain/usecases/send-email-verification.usecase';
import { SignOutUseCase } from './domain/usecases/sign-out.usecase';
import { FirebaseAuthIdentity } from './infrastructure/firebase-auth.identity';
import { AUTH_PROVIDERS } from './auth.providers';

describe('AUTH_PROVIDERS', () => {
  it('binds AuthIdentityPort to FirebaseAuthIdentity', () => {
    const binding = AUTH_PROVIDERS.find((provider) => 'provide' in provider && provider.provide === AuthIdentityPort);

    expect(binding && 'useClass' in binding ? binding.useClass : null).toBe(FirebaseAuthIdentity);
  });

  it('resolves register and login use cases from DI', () => {
    TestBed.configureTestingModule({
      providers: AUTH_PROVIDERS
    });

    const registerUseCase = TestBed.inject(RegisterWithEmailUseCase);
    const loginUseCase = TestBed.inject(LoginWithEmailUseCase);
    const googleUseCase = TestBed.inject(LoginWithGoogleUseCase);
    const facebookUseCase = TestBed.inject(LoginWithFacebookUseCase);
    const resetUseCase = TestBed.inject(RequestPasswordResetUseCase);
    const sendVerificationUseCase = TestBed.inject(SendEmailVerificationUseCase);
    const signOutUseCase = TestBed.inject(SignOutUseCase);
    const getCurrentUserUseCase = TestBed.inject(GetCurrentUserUseCase);

    expect(registerUseCase).toBeInstanceOf(RegisterWithEmailUseCase);
    expect(loginUseCase).toBeInstanceOf(LoginWithEmailUseCase);
    expect(googleUseCase).toBeInstanceOf(LoginWithGoogleUseCase);
    expect(facebookUseCase).toBeInstanceOf(LoginWithFacebookUseCase);
    expect(resetUseCase).toBeInstanceOf(RequestPasswordResetUseCase);
    expect(sendVerificationUseCase).toBeInstanceOf(SendEmailVerificationUseCase);
    expect(signOutUseCase).toBeInstanceOf(SignOutUseCase);
    expect(getCurrentUserUseCase).toBeInstanceOf(GetCurrentUserUseCase);
  });
});

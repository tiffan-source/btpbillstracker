import { TestBed } from '@angular/core/testing';
import { AuthIdentityPort } from './domain/ports/auth-identity.port';
import { LoginWithFacebookUseCase } from './domain/usecases/login-with-facebook.usecase';
import { LoginWithEmailUseCase } from './domain/usecases/login-with-email.usecase';
import { LoginWithGoogleUseCase } from './domain/usecases/login-with-google.usecase';
import { RegisterWithEmailUseCase } from './domain/usecases/register-with-email.usecase';
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

    expect(registerUseCase).toBeInstanceOf(RegisterWithEmailUseCase);
    expect(loginUseCase).toBeInstanceOf(LoginWithEmailUseCase);
    expect(googleUseCase).toBeInstanceOf(LoginWithGoogleUseCase);
    expect(facebookUseCase).toBeInstanceOf(LoginWithFacebookUseCase);
  });
});

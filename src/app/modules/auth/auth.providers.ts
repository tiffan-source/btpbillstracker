import { Provider } from '@angular/core';
import { LoginWithFacebookUseCase } from './domain/usecases/login-with-facebook.usecase';
import { LoginWithEmailUseCase } from './domain/usecases/login-with-email.usecase';
import { LoginWithGoogleUseCase } from './domain/usecases/login-with-google.usecase';
import { RegisterWithEmailUseCase } from './domain/usecases/register-with-email.usecase';
import { AuthIdentityPort } from './domain/ports/auth-identity.port';
import { FirebaseAuthIdentity } from './infrastructure/firebase-auth.identity';

export const AUTH_PROVIDERS: Provider[] = [
  {
    provide: AuthIdentityPort,
    useClass: FirebaseAuthIdentity
  },
  {
    provide: RegisterWithEmailUseCase,
    useFactory: (identity: AuthIdentityPort) => new RegisterWithEmailUseCase(identity),
    deps: [AuthIdentityPort]
  },
  {
    provide: LoginWithEmailUseCase,
    useFactory: (identity: AuthIdentityPort) => new LoginWithEmailUseCase(identity),
    deps: [AuthIdentityPort]
  },
  {
    provide: LoginWithGoogleUseCase,
    useFactory: (identity: AuthIdentityPort) => new LoginWithGoogleUseCase(identity),
    deps: [AuthIdentityPort]
  },
  {
    provide: LoginWithFacebookUseCase,
    useFactory: (identity: AuthIdentityPort) => new LoginWithFacebookUseCase(identity),
    deps: [AuthIdentityPort]
  }
];

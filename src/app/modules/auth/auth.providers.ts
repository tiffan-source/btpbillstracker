import { Provider } from '@angular/core';
import { LoginWithEmailUseCase } from './domain/usecases/login-with-email.usecase';
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
  }
];

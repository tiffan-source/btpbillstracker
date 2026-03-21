import { Provider } from '@angular/core';
import { GetCurrentUserUseCase } from './domain/usecases/get-current-user.usecase';
import { LoginWithFacebookUseCase } from './domain/usecases/login-with-facebook.usecase';
import { LoginWithEmailUseCase } from './domain/usecases/login-with-email.usecase';
import { LoginWithGoogleUseCase } from './domain/usecases/login-with-google.usecase';
import { RequestPasswordResetUseCase } from './domain/usecases/request-password-reset.usecase';
import { RegisterWithEmailUseCase } from './domain/usecases/register-with-email.usecase';
import { SendEmailVerificationUseCase } from './domain/usecases/send-email-verification.usecase';
import { SignOutUseCase } from './domain/usecases/sign-out.usecase';
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
  },
  {
    provide: RequestPasswordResetUseCase,
    useFactory: (identity: AuthIdentityPort) => new RequestPasswordResetUseCase(identity),
    deps: [AuthIdentityPort]
  },
  {
    provide: SendEmailVerificationUseCase,
    useFactory: (identity: AuthIdentityPort) => new SendEmailVerificationUseCase(identity),
    deps: [AuthIdentityPort]
  },
  {
    provide: SignOutUseCase,
    useFactory: (identity: AuthIdentityPort) => new SignOutUseCase(identity),
    deps: [AuthIdentityPort]
  },
  {
    provide: GetCurrentUserUseCase,
    useFactory: (identity: AuthIdentityPort) => new GetCurrentUserUseCase(identity),
    deps: [AuthIdentityPort]
  }
];

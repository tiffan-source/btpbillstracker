import { success } from '../../../../core/result/result';
import { GetCurrentUserUseCase } from '../../domain/usecases/get-current-user.usecase';
import { LoginWithFacebookUseCase } from '../../domain/usecases/login-with-facebook.usecase';
import { LoginWithGoogleUseCase } from '../../domain/usecases/login-with-google.usecase';
import { LoginWithEmailUseCase } from '../../domain/usecases/login-with-email.usecase';
import { RequestPasswordResetUseCase } from '../../domain/usecases/request-password-reset.usecase';
import { RegisterWithEmailUseCase } from '../../domain/usecases/register-with-email.usecase';
import { SendEmailVerificationUseCase } from '../../domain/usecases/send-email-verification.usecase';
import { SignOutUseCase } from '../../domain/usecases/sign-out.usecase';
import { AuthSessionFacade } from './auth-session.facade';

describe('AuthSessionFacade', () => {
  const createRegisterUseCase = () =>
    ({
      execute: vi.fn()
    }) as unknown as RegisterWithEmailUseCase;
  const createLoginUseCase = () =>
    ({
      execute: vi.fn()
    }) as unknown as LoginWithEmailUseCase;
  const createGoogleUseCase = () =>
    ({
      execute: vi.fn()
    }) as unknown as LoginWithGoogleUseCase;
  const createFacebookUseCase = () =>
    ({
      execute: vi.fn()
    }) as unknown as LoginWithFacebookUseCase;
  const createResetUseCase = () =>
    ({
      execute: vi.fn()
    }) as unknown as RequestPasswordResetUseCase;
  const createSendVerificationUseCase = () =>
    ({
      execute: vi.fn()
    }) as unknown as SendEmailVerificationUseCase;
  const createSignOutUseCase = () =>
    ({
      execute: vi.fn()
    }) as unknown as SignOutUseCase;
  const createCurrentUserUseCase = () =>
    ({
      execute: vi.fn()
    }) as unknown as GetCurrentUserUseCase;

  const createFacade = (overrides?: {
    register?: RegisterWithEmailUseCase;
    login?: LoginWithEmailUseCase;
    google?: LoginWithGoogleUseCase;
    facebook?: LoginWithFacebookUseCase;
    reset?: RequestPasswordResetUseCase;
    sendVerification?: SendEmailVerificationUseCase;
    signOut?: SignOutUseCase;
    currentUser?: GetCurrentUserUseCase;
  }) =>
    new AuthSessionFacade(
      overrides?.register ?? createRegisterUseCase(),
      overrides?.login ?? createLoginUseCase(),
      overrides?.google ?? createGoogleUseCase(),
      overrides?.facebook ?? createFacebookUseCase(),
      overrides?.reset ?? createResetUseCase(),
      overrides?.sendVerification ?? createSendVerificationUseCase(),
      overrides?.signOut ?? createSignOutUseCase(),
      overrides?.currentUser ?? createCurrentUserUseCase()
    );

  it('exposes authentication state through signals', () => {
    const facade = createFacade();

    expect(facade.isAuthenticated()).toBe(false);
    expect(facade.user()).toBeNull();

    facade.setUser({ uid: 'u-1', email: 'user@example.com', emailVerified: true });
    expect(facade.isAuthenticated()).toBe(true);
    expect(facade.user()?.uid).toBe('u-1');
  });

  it('requests password reset and keeps success state', async () => {
    const resetUseCase = {
      execute: vi.fn().mockResolvedValue(success(undefined))
    } as unknown as RequestPasswordResetUseCase;
    const facade = createFacade({ reset: resetUseCase });

    const ok = await facade.requestPasswordReset('user@example.com');

    expect(ok).toBe(true);
    expect(facade.error()).toBeNull();
  });

  it('stores explicit error when resend verification fails', async () => {
    const sendVerificationUseCase = {
      execute: vi.fn().mockResolvedValue({
        success: false,
        error: {
          code: 'AUTH_PERSISTENCE_ERROR',
          message: "Impossible de renvoyer l'email de vérification."
        }
      })
    } as unknown as SendEmailVerificationUseCase;
    const facade = createFacade({ sendVerification: sendVerificationUseCase });

    const ok = await facade.sendEmailVerification();

    expect(ok).toBe(false);
    expect(facade.error()).toBe("Impossible de renvoyer l'email de vérification.");
  });

  it('clears current user after successful sign-out', async () => {
    const signOutUseCase = {
      execute: vi.fn().mockResolvedValue(success(undefined))
    } as unknown as SignOutUseCase;
    const facade = createFacade({ signOut: signOutUseCase });
    facade.setUser({ uid: 'u-1', email: 'user@example.com', emailVerified: true });

    const ok = await facade.signOut();

    expect(ok).toBe(true);
    expect(facade.user()).toBeNull();
    expect(facade.isAuthenticated()).toBe(false);
  });

  it('refreshes session from current user use case', async () => {
    const currentUserUseCase = {
      execute: vi.fn().mockResolvedValue(
        success({
          uid: 'u-2',
          email: 'refreshed@example.com',
          emailVerified: true
        })
      )
    } as unknown as GetCurrentUserUseCase;
    const facade = createFacade({ currentUser: currentUserUseCase });

    await facade.refreshCurrentUser();

    expect(facade.user()?.uid).toBe('u-2');
  });
});

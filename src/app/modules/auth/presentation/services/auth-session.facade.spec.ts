import { AuthSessionFacade } from './auth-session.facade';
import { LoginWithEmailUseCase } from '../../domain/usecases/login-with-email.usecase';
import { RegisterWithEmailUseCase } from '../../domain/usecases/register-with-email.usecase';
import { success } from '../../../../core/result/result';

describe('AuthSessionFacade', () => {
  it('exposes authentication state through signals', () => {
    const registerUseCase = {
      execute: vi.fn()
    } as unknown as RegisterWithEmailUseCase;
    const loginUseCase = {
      execute: vi.fn()
    } as unknown as LoginWithEmailUseCase;
    const facade = new AuthSessionFacade(registerUseCase, loginUseCase);

    expect(facade.isAuthenticated()).toBe(false);
    expect(facade.user()).toBeNull();

    facade.setUser({ uid: 'u-1', email: 'user@example.com', emailVerified: true });
    expect(facade.isAuthenticated()).toBe(true);
    expect(facade.user()?.uid).toBe('u-1');
  });

  it('sets authenticated user after successful register', async () => {
    const registerUseCase = {
      execute: vi.fn().mockResolvedValue(
        success({
          uid: 'u-2',
          email: 'new@example.com',
          emailVerified: false
        })
      )
    } as unknown as RegisterWithEmailUseCase;
    const loginUseCase = {
      execute: vi.fn()
    } as unknown as LoginWithEmailUseCase;
    const facade = new AuthSessionFacade(registerUseCase, loginUseCase);

    const ok = await facade.registerWithEmail('new@example.com', 'Password123!');

    expect(ok).toBe(true);
    expect(facade.user()?.uid).toBe('u-2');
    expect(facade.error()).toBeNull();
  });

  it('stores explicit error when login is denied for non-verified email', async () => {
    const registerUseCase = {
      execute: vi.fn()
    } as unknown as RegisterWithEmailUseCase;
    const loginUseCase = {
      execute: vi.fn().mockResolvedValue({
        success: false,
        error: {
          code: 'AUTH_EMAIL_NOT_VERIFIED',
          message: "L'adresse email n'est pas encore vérifiée."
        }
      })
    } as unknown as LoginWithEmailUseCase;
    const facade = new AuthSessionFacade(registerUseCase, loginUseCase);

    const ok = await facade.loginWithEmail('user@example.com', 'Password123!');

    expect(ok).toBe(false);
    expect(facade.user()).toBeNull();
    expect(facade.error()).toBe("L'adresse email n'est pas encore vérifiée.");
  });
});

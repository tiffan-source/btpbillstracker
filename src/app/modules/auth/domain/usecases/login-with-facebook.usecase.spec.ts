import { AuthPersistenceError } from '../errors/auth-persistence.error';
import { AuthIdentityPort } from '../ports/auth-identity.port';
import { LoginWithFacebookUseCase } from './login-with-facebook.usecase';

describe('LoginWithFacebookUseCase', () => {
  const createIdentity = (): AuthIdentityPort =>
    ({
      registerWithEmail: vi.fn(),
      loginWithEmail: vi.fn(),
      loginWithGoogle: vi.fn(),
      loginWithFacebook: vi.fn(),
      signOut: vi.fn(),
      getCurrentUser: vi.fn()
    }) as unknown as AuthIdentityPort;

  it('returns success when Facebook login succeeds', async () => {
    const identity = createIdentity();
    vi.mocked(identity.loginWithFacebook).mockResolvedValue({
      uid: 'facebook-u-1',
      email: 'user@facebookmail.com',
      emailVerified: true
    });
    const useCase = new LoginWithFacebookUseCase(identity);

    const result = await useCase.execute();

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.uid).toBe('facebook-u-1');
    }
  });

  it('maps provider failure to AuthPersistenceError failure result', async () => {
    const identity = createIdentity();
    vi.mocked(identity.loginWithFacebook).mockRejectedValue(
      new AuthPersistenceError('Connexion Facebook impossible.')
    );
    const useCase = new LoginWithFacebookUseCase(identity);

    const result = await useCase.execute();

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.code).toBe('AUTH_PERSISTENCE_ERROR');
    }
  });
});

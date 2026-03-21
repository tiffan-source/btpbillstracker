import { AuthPersistenceError } from '../errors/auth-persistence.error';
import { AuthIdentityPort } from '../ports/auth-identity.port';
import { LoginWithGoogleUseCase } from './login-with-google.usecase';

describe('LoginWithGoogleUseCase', () => {
  const createIdentity = (): AuthIdentityPort =>
    ({
      registerWithEmail: vi.fn(),
      loginWithEmail: vi.fn(),
      loginWithGoogle: vi.fn(),
      loginWithFacebook: vi.fn(),
      signOut: vi.fn(),
      getCurrentUser: vi.fn()
    }) as unknown as AuthIdentityPort;

  it('returns success when Google login succeeds', async () => {
    const identity = createIdentity();
    vi.mocked(identity.loginWithGoogle).mockResolvedValue({
      uid: 'google-u-1',
      email: 'user@gmail.com',
      emailVerified: true
    });
    const useCase = new LoginWithGoogleUseCase(identity);

    const result = await useCase.execute();

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.uid).toBe('google-u-1');
    }
  });

  it('maps provider failure to AuthPersistenceError failure result', async () => {
    const identity = createIdentity();
    vi.mocked(identity.loginWithGoogle).mockRejectedValue(
      new AuthPersistenceError('Connexion Google impossible.')
    );
    const useCase = new LoginWithGoogleUseCase(identity);

    const result = await useCase.execute();

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.code).toBe('AUTH_PERSISTENCE_ERROR');
    }
  });
});

import { AuthPersistenceError } from '../errors/auth-persistence.error';
import { AuthIdentityPort } from '../ports/auth-identity.port';
import { LoginWithEmailUseCase } from './login-with-email.usecase';

describe('LoginWithEmailUseCase', () => {
  const createIdentity = (): AuthIdentityPort =>
    ({
      registerWithEmail: vi.fn(),
      loginWithEmail: vi.fn(),
      signOut: vi.fn(),
      getCurrentUser: vi.fn()
    }) as unknown as AuthIdentityPort;

  it('returns failure when logged user email is not verified', async () => {
    const identity = createIdentity();
    vi.mocked(identity.loginWithEmail).mockResolvedValue({
      uid: 'u-1',
      email: 'user@example.com',
      emailVerified: false
    });
    const useCase = new LoginWithEmailUseCase(identity);

    const result = await useCase.execute({
      email: 'user@example.com',
      password: 'Password123!'
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.code).toBe('AUTH_EMAIL_NOT_VERIFIED');
    }
  });

  it('returns success when logged user email is verified', async () => {
    const identity = createIdentity();
    vi.mocked(identity.loginWithEmail).mockResolvedValue({
      uid: 'u-1',
      email: 'user@example.com',
      emailVerified: true
    });
    const useCase = new LoginWithEmailUseCase(identity);

    const result = await useCase.execute({
      email: 'user@example.com',
      password: 'Password123!'
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.uid).toBe('u-1');
    }
  });

  it('returns mapped failure for persistence errors', async () => {
    const identity = createIdentity();
    vi.mocked(identity.loginWithEmail).mockRejectedValue(
      new AuthPersistenceError('Identifiants invalides.')
    );
    const useCase = new LoginWithEmailUseCase(identity);

    const result = await useCase.execute({
      email: 'user@example.com',
      password: 'Password123!'
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.code).toBe('AUTH_PERSISTENCE_ERROR');
    }
  });
});

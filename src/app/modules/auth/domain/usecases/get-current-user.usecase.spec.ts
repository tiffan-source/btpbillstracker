import { AuthPersistenceError } from '../errors/auth-persistence.error';
import { AuthIdentityPort } from '../ports/auth-identity.port';
import { GetCurrentUserUseCase } from './get-current-user.usecase';

describe('GetCurrentUserUseCase', () => {
  const createIdentity = (): AuthIdentityPort =>
    ({
      registerWithEmail: vi.fn(),
      loginWithEmail: vi.fn(),
      loginWithGoogle: vi.fn(),
      loginWithFacebook: vi.fn(),
      requestPasswordReset: vi.fn(),
      sendEmailVerification: vi.fn(),
      signOut: vi.fn(),
      getCurrentUser: vi.fn()
    }) as unknown as AuthIdentityPort;

  it('returns current user when available', async () => {
    const identity = createIdentity();
    vi.mocked(identity.getCurrentUser).mockResolvedValue({
      uid: 'u-1',
      email: 'user@example.com',
      emailVerified: true
    });
    const useCase = new GetCurrentUserUseCase(identity);

    const result = await useCase.execute();

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data?.uid).toBe('u-1');
    }
  });

  it('maps identity failures to failure result', async () => {
    const identity = createIdentity();
    vi.mocked(identity.getCurrentUser).mockRejectedValue(new AuthPersistenceError('Session indisponible.'));
    const useCase = new GetCurrentUserUseCase(identity);

    const result = await useCase.execute();

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.code).toBe('AUTH_PERSISTENCE_ERROR');
    }
  });
});

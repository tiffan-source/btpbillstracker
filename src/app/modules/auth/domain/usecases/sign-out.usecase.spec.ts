import { AuthPersistenceError } from '../errors/auth-persistence.error';
import { AuthIdentityPort } from '../ports/auth-identity.port';
import { SignOutUseCase } from './sign-out.usecase';

describe('SignOutUseCase', () => {
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

  it('returns success when sign-out succeeds', async () => {
    const identity = createIdentity();
    vi.mocked(identity.signOut).mockResolvedValue(undefined);
    const useCase = new SignOutUseCase(identity);

    const result = await useCase.execute();

    expect(result.success).toBe(true);
    expect(identity.signOut).toHaveBeenCalled();
  });

  it('returns failure when sign-out fails', async () => {
    const identity = createIdentity();
    vi.mocked(identity.signOut).mockRejectedValue(new AuthPersistenceError('Déconnexion impossible.'));
    const useCase = new SignOutUseCase(identity);

    const result = await useCase.execute();

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.code).toBe('AUTH_PERSISTENCE_ERROR');
    }
  });
});

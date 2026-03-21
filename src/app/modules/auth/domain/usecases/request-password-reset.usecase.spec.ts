import { AuthPersistenceError } from '../errors/auth-persistence.error';
import { AuthIdentityPort } from '../ports/auth-identity.port';
import { RequestPasswordResetUseCase } from './request-password-reset.usecase';

describe('RequestPasswordResetUseCase', () => {
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

  it('returns success when reset password email is sent', async () => {
    const identity = createIdentity();
    vi.mocked(identity.requestPasswordReset).mockResolvedValue(undefined);
    const useCase = new RequestPasswordResetUseCase(identity);

    const result = await useCase.execute('user@example.com');

    expect(result.success).toBe(true);
    expect(identity.requestPasswordReset).toHaveBeenCalledWith('user@example.com');
  });

  it('returns failure when reset password sending fails', async () => {
    const identity = createIdentity();
    vi.mocked(identity.requestPasswordReset).mockRejectedValue(
      new AuthPersistenceError('Réinitialisation impossible.')
    );
    const useCase = new RequestPasswordResetUseCase(identity);

    const result = await useCase.execute('user@example.com');

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.code).toBe('AUTH_PERSISTENCE_ERROR');
    }
  });
});

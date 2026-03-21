import { AuthPersistenceError } from '../errors/auth-persistence.error';
import { AuthIdentityPort } from '../ports/auth-identity.port';
import { SendEmailVerificationUseCase } from './send-email-verification.usecase';

describe('SendEmailVerificationUseCase', () => {
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

  it('returns success when verification email is resent', async () => {
    const identity = createIdentity();
    vi.mocked(identity.sendEmailVerification).mockResolvedValue(undefined);
    const useCase = new SendEmailVerificationUseCase(identity);

    const result = await useCase.execute();

    expect(result.success).toBe(true);
    expect(identity.sendEmailVerification).toHaveBeenCalled();
  });

  it('returns failure when resend verification fails', async () => {
    const identity = createIdentity();
    vi.mocked(identity.sendEmailVerification).mockRejectedValue(
      new AuthPersistenceError("Impossible de renvoyer l'email.")
    );
    const useCase = new SendEmailVerificationUseCase(identity);

    const result = await useCase.execute();

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.code).toBe('AUTH_PERSISTENCE_ERROR');
    }
  });
});

import { AuthPersistenceError } from '../errors/auth-persistence.error';
import { AuthIdentityPort } from '../ports/auth-identity.port';
import { RegisterWithEmailUseCase } from './register-with-email.usecase';

describe('RegisterWithEmailUseCase', () => {
  const createIdentity = (): AuthIdentityPort =>
    ({
      registerWithEmail: vi.fn(),
      loginWithEmail: vi.fn(),
      signOut: vi.fn(),
      getCurrentUser: vi.fn()
    }) as unknown as AuthIdentityPort;

  it('returns created user when register succeeds', async () => {
    const identity = createIdentity();
    vi.mocked(identity.registerWithEmail).mockResolvedValue({
      uid: 'u-1',
      email: 'user@example.com',
      emailVerified: false
    });
    const useCase = new RegisterWithEmailUseCase(identity);

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
    vi.mocked(identity.registerWithEmail).mockRejectedValue(
      new AuthPersistenceError("Impossible de créer l'utilisateur.")
    );
    const useCase = new RegisterWithEmailUseCase(identity);

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

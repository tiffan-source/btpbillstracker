import { AuthPersistenceError } from '../domain/errors/auth-persistence.error';
import { FirebaseAuthGateway, FirebaseAuthIdentity } from './firebase-auth.identity';

describe('FirebaseAuthIdentity', () => {
  const buildGateway = (): FirebaseAuthGateway => {
    const auth = {} as never;
    return {
      getAuth: vi.fn().mockReturnValue(auth),
      createUser: vi.fn(),
      sendVerificationEmail: vi.fn(),
      signIn: vi.fn(),
      signOut: vi.fn()
    };
  };

  it('registers and sends email verification', async () => {
    const gateway = buildGateway();
    vi.mocked(gateway.createUser).mockResolvedValue({
      user: {
        uid: 'u-1',
        email: 'user@example.com',
        emailVerified: false,
        displayName: null
      } as never
    });
    vi.mocked(gateway.sendVerificationEmail).mockResolvedValue(undefined);
    const identity = new FirebaseAuthIdentity(gateway);

    const user = await identity.registerWithEmail({
      email: 'user@example.com',
      password: 'Password123!'
    });

    expect(gateway.createUser).toHaveBeenCalled();
    expect(gateway.sendVerificationEmail).toHaveBeenCalled();
    expect(user.email).toBe('user@example.com');
    expect(user.emailVerified).toBe(false);
  });

  it('maps firebase register failure to AuthPersistenceError', async () => {
    const gateway = buildGateway();
    vi.mocked(gateway.createUser).mockRejectedValue(new Error('firebase down'));
    const identity = new FirebaseAuthIdentity(gateway);

    await expect(
      identity.registerWithEmail({
        email: 'user@example.com',
        password: 'Password123!'
      })
    ).rejects.toThrow(AuthPersistenceError);
  });
});

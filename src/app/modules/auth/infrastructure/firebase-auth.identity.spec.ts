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
      signInWithGoogle: vi.fn(),
      signInWithFacebook: vi.fn(),
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

  it('authenticates user with Google provider', async () => {
    const gateway = buildGateway();
    vi.mocked(gateway.signInWithGoogle).mockResolvedValue({
      user: {
        uid: 'google-u-1',
        email: 'google@example.com',
        emailVerified: true,
        displayName: null
      } as never
    });
    const identity = new FirebaseAuthIdentity(gateway);

    const user = await identity.loginWithGoogle();

    expect(gateway.signInWithGoogle).toHaveBeenCalled();
    expect(user.uid).toBe('google-u-1');
  });

  it('authenticates user with Facebook provider', async () => {
    const gateway = buildGateway();
    vi.mocked(gateway.signInWithFacebook).mockResolvedValue({
      user: {
        uid: 'facebook-u-1',
        email: 'facebook@example.com',
        emailVerified: true,
        displayName: null
      } as never
    });
    const identity = new FirebaseAuthIdentity(gateway);

    const user = await identity.loginWithFacebook();

    expect(gateway.signInWithFacebook).toHaveBeenCalled();
    expect(user.uid).toBe('facebook-u-1');
  });
});

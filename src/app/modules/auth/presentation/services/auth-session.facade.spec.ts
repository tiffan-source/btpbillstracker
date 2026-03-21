import { AuthSessionFacade } from './auth-session.facade';

describe('AuthSessionFacade', () => {
  it('exposes authentication state through signals', () => {
    const facade = new AuthSessionFacade();

    expect(facade.isAuthenticated()).toBe(false);
    expect(facade.user()).toBeNull();

    facade.setUser({ uid: 'u-1', email: 'user@example.com', emailVerified: true });
    expect(facade.isAuthenticated()).toBe(true);
    expect(facade.user()?.uid).toBe('u-1');
  });
});

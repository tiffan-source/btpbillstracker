import { AUTH_ROUTES } from './auth.routes';

describe('AUTH_ROUTES', () => {
  it('exposes all required auth pages', () => {
    const requiredPaths = ['login', 'register', 'reset-password', 'account', 'verify-email'];

    for (const path of requiredPaths) {
      const route = AUTH_ROUTES.find((item) => item.path === path);
      expect(route).toBeTruthy();
      expect(route?.loadComponent).toBeTypeOf('function');
    }
  });
});

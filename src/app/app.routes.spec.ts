import { routes } from './app.routes';

describe('App routes', () => {
  it('should expose login route', () => {
    const loginRoute = routes.find((route) => route.path === 'login');
    expect(loginRoute).toBeTruthy();
    expect(loginRoute?.loadComponent).toBeTypeOf('function');
  });

  it('should expose register route', () => {
    const registerRoute = routes.find((route) => route.path === 'register');
    expect(registerRoute).toBeTruthy();
    expect(registerRoute?.loadComponent).toBeTypeOf('function');
  });

  it('should expose reset-password route', () => {
    const resetRoute = routes.find((route) => route.path === 'reset-password');
    expect(resetRoute).toBeTruthy();
    expect(resetRoute?.loadComponent).toBeTypeOf('function');
  });

  it('should expose account route', () => {
    const accountRoute = routes.find((route) => route.path === 'account');
    expect(accountRoute).toBeTruthy();
    expect(accountRoute?.loadComponent).toBeTypeOf('function');
  });

  it('should expose verify-email route', () => {
    const verifyRoute = routes.find((route) => route.path === 'verify-email');
    expect(verifyRoute).toBeTruthy();
    expect(verifyRoute?.loadComponent).toBeTypeOf('function');
  });

  it('should expose dashboard route', () => {
    const dashboardRoute = routes.find((route) => route.path === 'dashboard');

    expect(dashboardRoute).toBeTruthy();
    expect(dashboardRoute?.loadComponent).toBeTypeOf('function');
    expect(dashboardRoute?.canActivate).toHaveLength(1);
  });

  it('should keep new-bill route', () => {
    const newBillRoute = routes.find((route) => route.path === 'new-bill');

    expect(newBillRoute).toBeTruthy();
    expect(newBillRoute?.loadComponent).toBeTypeOf('function');
    expect(newBillRoute?.canActivate).toHaveLength(1);
  });

  it('should expose clients-chantiers route', () => {
    const clientsChantiersRoute = routes.find((route) => route.path === 'clients-chantiers');

    expect(clientsChantiersRoute).toBeTruthy();
    expect(clientsChantiersRoute?.loadComponent).toBeTypeOf('function');
    expect(clientsChantiersRoute?.canActivate).toHaveLength(1);
  });

  it('should redirect root to dashboard', () => {
    const rootRedirect = routes.find((route) => route.path === '');

    expect(rootRedirect?.redirectTo).toBe('dashboard');
    expect(rootRedirect?.pathMatch).toBe('full');
  });
});

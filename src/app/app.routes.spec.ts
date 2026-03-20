import { routes } from './app.routes';

describe('App routes', () => {
  it('should expose dashboard route', () => {
    const dashboardRoute = routes.find((route) => route.path === 'dashboard');

    expect(dashboardRoute).toBeTruthy();
    expect(dashboardRoute?.loadComponent).toBeTypeOf('function');
  });

  it('should keep new-bill route', () => {
    const newBillRoute = routes.find((route) => route.path === 'new-bill');

    expect(newBillRoute).toBeTruthy();
    expect(newBillRoute?.loadComponent).toBeTypeOf('function');
  });

  it('should redirect root to dashboard', () => {
    const rootRedirect = routes.find((route) => route.path === '');

    expect(rootRedirect?.redirectTo).toBe('dashboard');
    expect(rootRedirect?.pathMatch).toBe('full');
  });
});


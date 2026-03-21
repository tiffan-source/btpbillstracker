import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { authRequiredGuard, verifiedWriteAccessGuard } from './auth.guards';
import { AuthSessionFacade } from '../services/auth-session.facade';

describe('Auth guards', () => {
  const createFacade = () =>
    ({
      refreshCurrentUser: vi.fn().mockResolvedValue(undefined),
      user: vi.fn().mockReturnValue(null)
    }) as unknown as AuthSessionFacade;

  const runAuthRequired = async (url: string) =>
    TestBed.runInInjectionContext(() =>
      authRequiredGuard({} as never, { url } as never)
    );

  const runWriteAccess = async (url: string) =>
    TestBed.runInInjectionContext(() =>
      verifiedWriteAccessGuard({} as never, { url } as never)
    );

  it('redirects anonymous users to login with returnUrl', async () => {
    const facade = createFacade();
    TestBed.configureTestingModule({
      providers: [provideRouter([]), { provide: AuthSessionFacade, useValue: facade }]
    });

    const result = await runAuthRequired('/dashboard');
    const router = TestBed.inject(Router);
    const expected = router.createUrlTree(['/login'], {
      queryParams: { returnUrl: '/dashboard' }
    });

    expect(result.toString()).toBe(expected.toString());
  });

  it('allows authenticated users on protected routes', async () => {
    const facade = createFacade();
    vi.mocked(facade.user).mockReturnValue({
      uid: 'u-1',
      email: 'user@example.com',
      emailVerified: true
    });
    TestBed.configureTestingModule({
      providers: [provideRouter([]), { provide: AuthSessionFacade, useValue: facade }]
    });

    const result = await runAuthRequired('/dashboard');

    expect(result).toBe(true);
  });

  it('redirects unverified users to verify-email on write routes', async () => {
    const facade = createFacade();
    vi.mocked(facade.user).mockReturnValue({
      uid: 'u-1',
      email: 'user@example.com',
      emailVerified: false
    });
    TestBed.configureTestingModule({
      providers: [provideRouter([]), { provide: AuthSessionFacade, useValue: facade }]
    });

    const result = await runWriteAccess('/new-bill');
    const router = TestBed.inject(Router);
    const expected = router.createUrlTree(['/verify-email'], {
      queryParams: { returnUrl: '/new-bill' }
    });

    expect(result.toString()).toBe(expected.toString());
  });

  it('allows verified users on write routes', async () => {
    const facade = createFacade();
    vi.mocked(facade.user).mockReturnValue({
      uid: 'u-1',
      email: 'user@example.com',
      emailVerified: true
    });
    TestBed.configureTestingModule({
      providers: [provideRouter([]), { provide: AuthSessionFacade, useValue: facade }]
    });

    const result = await runWriteAccess('/new-bill');

    expect(result).toBe(true);
  });
});

import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthSessionFacade } from '../services/auth-session.facade';

const buildLoginRedirect = (router: Router, returnUrl: string) =>
  router.createUrlTree(['/login'], { queryParams: { returnUrl } });

export const authRequiredGuard: CanActivateFn = async (_route, state) => {
  const facade = inject(AuthSessionFacade);
  const router = inject(Router);
  await facade.refreshCurrentUser();
  const user = facade.user();

  if (!user) {
    return buildLoginRedirect(router, state.url);
  }

  return true;
};

export const verifiedWriteAccessGuard: CanActivateFn = async (_route, state) => {
  const facade = inject(AuthSessionFacade);
  const router = inject(Router);
  await facade.refreshCurrentUser();
  const user = facade.user();

  if (!user) {
    return buildLoginRedirect(router, state.url);
  }

  if (!user.emailVerified) {
    return router.createUrlTree(['/verify-email'], {
      queryParams: { returnUrl: state.url }
    });
  }

  return true;
};

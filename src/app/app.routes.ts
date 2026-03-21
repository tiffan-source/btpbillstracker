import { Routes } from '@angular/router';
import { AUTH_ROUTES } from './modules/auth/auth.routes';
import { authRequiredGuard, verifiedWriteAccessGuard } from './modules/auth/presentation/guards/auth.guards';

export const routes: Routes = [
  ...AUTH_ROUTES,
  {
    path: 'dashboard',
    canActivate: [authRequiredGuard],
    loadComponent: () =>
      import('./modules/billing/presentation/components/dashboard/dashboard-page.component').then(
        (m) => m.DashboardPageComponent
      )
  },
  {
    path: 'new-bill',
    canActivate: [verifiedWriteAccessGuard],
    loadComponent: () => import('./modules/billing/presentation/components/new-bill/new-bill.component').then(m => m.NewBillComponent)
  },
  {
    path: 'clients-chantiers',
    canActivate: [verifiedWriteAccessGuard],
    loadComponent: () =>
      import('./modules/billing/presentation/components/clients-chantiers/clients-chantiers-page/clients-chantiers-page').then(
        (m) => m.ClientsChantiersPage
      )
  },
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full'
  }
];

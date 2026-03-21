import { Routes } from '@angular/router';
import { AUTH_ROUTES } from './modules/auth/auth.routes';

export const routes: Routes = [
  ...AUTH_ROUTES,
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./modules/billing/presentation/components/dashboard/dashboard-page.component').then(
        (m) => m.DashboardPageComponent
      )
  },
  {
    path: 'new-bill',
    loadComponent: () => import('./modules/billing/presentation/components/new-bill/new-bill.component').then(m => m.NewBillComponent)
  },
  {
    path: 'clients-chantiers',
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

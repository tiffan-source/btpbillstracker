import { Routes } from '@angular/router';

export const routes: Routes = [
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
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full'
  }
];

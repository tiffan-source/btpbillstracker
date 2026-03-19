import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'new-bill',
    loadComponent: () => import('./modules/billing/presentation/components/new-bill/new-bill.component').then(m => m.NewBillComponent)
  },
  {
    path: '',
    redirectTo: 'new-bill',
    pathMatch: 'full'
  }
];

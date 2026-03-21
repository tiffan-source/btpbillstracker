import { Routes } from '@angular/router';

export const AUTH_ROUTES: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./presentation/components/login-page.component').then((m) => m.LoginPageComponent)
  },
  {
    path: 'register',
    loadComponent: () => import('./presentation/components/register-page.component').then((m) => m.RegisterPageComponent)
  },
  {
    path: 'reset-password',
    loadComponent: () => import('./presentation/components/reset-password-page.component').then((m) => m.ResetPasswordPageComponent)
  },
  {
    path: 'account',
    loadComponent: () => import('./presentation/components/account-page.component').then((m) => m.AccountPageComponent)
  },
  {
    path: 'verify-email',
    loadComponent: () => import('./presentation/components/verify-email-page.component').then((m) => m.VerifyEmailPageComponent)
  }
];

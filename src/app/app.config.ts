import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { BILLING_PROVIDERS } from './modules/billing/billing.providers';
import { CLIENT_PROVIDERS } from './modules/clients/clients.providers';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    ...BILLING_PROVIDERS,
    ...CLIENT_PROVIDERS
  ]
};

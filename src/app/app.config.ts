import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { BILLING_PROVIDERS } from './modules/billing/billing.providers';
import { CLIENT_PROVIDERS } from './modules/clients/clients.providers';
import { CHANTIERS_PROVIDERS } from './modules/chantiers/chantiers.providers';
import { REMINDERS_PROVIDERS } from './modules/reminders/reminders.providers';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    ...BILLING_PROVIDERS,
    ...CLIENT_PROVIDERS,
    ...CHANTIERS_PROVIDERS,
    ...REMINDERS_PROVIDERS
  ]
};

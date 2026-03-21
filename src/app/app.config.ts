import { APP_INITIALIZER, ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { BILLING_PROVIDERS } from './modules/billing/billing.providers';
import { CLIENT_PROVIDERS } from './modules/clients/clients.providers';
import { CHANTIERS_PROVIDERS } from './modules/chantiers/chantiers.providers';
import { REMINDERS_PROVIDERS } from './modules/reminders/reminders.providers';
import { AUTH_PROVIDERS } from './modules/auth/auth.providers';
import { environment } from '../environments/environment';
import { assertFirebaseSecurityPolicy } from './core/firebase/firebase-security.guard';

const firebaseSecurityInitializer = () => () => {
  assertFirebaseSecurityPolicy(environment);
};

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    {
      provide: APP_INITIALIZER,
      multi: true,
      useFactory: firebaseSecurityInitializer
    },
    ...BILLING_PROVIDERS,
    ...CLIENT_PROVIDERS,
    ...CHANTIERS_PROVIDERS,
    ...REMINDERS_PROVIDERS,
    ...AUTH_PROVIDERS
  ]
};

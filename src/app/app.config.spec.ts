import { APP_INITIALIZER } from '@angular/core';
import { appConfig } from './app.config';

describe('appConfig', () => {
  it('registers firebase security initializer', () => {
    const securityInitializer = appConfig.providers?.find(
      (provider) => typeof provider === 'object' && provider !== null && 'provide' in provider && provider.provide === APP_INITIALIZER
    );

    expect(securityInitializer).toBeTruthy();
    if (securityInitializer && typeof securityInitializer === 'object' && 'multi' in securityInitializer) {
      expect(securityInitializer.multi).toBe(true);
    }
  });
});

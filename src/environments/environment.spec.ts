import { environment } from './environment';

describe('environment', () => {
  it('exposes firebase configuration and persistence feature flag', () => {
    expect(environment.firebase).toBeDefined();
    expect(typeof environment.firebase.projectId).toBe('string');
    expect(typeof environment.useFirebasePersistence).toBe('boolean');
    expect(['none', 'anonymous', 'email-password']).toContain(environment.firebaseAuthMode);
    expect(['open', 'owner-uid']).toContain(environment.firestoreSecurityMode);
  });
});

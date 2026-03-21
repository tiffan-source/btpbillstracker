import { AppEnvironment } from '../../../environments/environment';
import { assertFirebaseSecurityPolicy } from './firebase-security.guard';

const baseEnvironment = (): AppEnvironment => ({
  production: true,
  useFirebasePersistence: true,
  firebaseAuthMode: 'email-password',
  firestoreSecurityMode: 'owner-uid',
  firebase: {
    apiKey: 'k',
    authDomain: 'd',
    projectId: 'p',
    storageBucket: 'b',
    messagingSenderId: 'm',
    appId: 'a',
    measurementId: 'g'
  }
});

describe('assertFirebaseSecurityPolicy', () => {
  it('does not throw for valid production policy', () => {
    expect(() => assertFirebaseSecurityPolicy(baseEnvironment())).not.toThrow();
  });

  it('throws when production firebase persistence uses non-email auth mode', () => {
    const env = baseEnvironment();
    env.firebaseAuthMode = 'anonymous';

    expect(() => assertFirebaseSecurityPolicy(env)).toThrowError(
      '[SECURITY_GUARD] Firebase persistence in production requires firebaseAuthMode=email-password.'
    );
  });

  it('throws when production firebase persistence uses open firestore mode', () => {
    const env = baseEnvironment();
    env.firestoreSecurityMode = 'open';

    expect(() => assertFirebaseSecurityPolicy(env)).toThrowError(
      '[SECURITY_GUARD] Firebase persistence in production requires firestoreSecurityMode=owner-uid.'
    );
  });

  it('does not throw when firebase persistence is disabled', () => {
    const env = baseEnvironment();
    env.useFirebasePersistence = false;
    env.firebaseAuthMode = 'none';
    env.firestoreSecurityMode = 'open';

    expect(() => assertFirebaseSecurityPolicy(env)).not.toThrow();
  });
});

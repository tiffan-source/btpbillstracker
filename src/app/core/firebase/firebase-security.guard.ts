import { AppEnvironment } from '../../../environments/environment';

/**
 * Vérifier la cohérence sécurité Firebase avant démarrage applicatif.
 * Bloquer en production si persistance Firebase active sans Auth email/password
 * ou sans modèle de sécurité ownerUid.
 */
export const assertFirebaseSecurityPolicy = (env: AppEnvironment): void => {
  if (!env.production || !env.useFirebasePersistence) {
    return;
  }

  if (env.firebaseAuthMode !== 'email-password') {
    throw new Error(
      '[SECURITY_GUARD] Firebase persistence in production requires firebaseAuthMode=email-password.'
    );
  }

  if (env.firestoreSecurityMode !== 'owner-uid') {
    throw new Error(
      '[SECURITY_GUARD] Firebase persistence in production requires firestoreSecurityMode=owner-uid.'
    );
  }
};

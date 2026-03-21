import { FirebaseApp, getApp, getApps, initializeApp } from 'firebase/app';
import { Firestore, getFirestore } from 'firebase/firestore';
import { environment } from '../../../environments/environment';

/**
 * Retourne l'instance singleton de Firebase App pour l'application.
 */
export const getFirebaseApp = (): FirebaseApp =>
  getApps().length > 0 ? getApp() : initializeApp(environment.firebase);

/**
 * Retourne l'instance Firestore associée à l'application Firebase.
 */
export const getAppFirestore = (): Firestore => getFirestore(getFirebaseApp());

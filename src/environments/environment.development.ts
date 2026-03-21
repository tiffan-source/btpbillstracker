import { AppEnvironment } from './environment';

export const environment: AppEnvironment = {
  production: false,
  useFirebasePersistence: false,
  firebaseAuthMode: 'none',
  firestoreSecurityMode: 'open',
  firebase: {
    apiKey: 'demo-api-key',
    authDomain: 'demo-project.firebaseapp.com',
    projectId: 'demo-project',
    storageBucket: 'demo-project.appspot.com',
    messagingSenderId: '000000000000',
    appId: '1:000000000000:web:0000000000000000000000',
    measurementId: 'G-0000000000'
  }
};

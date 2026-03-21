export type AppFirebaseConfig = {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
  measurementId: string;
};

export type AppEnvironment = {
  production: boolean;
  useFirebasePersistence: boolean;
  firebaseAuthMode: 'none' | 'anonymous' | 'email-password';
  firestoreSecurityMode: 'open' | 'owner-uid';
  firebase: AppFirebaseConfig;
};

export const environment: AppEnvironment = {
  production: true,
  useFirebasePersistence: false,
  firebaseAuthMode: 'email-password',
  firestoreSecurityMode: 'owner-uid',
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

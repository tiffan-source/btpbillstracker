export type AppFirebaseConfig = {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
};

export type AppEnvironment = {
  production: boolean;
  useFirebasePersistence: boolean;
  firebase: AppFirebaseConfig;
};

export const environment: AppEnvironment = {
  production: true,
  useFirebasePersistence: false,
  firebase: {
    apiKey: 'demo-api-key',
    authDomain: 'demo-project.firebaseapp.com',
    projectId: 'demo-project',
    storageBucket: 'demo-project.appspot.com',
    messagingSenderId: '000000000000',
    appId: '1:000000000000:web:0000000000000000000000'
  }
};

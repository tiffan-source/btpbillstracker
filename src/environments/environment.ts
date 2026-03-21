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
  firebase: AppFirebaseConfig;
};

export const environment: AppEnvironment = {
  production: true,
  useFirebasePersistence: false,
  firebase: {
  apiKey: "demo-api-key",

  authDomain: "demo-project.firebaseapp.com",

  projectId: "demo-project",

  storageBucket: "demo-project.firebasestorage.app",

  messagingSenderId: "000000000000",

  appId: "1:000000000000:web:3ff4088d5be3c5cef20d36",

  measurementId: "G-BC5QRB49CD"

  }
};

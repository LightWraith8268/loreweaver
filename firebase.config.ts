import { initializeApp } from 'firebase/app';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getStorage, connectStorageEmulator } from 'firebase/storage';

// Firebase configuration from environment variables
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY || "AIzaSyCMugRHQjZiTvP8NE7k5htpisEOhECrkv8",
  authDomain: process.env.FIREBASE_AUTH_DOMAIN || "loreweaver-f6f31.firebaseapp.com",
  projectId: process.env.FIREBASE_PROJECT_ID || "loreweaver-f6f31",
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET || "loreweaver-f6f31.firebasestorage.app",
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || "770712942389",
  appId: process.env.FIREBASE_APP_ID || "1:770712942389:web:8926d84c636cddfb9ebe7c",
  measurementId: process.env.FIREBASE_MEASUREMENT_ID || "G-6J5TKY4HLW"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
export const auth = getAuth(app);
export const firestore = getFirestore(app);
export const storage = getStorage(app);

// Development emulators (uncomment for local development)
// if (__DEV__ && !auth._delegate._isInitialized) {
//   connectAuthEmulator(auth, 'http://localhost:9099');
//   connectFirestoreEmulator(firestore, 'localhost', 8080);
//   connectStorageEmulator(storage, 'localhost', 9199);
// }

export default app;
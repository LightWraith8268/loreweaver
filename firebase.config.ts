import { initializeApp } from 'firebase/app';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getStorage, connectStorageEmulator } from 'firebase/storage';

// Firebase configuration (these should be replaced with your actual config)
const firebaseConfig = {
  apiKey: "AIzaSyCMugRHQjZiTvP8NE7k5htpisEOhECrkv8",
  authDomain: "loreweaver-f6f31.firebaseapp.com",
  projectId: "loreweaver-f6f31",
  storageBucket: "loreweaver-f6f31.firebasestorage.app",
  messagingSenderId: "770712942389",
  appId: "1:770712942389:web:8926d84c636cddfb9ebe7c",
  measurementId: "G-6J5TKY4HLW"
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
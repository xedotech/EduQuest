// Firebase configuration for EduQuest
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getDatabase } from 'firebase/database';
import { getStorage } from 'firebase/storage';

// Firebase config - These will be environment variables in production
const firebaseConfig = {
  apiKey: "demo-api-key", // Replace with actual Firebase config
  authDomain: "eduquest-demo.firebaseapp.com",
  databaseURL: "https://eduquest-demo-default-rtdb.firebaseio.com",
  projectId: "eduquest-demo",
  storageBucket: "eduquest-demo.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456789"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const database = getDatabase(app);
export const storage = getStorage(app);

// Configure Google Auth Provider
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

export default app;


// src/firebase/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getFunctions } from "firebase/functions";

// Firebase configuration from environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

// Check if Firebase is properly configured
const isFirebaseConfigured = 
  firebaseConfig.apiKey && 
  firebaseConfig.authDomain && 
  firebaseConfig.projectId && 
  firebaseConfig.storageBucket && 
  firebaseConfig.appId &&
  !firebaseConfig.apiKey.includes('placeholder') && 
  !firebaseConfig.apiKey.includes('your_') &&
  !firebaseConfig.authDomain.includes('placeholder') && 
  !firebaseConfig.authDomain.includes('your_') &&
  !firebaseConfig.projectId.includes('placeholder') && 
  !firebaseConfig.projectId.includes('your_');


if (!isFirebaseConfigured) {
  console.warn('⚠️ Firebase configuration incomplete. Check your .env file.');
}

// Initialize Firebase only if properly configured
let app, auth, db, storage, functions;

if (isFirebaseConfigured) {
  try {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
    storage = getStorage(app);
    functions = getFunctions(app);
    console.info('✅ Firebase connected successfully');
  } catch (error) {
    console.error('❌ Firebase initialization failed:', error);
  }
} else {
  console.warn('🔧 Firebase not configured - some features may not work');
}

export { auth, db, storage, functions };

// Enable offline persistence for Firestore
import { enableNetwork, disableNetwork } from "firebase/firestore";

export const enableOffline = () => disableNetwork(db);
export const enableOnline = () => enableNetwork(db);

export default app;

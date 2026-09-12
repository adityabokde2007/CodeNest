import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyDV8_TjUJp7VJNWE8OYasnUasEHetSzhuw",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "codenest-63572.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "codenest-63572",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "codenest-63572.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "384741112358",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:384741112358:web:d3d3fb8a783e2c59a004e7",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-S8LYQ3S8NK"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const storage = getStorage(app);
export const database = getDatabase(app);

// Log initialization for debugging
console.log('[Firebase] Initialized with project:', firebaseConfig.projectId);
console.log('[Firebase] Storage bucket:', firebaseConfig.storageBucket);
console.log('[Firebase] Auth domain:', firebaseConfig.authDomain);

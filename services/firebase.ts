import { getApps, getApp, initializeApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  updateProfile,
  setPersistence,
  browserLocalPersistence
} from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  updateDoc
} from 'firebase/firestore';

// Configuration — values are loaded from environment variables.
// Create a .env.local file (gitignored) with these keys set.
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Initialize Firebase (Robust pattern)
let app;
let auth: any;
let db: any;

try {
  // If API key is missing, this will throw a clearer error before React mounts
  if (!firebaseConfig.apiKey || firebaseConfig.apiKey === 'undefined') {
    throw new Error("Firebase API Key is missing from .env.local");
  }
  app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
  auth = getAuth(app);
  db = getFirestore(app);
  
  // Set default persistence
  setPersistence(auth, browserLocalPersistence).catch(err => console.error("Auth persistence error:", err));
} catch (error) {
  console.error("❌ Firebase Initialization Failed:", error);
  // Export dummy/null objects so other files don't crash on import
  auth = null;
  db = null;
}

const googleProvider = new GoogleAuthProvider();

// Configure Google Provider
googleProvider.addScope('profile');
googleProvider.addScope('email');

/**
 * Updates user data in Firestore and optionally syncs basic profile info to Firebase Auth.
 * @param uid User ID
 * @param data Object containing fields to update
 */
const updateUserData = async (uid: string, data: any) => {
    try {
        const userRef = doc(db, "users", uid);
        await updateDoc(userRef, data);

        // Sync with Auth Profile if name or avatar is changed
        if (auth.currentUser && (data.name || data.avatar)) {
            const profileUpdates: { displayName?: string; photoURL?: string } = {};
            if (data.name) profileUpdates.displayName = data.name;
            if (data.avatar) profileUpdates.photoURL = data.avatar;
            
            if (Object.keys(profileUpdates).length > 0) {
                await updateProfile(auth.currentUser, profileUpdates);
            }
        }
        return true;
    } catch (error) {
        console.error("Error updating user data:", error);
        throw error;
    }
};

// Export direct SDK functions using cleaner syntax
export { 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  updateProfile
} from 'firebase/auth';

export { 
  doc, 
  setDoc, 
  getDoc,
  updateDoc
} from 'firebase/firestore';

// Export services and custom helpers
export { 
  auth, 
  db, 
  googleProvider,
  updateUserData
};
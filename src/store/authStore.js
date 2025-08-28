import { create } from "zustand";
import { persist } from "zustand/middleware";
import { auth } from "../firebase/firebase";
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup,
  sendPasswordResetEmail as firebaseSendPasswordResetEmail
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { db } from "../firebase/firebase";

const googleProvider = new GoogleAuthProvider();

export const useAuthStore = create(
  persist(
    (set, get) => ({
  currentUser: null,
  userProfile: null,
  loading: true,
  error: null,

  fetchUser: () => {
    try {
      // Check if Firebase auth is available
      if (!auth) {
        console.warn('Firebase auth not available');
        set({ currentUser: null, userProfile: null, loading: false });
        return () => {};
      }
      
      if (!auth.onAuthStateChanged) {
        console.warn('Firebase auth not properly initialized');
        set({ currentUser: null, userProfile: null, loading: false });
        return () => {};
      }
      
      const unsubscribe = onAuthStateChanged(auth, async (user) => {
        if (user) {
          // CRITICAL: Always fetch fresh user profile from Firestore on auth state change
          try {
            if (!db) {
              set({ currentUser: user, userProfile: null, loading: false });
              return;
            }
            
            const userDocRef = doc(db, "users", user.uid);
            const userDocSnap = await getDoc(userDocRef);
            const userProfile = userDocSnap.exists() ? userDocSnap.data() : null;
            
            set({ currentUser: user, userProfile, loading: false });
          } catch (error) {
            console.error("Error fetching user profile:", error);
            set({ currentUser: user, userProfile: null, loading: false });
          }
        } else {
          set({ currentUser: null, userProfile: null, loading: false });
        }
      });
      return unsubscribe;
    } catch (error) {
      console.log("Firebase not configured, using mock auth");
      set({ currentUser: null, userProfile: null, loading: false });
      return () => {};
    }
  },

  signup: async (email, password, name) => {
    set({ error: null, loading: true });
    try {
      if (!auth) {
        throw new Error('Authentication service not available. Please check your Firebase configuration.');
      }
      
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(userCredential.user, { displayName: name });
      
      // Create user profile in Firestore
      if (db) {
        const userProfile = {
          uid: userCredential.user.uid,
          email: userCredential.user.email,
          displayName: name,
          role: 'customer',
          createdAt: new Date().toISOString(),
          addresses: [],
          preferences: {
            currency: 'INR',
            language: 'en'
          }
        };
        
        await setDoc(doc(db, "users", userCredential.user.uid), userProfile);
        set({ currentUser: userCredential.user, userProfile, loading: false });
      } else {
        console.warn('Firestore not available - user profile not saved');
        set({ currentUser: userCredential.user, userProfile: null, loading: false });
      }
    } catch (error) {
      // Provide user-friendly error messages
      let errorMessage = "Account creation failed. Please try again.";
      
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = "An account with this email already exists. Please try logging in instead.";
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = "Please enter a valid email address.";
      } else if (error.code === 'auth/weak-password') {
        errorMessage = "Password should be at least 6 characters long.";
      } else if (error.code === 'auth/operation-not-allowed') {
        errorMessage = "Email/password accounts are not enabled. Please contact support.";
      }
      
      set({ error: errorMessage, loading: false });
      throw error;
    }
  },

  login: async (email, password) => {
    set({ error: null, loading: true });
    try {
      if (!auth) {
        throw new Error('Authentication service not available. Please check your Firebase configuration.');
      }
      
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      // CRITICAL: Fetch user profile from Firestore to get role information
      if (db) {
        const userDocRef = doc(db, "users", userCredential.user.uid);
        const userDocSnap = await getDoc(userDocRef);
        
        let userProfile = null;
        if (userDocSnap.exists()) {
          userProfile = userDocSnap.data();
        } else {
          console.warn('User document not found in Firestore for UID:', userCredential.user.uid);
        }
        
        set({ currentUser: userCredential.user, userProfile, loading: false });
      } else {
        console.warn('Firestore not available - user profile not loaded');
        set({ currentUser: userCredential.user, userProfile: null, loading: false });
      }
    } catch (error) {
      // Set specific error codes for intelligent UI handling
      let errorCode = "generic-error";
      
      if (error.code === 'auth/user-not-found') {
        errorCode = "user-not-found";
      } else if (error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
        errorCode = "wrong-password";
      } else if (error.code === 'auth/invalid-email') {
        errorCode = "invalid-email";
      } else if (error.code === 'auth/user-disabled') {
        errorCode = "user-disabled";
      } else if (error.code === 'auth/too-many-requests') {
        errorCode = "too-many-requests";
      }
      
      set({ error: errorCode, loading: false });
      throw error;
    }
  },

  sendPasswordResetEmail: async (email) => {
    set({ error: null, loading: true });
    try {
      if (!auth) {
        throw new Error('Authentication service not available');
      }
      
      await firebaseSendPasswordResetEmail(auth, email);
      set({ error: "password-reset-sent", loading: false });
      return { success: true, message: "Password reset email sent successfully" };
    } catch (error) {
      let errorCode = "password-reset-error";
      
      if (error.code === 'auth/user-not-found') {
        errorCode = "reset-user-not-found";
      } else if (error.code === 'auth/invalid-email') {
        errorCode = "reset-invalid-email";
      } else if (error.code === 'auth/too-many-requests') {
        errorCode = "reset-too-many-requests";
      }
      
      set({ error: errorCode, loading: false });
      throw error;
    }
  },

  loginWithGoogle: async () => {
    set({ error: null, loading: true });
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      
      // CRITICAL: Fetch or create user profile from Firestore
      const userDocRef = doc(db, "users", user.uid);
      const userDocSnap = await getDoc(userDocRef);
      let userProfile;
      
      if (!userDocSnap.exists()) {
        // Create new user profile for Google OAuth users
        userProfile = {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
          role: 'customer',
          createdAt: new Date().toISOString(),
          addresses: [],
          preferences: {
            currency: 'USD',
            language: 'en'
          }
        };
        await setDoc(userDocRef, userProfile);
      } else {
        userProfile = userDocSnap.data();
      }
      
      set({ currentUser: user, userProfile, loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  logout: async () => {
    set({ loading: true });
    try {
      await signOut(auth);
      set({ currentUser: null, userProfile: null, loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  updateProfile: async (updates) => {
    const { currentUser } = get();
    if (!currentUser) throw new Error("No user logged in");
    
    set({ loading: true });
    try {
      await setDoc(doc(db, "users", currentUser.uid), updates, { merge: true });
      set({ userProfile: { ...get().userProfile, ...updates }, loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  clearError: () => set({ error: null }),
}),
    {
      name: "auth-storage",
      partialize: (state) => ({ 
        currentUser: state.currentUser,
        userProfile: state.userProfile 
      }),
    }
  )
);
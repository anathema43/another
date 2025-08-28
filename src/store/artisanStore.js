import { create } from "zustand";
import { 
  collection, 
  getDocs, 
  addDoc, 
  doc, 
  updateDoc, 
  deleteDoc, 
  getDoc,
  query,
  where,
  orderBy
} from "firebase/firestore";
import { db } from "../firebase/firebase";

export const useArtisanStore = create((set, get) => ({
  artisans: [],
  featuredArtisans: [],
  loading: false,
  error: null,

  fetchArtisans: async () => {
    if (!db) {
      console.warn('Firestore not available - cannot load artisans');
      set({ artisans: [], loading: false, error: 'Firestore not configured' });
      return [];
    }
    
    set({ loading: true, error: null });
    try {
      const querySnapshot = await getDocs(collection(db, "artisans"));
      const artisans = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      
      set({ artisans, loading: false });
      return artisans;
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  fetchFeaturedArtisans: async () => {
    if (!db) {
      console.warn('Firestore not available - cannot load featured artisans');
      set({ featuredArtisans: [], error: 'Firestore not configured' });
      return [];
    }
    
    set({ error: null });
    try {
      const q = query(
        collection(db, "artisans"),
        where("featured", "==", true),
        orderBy("createdAt", "desc")
      );
      const querySnapshot = await getDocs(q);
      const featuredArtisans = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      
      set({ featuredArtisans });
      return featuredArtisans;
    } catch (error) {
      set({ error: error.message });
      return [];
    }
  },

  getArtisanById: async (id) => {
    if (!db) {
      console.warn('Firebase not configured, using demo mode');
      return null;
    }
    
    try {
      const docRef = doc(db, "artisans", id);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() };
      } else {
        return null;
      }
    } catch (error) {
      set({ error: error.message });
      return null;
    }
  },

  addArtisan: async (newArtisan) => {
    if (!db) {
      console.warn('Firebase not configured, using demo mode');
      set({ error: 'Firebase not configured' });
      throw new Error('Firebase not configured');
    }
    
    set({ error: null });
    try {
      const artisanData = {
        ...newArtisan,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        featured: false,
        productCount: 0
      };
      
      const docRef = await addDoc(collection(db, "artisans"), artisanData);
      set({ artisans: [...get().artisans, { ...artisanData, id: docRef.id }] });
      return docRef.id;
    } catch (error) {
      set({ error: error.message });
      throw error;
    }
  },

  updateArtisan: async (id, updatedFields) => {
    if (!db) {
      console.warn('Firebase not configured, using demo mode');
      set({ error: 'Firebase not configured' });
      throw new Error('Firebase not configured');
    }
    
    set({ error: null });
    try {
      const ref = doc(db, "artisans", id);
      const updateData = {
        ...updatedFields,
        updatedAt: new Date().toISOString()
      };
      
      await updateDoc(ref, updateData);
      set({
        artisans: get().artisans.map(a => a.id === id ? { ...a, ...updateData } : a),
      });
    } catch (error) {
      set({ error: error.message });
      throw error;
    }
  },

  deleteArtisan: async (id) => {
    if (!db) {
      console.warn('Firebase not configured, using demo mode');
      set({ error: 'Firebase not configured' });
      throw new Error('Firebase not configured');
    }
    
    set({ error: null });
    try {
      await deleteDoc(doc(db, "artisans", id));
      set({
        artisans: get().artisans.filter(a => a.id !== id),
      });
    } catch (error) {
      set({ error: error.message });
      throw error;
    }
  },

  getArtisanProducts: async (artisanId) => {
    if (!db) {
      console.warn('Firebase not configured, using demo mode');
      return [];
    }
    
    try {
      const q = query(
        collection(db, "products"),
        where("artisanId", "==", artisanId)
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
    } catch (error) {
      set({ error: error.message });
      return [];
    }
  },

  clearError: () => set({ error: null }),
}));
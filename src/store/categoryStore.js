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
  orderBy
} from "firebase/firestore";
import { db } from "../firebase/firebase";

export const useCategoryStore = create((set, get) => ({
  categories: [],
  loading: false,
  error: null,

  fetchCategories: async () => {
    if (!db) {
      // Use demo categories when Firebase not configured
      const demoCategories = [
        {
          id: 'demo-category-1',
          name: 'Pickles & Preserves',
          description: 'Traditional pickles and preserved foods from the hills',
          imageUrl: 'https://images.pexels.com/photos/4198017/pexels-photo-4198017.jpeg?auto=compress&cs=tinysrgb&w=800',
          createdAt: new Date().toISOString()
        },
        {
          id: 'demo-category-2',
          name: 'Wild Honey',
          description: 'Pure, raw honey collected from high-altitude forests',
          imageUrl: 'https://images.pexels.com/photos/1638280/pexels-photo-1638280.jpeg?auto=compress&cs=tinysrgb&w=800',
          createdAt: new Date().toISOString()
        },
        {
          id: 'demo-category-3',
          name: 'Heritage Grains',
          description: 'Ancient grain varieties grown in terraced mountain fields',
          imageUrl: 'https://images.pexels.com/photos/33239/wheat-field-wheat-cereals-grain.jpg?auto=compress&cs=tinysrgb&w=800',
          createdAt: new Date().toISOString()
        },
        {
          id: 'demo-category-4',
          name: 'Mountain Spices',
          description: 'Aromatic spice blends from high-altitude regions',
          imageUrl: 'https://images.pexels.com/photos/4198015/pexels-photo-4198015.jpeg?auto=compress&cs=tinysrgb&w=800',
          createdAt: new Date().toISOString()
        }
      ];
      
      set({ categories: demoCategories, loading: false });
      return demoCategories;
    }
    
    set({ loading: true, error: null });
    try {
      const q = query(collection(db, "categories"), orderBy("name", "asc"));
      const querySnapshot = await getDocs(q);
      const categories = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      
      set({ categories, loading: false });
      return categories;
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  getCategoryById: async (id) => {
    // Try to find in current categories first
    const { categories } = get();
    const foundCategory = categories.find(c => c.id === id);
    if (foundCategory) return foundCategory;
    
    if (!db) {
      return null; // Category not found in demo mode
    }
    
    try {
      const docRef = doc(db, "categories", id);
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

  addCategory: async (newCategory) => {
    if (!db) {
      console.warn('Firebase not configured, using demo mode');
      set({ error: 'Firebase not configured' });
      throw new Error('Firebase not configured');
    }
    
    set({ error: null });
    try {
      const categoryData = {
        ...newCategory,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      const docRef = await addDoc(collection(db, "categories"), categoryData);
      set({ categories: [...get().categories, { ...categoryData, id: docRef.id }] });
      return docRef.id;
    } catch (error) {
      set({ error: error.message });
      throw error;
    }
  },

  updateCategory: async (id, updatedFields) => {
    if (!db) {
      console.warn('Firebase not configured, using demo mode');
      set({ error: 'Firebase not configured' });
      throw new Error('Firebase not configured');
    }
    
    set({ error: null });
    try {
      const ref = doc(db, "categories", id);
      const updateData = {
        ...updatedFields,
        updatedAt: new Date().toISOString()
      };
      
      await updateDoc(ref, updateData);
      set({
        categories: get().categories.map(c => c.id === id ? { ...c, ...updateData } : c),
      });
    } catch (error) {
      set({ error: error.message });
      throw error;
    }
  },

  deleteCategory: async (id) => {
    if (!db) {
      console.warn('Firebase not configured, using demo mode');
      set({ error: 'Firebase not configured' });
      throw new Error('Firebase not configured');
    }
    
    set({ error: null });
    try {
      await deleteDoc(doc(db, "categories", id));
      set({
        categories: get().categories.filter(c => c.id !== id),
      });
    } catch (error) {
      set({ error: error.message });
      throw error;
    }
  },

  clearError: () => set({ error: null }),
}));
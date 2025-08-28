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
  orderBy,
  limit
} from "firebase/firestore";
import { db } from "../firebase/firebase";

export const useProductStore = create((set, get) => ({
  products: [],
  featuredProducts: [],
  categories: [],
  searchResults: [],
  loading: false,
  error: null,

  fetchProducts: async () => {
    set({ loading: true, error: null });
    try {
      // Check if Firestore is available
      if (!db) {
        // Use demo products when Firebase not configured
        const demoProducts = [
          {
            id: 'demo-1',
            name: 'Darjeeling Pickle',
            description: 'Authentic spicy pickle from the hills of Darjeeling, made with traditional recipes.',
            price: 299,
            image: 'https://res.cloudinary.com/dj4kdlwzo/image/upload/v1752940186/pickle_3_co88iu.jpg',
            quantityAvailable: 10,
            category: 'pickle',
            rating: 4.5,
            reviewCount: 12,
            artisan: 'Deepak Sharma',
            featured: true
          },
          {
            id: 'demo-2',
            name: 'Himalayan Wild Honey',
            description: 'Pure organic honey from high-altitude forests, collected using traditional methods.',
            price: 499,
            image: 'https://images.pexels.com/photos/1638280/pexels-photo-1638280.jpeg?auto=compress&cs=tinysrgb&w=800',
            quantityAvailable: 7,
            category: 'honey',
            rating: 5,
            reviewCount: 8,
            artisan: 'Laxmi Devi',
            featured: true
          },
          {
            id: 'demo-3',
            name: 'Organic Red Rice',
            description: 'Nutrient-rich red rice from Himalayan valleys, grown without chemicals.',
            price: 450,
            image: 'https://images.pexels.com/photos/33239/wheat-field-wheat-cereals-grain.jpg?auto=compress&cs=tinysrgb&w=800',
            quantityAvailable: 15,
            category: 'grains',
            rating: 4.8,
            reviewCount: 15,
            artisan: 'Ashok Singh',
            featured: false
          }
        ];
        
        const categories = [...new Set(demoProducts.map(p => p.category))];
        set({ products: demoProducts, categories, loading: false });
        return demoProducts;
      }
      
      const querySnapshot = await getDocs(collection(db, "products"));
      const products = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      
      // Extract unique categories
      const categories = [...new Set(products.map(p => p.category))];
      
      set({ products, categories, loading: false });
      return products;
    } catch (error) {
      console.error('Error fetching products:', error);
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  fetchFeaturedProducts: async () => {
    set({ error: null });
    try {
      if (!db) {
        // Use demo featured products
        const { products } = get();
        const featured = products.filter(p => p.featured);
        set({ featuredProducts: featured });
        return featured;
      }
      
      const q = query(
        collection(db, "products"),
        where("featured", "==", true),
        orderBy("createdAt", "desc"),
        limit(6)
      );
      const querySnapshot = await getDocs(q);
      const featuredProducts = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      
      // If no featured products, get the newest 4 products
      if (featuredProducts.length === 0) {
        const fallbackQuery = query(
          collection(db, "products"),
          orderBy("createdAt", "desc"),
          limit(4)
        );
        const fallbackSnapshot = await getDocs(fallbackQuery);
        const fallbackProducts = fallbackSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        set({ featuredProducts: fallbackProducts });
        return fallbackProducts;
      }
      
      set({ featuredProducts });
      return featuredProducts;
    } catch (error) {
      set({ error: error.message });
      // Fallback to regular products if featured fetch fails
      const { products } = get();
      const fallbackFeatured = products.slice(0, 4);
      set({ featuredProducts: fallbackFeatured });
      return fallbackFeatured;
    }
  },

  getProductById: async (id) => {
    // Try to find in current products first
    const { products } = get();
    const foundProduct = products.find(p => p.id === id);
    if (foundProduct) return foundProduct;
    
    if (!db) {
      return null; // Product not found in demo mode
    }
    
    try {
      const docRef = doc(db, "products", id);
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

  searchProducts: (searchTerm, category = 'all', sortBy = 'name') => {
    const { products } = get();
    
    let filtered = products.filter(product => {
      const matchesSearch = !searchTerm || 
        (product.name && product.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (product.description && product.description.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesCategory = category === 'all' || product.category === category;
      
      return matchesSearch && matchesCategory;
    });

    // Sort products
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'price-low':
          return a.price - b.price;
        case 'price-high':
          return b.price - a.price;
        case 'rating':
          return (b.rating || 0) - (a.rating || 0);
        case 'newest':
          return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
        default:
          return (a.name || '').localeCompare(b.name || '');
      }
    });

    set({ searchResults: filtered });
    return filtered;
  },
  addProduct: async (newProduct) => {
    if (!db) {
      console.warn('Firebase not configured, using demo mode');
      set({ error: 'Firebase not configured' });
      throw new Error('Firebase not configured');
    }
    
    set({ error: null });
    try {
      const productData = {
        ...newProduct,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        featured: false,
        rating: 0,
        reviewCount: 0
      };
      
      const docRef = await addDoc(collection(db, "products"), productData);
      set({ products: [...get().products, { ...newProduct, id: docRef.id }] });
      return docRef.id;
    } catch (error) {
      set({ error: error.message });
      throw error;
    }
  },

  updateProduct: async (id, updatedFields) => {
    if (!db) {
      console.warn('Firebase not configured, using demo mode');
      set({ error: 'Firebase not configured' });
      throw new Error('Firebase not configured');
    }
    
    set({ error: null });
    try {
      const ref = doc(db, "products", id);
      const updateData = {
        ...updatedFields,
        updatedAt: new Date().toISOString()
      };
      
      await updateDoc(ref, updateData);
      set({
        products: get().products.map(p => p.id === id ? { ...p, ...updateData } : p),
      });
    } catch (error) {
      set({ error: error.message });
      throw error;
    }
  },

  deleteProduct: async (id) => {
    if (!db) {
      console.warn('Firebase not configured, using demo mode');
      set({ error: 'Firebase not configured' });
      throw new Error('Firebase not configured');
    }
    
    set({ error: null });
    try {
      await deleteDoc(doc(db, "products", id));
      set({
        products: get().products.filter(p => p.id !== id),
      });
    } catch (error) {
      set({ error: error.message });
      throw error;
    }
  },

  clearError: () => set({ error: null }),
}));
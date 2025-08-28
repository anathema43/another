import { create } from "zustand";
import { persist } from "zustand/middleware";
import { doc, setDoc, getDoc, onSnapshot } from "firebase/firestore";
import { db } from "../firebase/firebase";
import { useAuthStore } from "./authStore";

export const useWishlistStore = create(
  persist(
    (set, get) => ({
      wishlist: [],
      loading: false,
      error: null,
      unsubscribe: null,

      // Real-time wishlist synchronization
      subscribeToWishlist: () => {
        const { currentUser } = useAuthStore.getState();
        if (!currentUser) return;

        const { unsubscribe: currentUnsub } = get();
        if (currentUnsub) {
          currentUnsub();
        }

        const unsubscribe = onSnapshot(
          doc(db, "wishlists", currentUser.uid),
          (doc) => {
            if (doc.exists()) {
              set({ 
                wishlist: doc.data().productIds || [], 
                loading: false,
                error: null 
              });
            } else {
              set({ wishlist: [], loading: false });
            }
          },
          (error) => {
            console.error("Error listening to wishlist changes:", error);
            set({ error: error.message, loading: false });
          }
        );

        set({ unsubscribe });
        return unsubscribe;
      },

      unsubscribeFromWishlist: () => {
        const { unsubscribe } = get();
        if (unsubscribe) {
          unsubscribe();
          set({ unsubscribe: null });
        }
      },
      unsubscribe: null,

      // Real-time wishlist synchronization
      subscribeToWishlist: () => {
        const { currentUser } = useAuthStore.getState();
        if (!currentUser) return;

        const { unsubscribe: currentUnsub } = get();
        if (currentUnsub) {
          currentUnsub();
        }

        const unsubscribe = onSnapshot(
          doc(db, "wishlists", currentUser.uid),
          (doc) => {
            if (doc.exists()) {
              set({ 
                wishlist: doc.data().productIds || [], 
                loading: false,
                error: null 
              });
            } else {
              set({ wishlist: [], loading: false });
            }
          },
          (error) => {
            console.error("Error listening to wishlist changes:", error);
            set({ error: error.message, loading: false });
          }
        );

        set({ unsubscribe });
        return unsubscribe;
      },

      unsubscribeFromWishlist: () => {
        const { unsubscribe } = get();
        if (unsubscribe) {
          unsubscribe();
          set({ unsubscribe: null });
        }
      },

      loadWishlist: async () => {
        const { currentUser } = useAuthStore.getState();
        if (!currentUser || !db) return;
        
        set({ loading: true });
        try {
          const wishlistDoc = await getDoc(doc(db, "wishlists", currentUser.uid));
          if (wishlistDoc.exists()) {
            set({ wishlist: wishlistDoc.data().productIds || [], loading: false });
          } else {
            set({ loading: false });
          }
          
          // Start real-time subscription
          get().subscribeToWishlist();
          
          // Start real-time subscription
          get().subscribeToWishlist();
        } catch (error) {
          set({ error: error.message, loading: false });
        }
      },

      saveWishlist: async () => {
        const { currentUser } = useAuthStore.getState();
        const { wishlist } = get();
        
        if (!currentUser) return;
        
        try {
          await setDoc(doc(db, "wishlists", currentUser.uid), {
            productIds: wishlist,
            updatedAt: new Date().toISOString()
          });
        } catch (error) {
          console.error("Error saving wishlist:", error);
        }
      },

      addToWishlist: (productId) => {
        set((state) => {
          if (!state.wishlist.includes(productId)) {
            const newWishlist = [...state.wishlist, productId];
            setTimeout(() => get().saveWishlist(), 100);
            return { wishlist: newWishlist };
          }
          return state;
        });
      },

      removeFromWishlist: (productId) => {
        set((state) => ({
          wishlist: state.wishlist.filter(id => id !== productId)
        }));
        setTimeout(() => get().saveWishlist(), 100);
      },

      toggleWishlist: (productId) => {
        const { wishlist } = get();
        if (wishlist.includes(productId)) {
          get().removeFromWishlist(productId);
        } else {
          get().addToWishlist(productId);
        }
      },

      isInWishlist: (productId) => {
        return get().wishlist.includes(productId);
      },

      clearWishlist: () => {
        set({ wishlist: [] });
        setTimeout(() => get().saveWishlist(), 100);
      },

      getWishlistCount: () => {
        return get().wishlist.length;
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: "ramro-wishlist-storage",
    }
  )
);
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { doc, setDoc, getDoc, updateDoc, arrayUnion, arrayRemove } from "firebase/firestore";
import { db } from "../firebase/firebase";
import { useAuthStore } from "./authStore";

export const useUserStore = create(
  persist(
    (set, get) => ({
      addresses: [],
      loading: false,
      error: null,

      // Fetch user addresses
      fetchAddresses: async () => {
        const { currentUser } = useAuthStore.getState();
        if (!currentUser || !db) return;
        
        set({ loading: true, error: null });
        try {
          const userDoc = await getDoc(doc(db, "users", currentUser.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            set({ addresses: userData.addresses || [], loading: false });
          } else {
            set({ addresses: [], loading: false });
          }
        } catch (error) {
          set({ error: error.message, loading: false });
        }
      },

      // Add new address
      addAddress: async (addressData) => {
        const { currentUser } = useAuthStore.getState();
        if (!currentUser) throw new Error("User not authenticated");
        
        if (!db) {
          // Demo mode - add to local state
          const newAddress = {
            ...addressData,
            id: `demo-address-${Date.now()}`
          };
          set(state => ({
            addresses: [...state.addresses, newAddress]
          }));
          return newAddress;
        }
        
        set({ error: null });
        try {
          const newAddress = {
            ...addressData,
            id: `addr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            createdAt: new Date().toISOString()
          };
          
          const userRef = doc(db, "users", currentUser.uid);
          await updateDoc(userRef, {
            addresses: arrayUnion(newAddress),
            updatedAt: new Date().toISOString()
          });
          
          set(state => ({
            addresses: [...state.addresses, newAddress]
          }));
          
          return newAddress;
        } catch (error) {
          set({ error: error.message });
          throw error;
        }
      },

      // Update existing address
      updateAddress: async (addressId, updatedData) => {
        const { currentUser } = useAuthStore.getState();
        if (!currentUser) throw new Error("User not authenticated");
        
        if (!db) {
          // Demo mode - update local state
          set(state => ({
            addresses: state.addresses.map(addr => 
              addr.id === addressId ? { ...addr, ...updatedData } : addr
            )
          }));
          return;
        }
        
        set({ error: null });
        try {
          const { addresses } = get();
          const addressIndex = addresses.findIndex(addr => addr.id === addressId);
          
          if (addressIndex === -1) {
            throw new Error("Address not found");
          }
          
          const updatedAddress = {
            ...addresses[addressIndex],
            ...updatedData,
            updatedAt: new Date().toISOString()
          };
          
          const newAddresses = [...addresses];
          newAddresses[addressIndex] = updatedAddress;
          
          const userRef = doc(db, "users", currentUser.uid);
          await updateDoc(userRef, {
            addresses: newAddresses,
            updatedAt: new Date().toISOString()
          });
          
          set({ addresses: newAddresses });
        } catch (error) {
          set({ error: error.message });
          throw error;
        }
      },

      // Delete address
      deleteAddress: async (addressId) => {
        const { currentUser } = useAuthStore.getState();
        if (!currentUser) throw new Error("User not authenticated");
        
        if (!db) {
          // Demo mode - remove from local state
          set(state => ({
            addresses: state.addresses.filter(addr => addr.id !== addressId)
          }));
          return;
        }
        
        set({ error: null });
        try {
          const { addresses } = get();
          const addressToDelete = addresses.find(addr => addr.id === addressId);
          
          if (!addressToDelete) {
            throw new Error("Address not found");
          }
          
          const userRef = doc(db, "users", currentUser.uid);
          await updateDoc(userRef, {
            addresses: arrayRemove(addressToDelete),
            updatedAt: new Date().toISOString()
          });
          
          set(state => ({
            addresses: state.addresses.filter(addr => addr.id !== addressId)
          }));
        } catch (error) {
          set({ error: error.message });
          throw error;
        }
      },

      // Get address by ID
      getAddressById: (addressId) => {
        const { addresses } = get();
        return addresses.find(addr => addr.id === addressId);
      },

      // Set default address
      setDefaultAddress: async (addressId) => {
        const { currentUser } = useAuthStore.getState();
        if (!currentUser) throw new Error("User not authenticated");
        
        set({ error: null });
        try {
          const { addresses } = get();
          const updatedAddresses = addresses.map(addr => ({
            ...addr,
            isDefault: addr.id === addressId
          }));
          
          if (db) {
            const userRef = doc(db, "users", currentUser.uid);
            await updateDoc(userRef, {
              addresses: updatedAddresses,
              updatedAt: new Date().toISOString()
            });
          }
          
          set({ addresses: updatedAddresses });
        } catch (error) {
          set({ error: error.message });
          throw error;
        }
      },

      // Get default address
      getDefaultAddress: () => {
        const { addresses } = get();
        return addresses.find(addr => addr.isDefault) || addresses[0];
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: "user-storage",
      partialize: (state) => ({ addresses: state.addresses }),
    }
  )
);